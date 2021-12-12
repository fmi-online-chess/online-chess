import { connect } from "../data/socket.js";
import { createController } from "./board.js";


export function createGame(userData, roomId, onUpdate) {
    const readyState = {};

    const game = {
        roomId,
        username: userData.username,
        ready: false,
        contentReady: new Promise((resolve, reject) => {
            readyState.resolve = resolve;
            readyState.reject = reject;
        }),
        chat: [],
        update: onUpdate
    };

    initGame(game, userData, roomId, readyState);
    return game;
}

async function initGame(game, userData, roomId, readyState) {
    try {
        const connection = await connect(roomId, userData);
        const board = createController();

        connection.onAction = (data) => {
            board.onAction(data);
            game.update();
        };
        connection.onState = (data) => {
            board.setState(data);
            game.update();
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
        game.render = () => board.render(connection);
        game.disconnect = connection.disconnect;

        game.ready = true;
        readyState.resolve();
    } catch (err) {
        alert(err.message);
        readyState.reject(err);
    }
}