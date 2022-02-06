import { connect } from "../data/socket.js";
import { createController } from "./board.js";
import { showError } from "../util/notify.js";


export function createGame(userData, secondPlayer, roomId, onUpdate) {
    const readyState = {};

    const game = {
        roomId,
        players: [ userData.username, secondPlayer.username ],
        ready: false,
        contentReady: new Promise((resolve, reject) => {
            readyState.resolve = resolve;
            readyState.reject = reject;
        }),
        chat: [],
        update: onUpdate,
        canvas: null
    };

    initGame(game, userData, roomId, readyState);
    return game;
}

async function initGame(game, userData, roomId, readyState) {
    try {
        const connection = await connect(roomId, userData);
        const board = createController(connection.action, connection.select);

        connection.onAction = (data) => {
            board.onAction(data);
        };
        connection.onMoves = (data) => {
            board.onMoves(data);
        };
        connection.onState = (data) => {
            board.setState(data);
        };
        connection.onMessage = (data) => {
            game.chat.push(data);
            game.update();
        };
        connection.onHistory = (data) => {
            game.chat = data;
            game.update();
        };

        game.sendMessage = (message) => {
            game.chat.push(message);
            connection.sendMessage(message.message);
        };
        game.disconnect = connection.disconnect;
        game.canvas = board.canvas;

        game.ready = true;
        readyState.resolve();
        game.update();
    } catch (err) {
        const message = typeof err == "string" ? err : err.message;
        showError(message);
        readyState.reject(err);
    }
}