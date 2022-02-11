import { connect } from "../data/socket.js";
import { createController } from "./board.js";
import { showError, showInfo } from "../util/notify.js";
import { showModal } from "../util/modal.js";


export function createGame(userData, playerNames, roomId, onUpdate, updateTimer, isSpectator = false) {
    const readyState = {};

    const game = {
        roomId,
        players: playerNames,
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
        onPlayerReady: () => { }
    };

    initGame(game, userData, roomId, readyState, isSpectator);

    return game;
}

async function initGame(game, userData, roomId, readyState, isSpectator) {
    try {
        const connection = await connect(roomId, userData, isSpectator);
        const board = createController(connection.action, connection.select, connection.color, game.updateTimer, isSpectator);

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
            showModal(data, game.color, game.players, isSpectator);
            board.onAction(data);
            game.chat.push({ username: "Conclusion", message: data });
            game.update();
        };
        connection.onPlayerReady = (color) => {
            game.updateTimer(color);
        };

        if (isSpectator) {
            // Disable interactivity

            connection.action = () => { };
            connection.select = () => { };
            connection.sendMessage = () => { };
            connection.sendReady = () => { };
        } else {
            game.sendMessage = (message) => {
                game.chat.push(message);
                connection.sendMessage(message.message);
            };
            game.onPlayerReady = () => {
                connection.sendReady();
            };
        }

        game.disconnect = connection.disconnect;

        game.color = isSpectator ? "W" : connection.color;
        if (game.color == "B") {
            game.players.reverse();
        }
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