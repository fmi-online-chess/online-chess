import { io } from "http://localhost:5000/socket.io/socket.io.esm.min.js";


export async function connect(roomId, userData) {
    const token = userData.accessToken;

    const socket = await new Promise((resolve, reject) => {
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected");
            socket.emit("auth", {
                roomId,
                token
            });
        });

        socket.on("auth", (success) => {
            if (success) {
                console.log("Authorized with server");
                resolve(socket);
            } else {
                reject("Authorization failed");
            }
        });
    });

    const connection = {
        sendMessage(data) {
            socket.emit("message", data);
        },
        action(move) {
            socket.emit("action", move);
        },
        disconnect() {
            socket.disconnect();
        },
        onAction: null,
        onState: null,
        onMessage: null,
        onHistory: null,
        onError: null
    };

    socket.on("action", (data) => {
        console.log(data);
        if (typeof connection.onAction == "function") {
            connection.onAction(data);
        }
    });

    socket.on("state", (data) => {
        console.log(data);
        if (typeof connection.onState == "function") {
            connection.onState(data);
        }
    });

    socket.on("message", (data) => {
        console.log(data);
        if (typeof connection.onMessage == "function") {
            connection.onMessage(data);
        }
    });

    socket.on("history", (data) => {
        console.log(data);
        if (typeof connection.onHistory == "function") {
            connection.onHistory(data);
        }
    });

    socket.on("error", (error) => {
        console.log(error);
        if (typeof connection.onError == "function") {
            connection.onError(error);
        }
    });

    return connection;
}