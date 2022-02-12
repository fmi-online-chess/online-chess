/* globals env */
import { log } from "../util/logger.js";


const hostname = env?.hostname || "http://localhost:5000";
const io = import(`${hostname}/socket.io/socket.io.esm.min.js`);

export async function connect(roomId, userData, isSpectator) {
    const ioModule = (await io).default;

    return new Promise((resolve, reject) => {
        const token = isSpectator ? null : userData.accessToken;
        let authorized = false;
        let initialized = false;

        const connection = {
            color: null,
            sendMessage(data) {
                socket.emit("message", data);
            },
            action(move) {
                socket.emit("action", move);
            },
            select(position) {
                socket.emit("select", position);
            },
            sendReady() {
                socket.emit("ready", true);
            },
            disconnect() {
                socket.disconnect();
            },
            onAction: null,
            onMoves: null,
            onState: null,
            onMessage: null,
            onHistory: null,
            onConclusion: null,
            onPlayerReady: null,
            onError: null
        };
        bufferedEventListener(connection, "onAction");
        bufferedEventListener(connection, "onMoves");
        bufferedEventListener(connection, "onState");
        bufferedEventListener(connection, "onMessage");
        bufferedEventListener(connection, "onHistory");
        bufferedEventListener(connection, "onConclusion");
        bufferedEventListener(connection, "onPlayerReady");
        bufferedEventListener(connection, "onError");

        const socket = ioModule(hostname);

        socket.on("auth", (color) => {
            if (color) {
                log("Authorized with server", color);
                connection.color = color;
                authorized = true;
                resolve(connection);
            } else {
                reject("Authorization failed");
            }
        });

        socket.on("auth-spectate", () => {
            connection.color = "W";
            resolve(connection);
        });

        socket.on("action", (data) => {
            log(authorized, data);
            if (authorized || isSpectator) {
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
            if (authorized || isSpectator) {
                initialized = true;
                connection.onState(data);
            }
        });

        socket.on("message", (data) => {
            log(authorized, data);
            if (authorized || isSpectator) {
                connection.onMessage(data);
            }
        });

        socket.on("history", (data) => {
            log(authorized, data);
            if (authorized || isSpectator) {
                connection.onHistory(data);
            }
        });

        socket.on("conclusion", (data) => {
            log("Game has concluded", data);
            if (initialized) {
                connection.onConclusion(data);
            } else {
                reject("Game has concluded: " + data);
            }
        });

        socket.on("playerReady", (data) => {
            log(authorized, data);
            if (authorized || isSpectator) {
                connection.onPlayerReady(data);
            }
        });

        socket.on("error", (error) => {
            log(authorized, error);
            connection.onError(error);
        });

        // Bind this last, to avoid some exotic race conditions
        socket.on("connect", () => {
            log("Connected");

            if (isSpectator) {
                socket.emit("spectate", roomId);
            } else {
                socket.emit("auth", {
                    roomId,
                    token
                });
            }
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