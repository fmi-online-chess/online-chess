import { Server } from "socket.io";

import { ioWrap } from "./util.js";
import auth from "../middlewares/auth.js";
import { getRoomDetails } from "../services/roomService.js";
import { createGame } from "./game.js";


const activeGames = {};

export default function setupEngine(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
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
    socket.on("auth", async ({ roomId, token }) => {
        let userData = null;
        try {
            userData = socket.request.auth.parseToken(token);
        } catch (err) {
            socket.emit("auth", false);
        }
        const room = await getRoomDetails(roomId);
        const player = room.players.find(p => p._id == userData._id);
        if (player) {
            socket.join(room._id);
            registerMessageHandlers(socket, player, room);
            socket.emit("auth", true);
            socket.emit("history", room.chatHistory);
            socket.emit("state", room.state);
        } else {
            socket.emit("auth", false);
            socket.disconnect();
        }
    });
}

/**
 * @param {import('../node_modules/socket.io/dist/socket').Socket} socket Connection socket
 */
function registerMessageHandlers(socket, player, room) {
    if (activeGames[room._id] == undefined) {
        activeGames[room._id] = createGame(room.state);
    }
    const game = activeGames[room._id];

    socket.on("message", (message) => {
        const data = { username: player.username, message };
        room.chatHistory.push(data);
        socket.to(room._id).emit("message", data);
        room.save();
    });

    socket.on("action", async (action) => {
        console.log(action);
        if (game.move(action)) {
            const newState = game.serialize();
            room.state = newState;
            await room.save();
            socket.emit("state", newState);
            socket.to(room._id).emit("state", newState);
        }
    });
}