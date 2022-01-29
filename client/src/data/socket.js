import { io } from "http://localhost:5000/socket.io/socket.io.esm.min.js";
import { log } from "../util/logger.js";


export async function connect(roomId, userData) {
    return new Promise((resolve, reject) => {
        const token = userData.accessToken;
        let authorized = false;

        const connection = {
            sendMessage(data) {
                socket.emit("message", data);
            },
            action(move) {
                socket.emit("action", move);
            },
            select(position) {
                socket.emit("select", position);
            },
            disconnect() {
                socket.disconnect();
            },
            onAction: null,
            onMoves: null,
            onState: null,
            onMessage: null,
            onHistory: null,
            onError: null
        };
        bufferedEventListener(connection, "onAction");
        bufferedEventListener(connection, "onMoves");
        bufferedEventListener(connection, "onState");
        bufferedEventListener(connection, "onMessage");
        bufferedEventListener(connection, "onHistory");
        bufferedEventListener(connection, "onError");

        const socket = io("http://localhost:5000");

        socket.on("auth", (success) => {
            if (success) {
                log("Authorized with server");
                authorized = true;
                resolve(connection);
            } else {
                reject("Authorization failed");
            }
        });

        socket.on("action", (data) => {
            log(authorized, data);
            if (authorized) {
                connection.onAction(data);
            }
        });

        socket.on("moves", (data) => {
            log(authorized, data);
            if (authorized) {
                connection.onMoves(data);
            }
        });

        socket.on("state", (data) => {
            log(authorized, data);
            if (authorized) {
                connection.onState(data);
            }
        });

        socket.on("message", (data) => {
            log(authorized, data);
            if (authorized) {
                connection.onMessage(data);
            }
        });

        socket.on("history", (data) => {
            log(authorized, data);
            if (authorized) {
                connection.onHistory(data);
            }
        });

        socket.on("error", (error) => {
            log(authorized, error);
            connection.onError(error);
        });

        // Bind this last, to avoid some exotic race conditions
        socket.on("connect", () => {
            log("Connected");
            socket.emit("auth", {
                roomId,
                token
            });
        });
    });
}

function bufferedEventListener(connection, prop) {
    const buffer = [];
    let listener = (...values) => {
        log("called before binding");
        buffer.push(values);
    };

    Object.defineProperty(connection, prop, {
        get: () => listener,
        set: (newListener) => {
            listener = newListener;
            for (let values of buffer) {
                listener(...values);
            }
        }
    });
}