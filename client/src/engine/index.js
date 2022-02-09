import { connect } from "../data/socket.js";
import { createController } from "./board.js";
import { showError, showInfo } from "../util/notify.js";


export function createGame(userData, secondPlayer, roomId, onUpdate, updateTimer) {
    const readyState = {};

    const game = {
        roomId,
        players: [ userData.username, secondPlayer.username ],
        color: null,
        ready: false,
        contentReady: new Promise((resolve, reject) => {
            readyState.resolve = resolve;
            readyState.reject = reject;
        }),
        chat: [],
        update: onUpdate,
        canvas: null,
        updateTimer,
        onPlayerReady: () => {}
    };

    initGame(game, userData, roomId, readyState);
    return game;
}

async function initGame(game, userData, roomId, readyState) {
    try {
        const connection = await connect(roomId, userData);
        const board = createController(connection.action, connection.select, connection.color, game.updateTimer);

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
        connection.onConclusion = (data) => {
            let message = "";
            if (data == "1-0") {
                message = "White player wins via checkmate";
            } else if (data == "0-1") {
                message = "Black player wins via checkmate";
            } else if (data == "1/2-1/2") {
                message = "Game ends in stalemate";
            }
            showInfo(message);
            board.onAction(data);
            game.chat.push({username: "Conclusion", message: data});
            game.update();
        };
        connection.onPlayerReady = (color) => {
            game.updateTimer(color);
        };

        game.sendMessage = (message) => {
            game.chat.push(message);
            connection.sendMessage(message.message);
        };
        game.onPlayerReady = () => {
            connection.ready();
        };
        game.disconnect = connection.disconnect;

        game.color = connection.color;
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