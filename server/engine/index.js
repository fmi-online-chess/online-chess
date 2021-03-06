import { EventEmitter } from "events";
import { Server } from "socket.io";

import { ioWrap } from "./util.js";
import auth from "../middlewares/auth.js";
import { getRoomDetails } from "../services/roomService.js";
import { createGame } from "./game.js";


const lobbies = {};
const activeGames = {};

export default function setupEngine(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:8080", "http://127.0.0.1:8080", "https://fmi-online-chess.github.io"],
            methods: ["GET", "POST"],
        }
    });

    io.use(ioWrap(auth()));

    io.on("connection", onConnect);

    // This fix is required because CORS options do not propagate to file request for some reason
    server.prependListener("request", (req, res) => {
        if (req.url.includes("socket.io.esm.min.js")) {
            console.log("Requesting client package");
            res.setHeader("Access-Control-Allow-Origin", "*");
        }
    });
}

/**
 * @param {import('../node_modules/socket.io/dist/socket').Socket} socket Connection socket
 */
function onConnect(socket) {
    // Determine if the user is part of an ongoing game
    // - if yes, send them to the room
    // - if no, respond with error

    console.log("a user connected");

    // Player mode
    socket.on("auth", async ({ roomId, token }) => {
        let userData = null;
        try {
            userData = socket.request.auth.parseToken(token);
        } catch (err) {
            socket.emit("auth", { color: false });
            return socket.disconnect();
        }
        const room = await getRoomDetails(roomId);
        const player = room.players.find(p => p._id == userData._id);

        if (isGameGoing(room, socket)) {
            if (player) {
                joinWaitingLobby(room._id, userData._id, () => sendPlayerPackets(roomId, socket, userData, player));
            } else {
                socket.emit("auth", { color: false });
                return socket.disconnect();
            }
        }
    });

    // Spectator mode
    socket.on("spectate", async (roomId) => {
        const room = await getRoomDetails(roomId);

        if (isGameGoing(room, socket)) {
            joinWaitingLobby(room._id, null, () => sendSpectatorPackets(room, socket));
        }
    });
}

function isGameGoing(room, socket) {
    const lastMove = room.history[room.history.length - 1];
    if (lastMove && lastMove.includes("-")) {
        socket.emit("conclusion", lastMove);
        socket.disconnect();
        return false;
    } else {
        return true;
    }
}

function joinWaitingLobby(roomId, playerId, callback) {
    if (lobbies[roomId] == undefined) {
        console.log("Creating waiting lobby");
        lobbies[roomId] = new EventEmitter();
        lobbies[roomId].players = new Set();
    }
    const lobby = lobbies[roomId];

    if (lobby.players.size == 2) {
        callback();
    } else {
        lobby.on("player_connected", () => {
            if (lobby.players.size == 2) {
                callback();
            }
        });
        if (playerId) {
            lobby.players.add(playerId);
            lobby.emit("player_connected", playerId);
        }
    }
}

async function sendPlayerPackets(roomId, socket, userData, player) {
    const room = await getRoomDetails(roomId);
    const playerColor = room.players[room.white]?.id == userData._id ? "W" : "B";
    const state = initGameAndHandlers(socket, player, playerColor, room);
    const playerNames = room.players.map(p => p.username);
    if (room.white == 1) {
        playerNames.reverse();
    }
    socket.emit("auth", { color: playerColor, playerNames: playerNames });
    socket.emit("history", room.chatHistory);
    socket.emit("state", state);
}

function sendSpectatorPackets(room, socket) {
    const state = initSpectatorHandlers(socket, room);
    socket.emit("auth-spectate", { playerNames: room.players.map(p => p.username) });
    socket.emit("history", room.chatHistory);
    socket.emit("state", state);
}

/**
 * @param {import('../node_modules/socket.io/dist/socket').Socket} socket Connection socket
 */
