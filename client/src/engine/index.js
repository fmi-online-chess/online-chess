import { connect } from "../data/socket.js";
import { createController } from "./board.js";
import { showError, showInfo } from "../util/notify.js";
import { showModal } from "../util/modal.js";


export function createGame(userData, opponent, roomId, onUpdate, updateTimer, isSpectator = false) {
    const readyState = {};

    const game = {
        roomId,
        players: [ userData.username, opponent.username ],
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

    if (isSpectator) {
        initSpectator(game, userData, roomId, readyState);
    } else {
        initGame(game, userData, opponent, roomId, readyState);
    }
    return game;
}

async function initSpectator(game, userData, roomId, readyState) {
    try {
        const connection = await connect(roomId, userData, true);
        const board = createController(connection.action, connection.select, connection.color, game.updateTimer, true);

        connection.sendMessage = () => {};
        connection.action = () => {};
        connection.select = () => {};
        connection.sendReady = () => {};

        connection.onAction = (data) => {
            board.onAction(data);
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
            showModal(data, connection.color, opponent.username);
            board.onAction(data);
            game.chat.push({username: "Conclusion", message: data});
            game.update();
        };
        connection.onPlayerReady = (color) => {
            game.updateTimer(color);
        }; 

        game.disconnect = connection.disconnect;

        game.color = "W";
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

async function initGame(game, userData, opponent, roomId, readyState) {
    try {
        const connection = await connect(roomId, userData, false);
        const board = createController(connection.action, connection.select, connection.color, game.updateTimer, false);

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
            showModal(data, connection.color, opponent.username);
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
            connection.sendReady();
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