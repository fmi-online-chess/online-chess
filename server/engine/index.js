import { Server } from "socket.io";

import { ioWrap } from "./util.js";
import auth from "../middlewares/auth.js";
import { getRoomDetails } from "../services/roomService.js";


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
    registerMessageHandlers(socket);
}

/**
 * @param {import('../node_modules/socket.io/dist/socket').Socket} socket Connection socket
 */
function registerMessageHandlers(socket) {
    let player = null;
    let room = null;


    socket.on("auth", async ({ roomId, token }) => {
        let userData = null;
        try {
            userData = socket.request.auth.parseToken(token);
        } catch (err) {
            socket.emit("auth", false);
        }
        room = await getRoomDetails(roomId);

        const foundPlayer = room.players.find(p => p._id == userData._id);
        if (foundPlayer) {
            player = foundPlayer;
            socket.join(room._id);
            socket.emit("auth", true);
            socket.emit("history", room.chatHistory);
        } else {
            socket.emit("auth", false);
        }
    });

    socket.on("message", (message) => {
        const data = { username: player.username, message };
        room.chatHistory.push(data);
        socket.to(room._id).emit("message", data);
        room.save();
    });

    socket.on("action", (action) => {
        console.log(action);
        socket.to(room._id).emit("action", action);
    });
}