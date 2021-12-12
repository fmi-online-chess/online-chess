import { connect } from "../data/socket.js";
import { createGame } from "../engine/game.js";
import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";


let game = null;
let scene = null;

const pageTemplate = (readyPromise, board) => html`
<h1>Chessboard</h1>
${board}
${until(readyPromise, spinner())}`;

export function chessboard(ctx) {
    const roomId = ctx.params.id;
    if (!ctx.appState.user) {
        return ctx.page.redirect(`/login?origin=/rooms/${roomId}/board`);
    }
    if (!game) {
        game = bindConnection(ctx, roomId);
    }
    if (!scene) {
        scene = createGame();
    }

    return pageTemplate(loadGame(ctx, game), scene.render(game));
}

async function loadGame(ctx, gamePromise) {
    game = await gamePromise;

    return html`
    <textarea disabled .value=${game.chat.map(toText).join("\n")}></textarea>
    <form @submit=${onSubmit}>
        <input type="text" name="message"><input type="submit" value="Send">
    </form>`;

    function onSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const message = formData.get("message").trim();

        if (message) {
            game.sendMessage(message);
            game.chat.push({
                username: ctx.appState.user.username,
                message
            });
            event.target.reset();
            ctx.update();
        }
    }

    function toText({ username, message }) {
        return `${username == ctx.appState.user.username ? "You" : username}: ${message}`;
    }
}

async function bindConnection(ctx, roomId) {
    const userData = ctx.appState.user;

    const game = {
        chat: [],
        sendMessage(data) {
            connection.sendMessage(data);
        },
        action(move) {
            if (move) {
                connection.action(move);
            } else {
                ctx.update();
            }
        }
    };

    const connection = await connect(roomId, userData);

    connection.onState = (data) => {
        scene.setState(data);
        ctx.update();
    };
    connection.onMessage = (data) => {
        game.chat.push(data);
        ctx.update();
    };
    connection.onHistory = (data) => {
        game.chat = data;
        ctx.update();
    };


    return game;
}