function initGameAndHandlers(socket, player, playerColor, room) {
    if (activeGames[room._id] == undefined) {
        console.log("setting up room in memory");
        activeGames[room._id] = createGame(room);
    }

    const game = activeGames[room._id];
    const roomId = room._id.toString();
    socket.join(roomId);

    console.log(playerColor, "Player status: " + game.playerStatus(playerColor));

    const currentState = game.serialize();
    const timerAsString = applyTimer(room, game, currentState[0]);

    socket.on("message", (message) => {
        console.log(player.username, ">>>", message);
        const data = { username: player.username, message };
        room.chatHistory.push(data);
        socket.to(roomId).emit("message", data);
        room.save();
    });

    socket.on("action", async (action) => {
        console.log(player.username, ">>>", action);
        if (game.concluded) {
            return;
        }

        const timerAsString = applyTimer(room, game, action[0]);
        if (game.remainingWhite <= 0) {
            return await endGame("timeout", "B");
        } else if (game.remainingBlack <= 0) {
            return await endGame("timeout", "W");
        }

        const currentState = game.serialize();

        if (action[0] != playerColor || currentState[0] != playerColor) {
            return;
        } else if (game.move(action)) {
            const newState = game.serialize();
            room.state = newState;
            room.history.push(action);


            await room.save();

            socket.emit("action", timerAsString + action);
            socket.to(roomId).emit("action", timerAsString + action);

            const opponentStatus = game.playerStatus(action[0] == "B" ? "W" : "B");
            if (opponentStatus != "ok") {
                await endGame(opponentStatus, action);
            }
        }
    });

    socket.on("select", async (position) => {
        console.log(player.username, ">>>", position);
        socket.emit("moves", game.validMoves(position));
    });

    socket.on("ready", async () => {
        if (game.playersReady.includes(playerColor) == false) {
            game.playersReady.push(playerColor);
            room.playersReady.push(playerColor);

            socket.emit("playerReady", playerColor);
            socket.to(roomId).emit("playerReady", playerColor);

            console.log("Player ready", game.playersReady);
        }
        if (game.playersReady.length >= 2 && game.started == null) {
            console.log("starting timers");

            game.started = Date.now();
            game.remainingWhite = room.startingTime;
            game.remainingBlack = room.startingTime;
            game.lastMoved = game.started;

            room.started = game.started;

            const currentState = game.serialize();
            const timerAsString = applyTimer(room, game, currentState[0]);

            socket.emit("state", timerAsString + currentState);
            socket.to(roomId).emit("state", timerAsString + currentState);
        }
        if (room.isModified()) {
            await room.save();
        }
    });

    return timerAsString + currentState;

    async function endGame(opponentStatus, action) {
        let status;
        if (opponentStatus == "check mate") {
            status = action[0] == "B" ? "0-1" : "1-0";
        } else if (opponentStatus == "timeout") {
            status = action[0] == "B" ? "0-1 timeout" : "1-0 timeout";
        } else if (opponentStatus == "stalemate") {
            status = "1/2-1/2";
        }

        room.history.push(status);
        room.concluded = true;
        game.concluded = true;
        await room.save();

        socket.emit("conclusion", status);
        socket.to(roomId).emit("conclusion", status);
    }
}

/**
 * @param {import('../node_modules/socket.io/dist/socket').Socket} socket Connection socket
 */
function initSpectatorHandlers(socket, room) {
    if (activeGames[room._id] == undefined) {
        console.log("setting up room in memory");
        activeGames[room._id] = createGame(room);
    }

    const game = activeGames[room._id];
    const roomId = room._id.toString();
    socket.join(roomId);

    const currentState = game.serialize();
    const timerAsString = applyTimer(room, game, currentState[0]);

    return timerAsString + currentState;
}

function applyTimer(room, game, action) {
    const now = Date.now();
    let result = "";

    if (game.started != null) {
        const delta = now - game.lastMoved;
        if (action[0] == "B") {
            game.remainingBlack -= delta;
        } else {
            game.remainingWhite -= delta;
        }
        result = `${Math.round(game.remainingWhite / 1000)}:${Math.round(game.remainingBlack / 1000)}:`;
    }
    // console.log(`White: ${game.remainingWhite}\nBlack: ${game.remainingBlack}`);

    game.lastMoved = now;

    room.remainingWhite = game.remainingWhite;
    room.remainingBlack = game.remainingBlack;
    room.lastMoved = game.lastMoved;

    return result;
}