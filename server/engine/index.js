import { Server } from "socket.io";

import { ioWrap } from "./util.js";
import mockGameData from "../middlewares/mockGameData.js";


// TODO this will be stored in the database;
// rooms will be initialized by the game controller;
// users connecting without and asisgned room will be booted
const rooms = {};

export default function setupEngine(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
            methods: ["GET", "POST"],
        }
    });

    // TODO add REAL auth and storage middlewares
    io.use(ioWrap(mockGameData()));

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
    registerMessageHandlers(socket);
}

/**
 * @param {import('../node_modules/socket.io/dist/socket').Socket} socket Connection socket
 */
function registerMessageHandlers(socket) {
    const games = socket.request.games;
    let player = null;
    let room = null;


    socket.on("auth", ({ roomId, token }) => {
        console.log(roomId, token);
        const players = games.players[roomId] || {};
        room = games.rooms.find(r => r.id == roomId);
        console.log(players, room);

        const foundPlayer = Object.entries(players).find(([seat, p]) => p.playerId == token);
        if (foundPlayer) {
            player = foundPlayer[1];
            socket.join(room.name);
            socket.emit("auth", true);
        } else {
            socket.emit("auth", false);
        }
    });

    socket.on("message", (message) => {
        console.log(message);
        socket.to(room.name).emit("message", `${player.username}: ${message}`);
    });
}