import { io } from "http://localhost:5000/socket.io/socket.io.esm.min.js";
import { createGame } from "../engine/game.js";
import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";


let game = null;
let scene = null;

const pageTemplate = (readyPromise, board) => html`
<h1>Chessboard</h1>
${board}
${until(readyPromise, spinner())}`;

export function chessBoard(ctx) {
    if (!ctx.appState.user) {
        // TODO this should either include a return address or appear as a modal
        return ctx.page.redirect("/login");
    }
    const roomId = ctx.params.id;
    if (!game) {
        game = connect(ctx, roomId);
    }
    if (!scene) {
        scene = createGame();
    }

    return pageTemplate(loadGame(ctx, game), scene.render(game));
}

async function loadGame(ctx, game) {
    await game.ready;

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
                username: game.user.username,
                message
            });
            event.target.reset();
            ctx.update();
        }
    }
}

function toText({ username, message }) {
    return `${username == game.user.username ? "You" : username}: ${message}`;
}

function connect(ctx, roomId) {
    const token = ctx.appState.user.accessToken;
    let onReady = null;
    let onError = null;

    const game = {
        user: ctx.appState.user,
        connected: false,
        chat: [],
        ready: new Promise((res, rej) => {
            onReady = res;
            onError = rej;
        }),
        sendMessage(data) {
            socket.emit("message", data);
        },
        action(move) {
            if (move) {
                socket.emit("action", move);
            } else {
                ctx.update();
            }
        }
    };

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
            game.connected = true;
            onReady();
        } else {
            onError("Authorization failed");
        }
    });

    socket.on("state", (data) => {
        console.log(data);
        scene.setState(data);
        ctx.update();
    });

    socket.on("message", (data) => {
        game.chat.push(data);
        ctx.update();
    });

    socket.on("history", (data) => {
        if (typeof game.initGame == "function") {
            game.initGame();
        }

        game.chat = data;
        ctx.update();
    });

    return game;
}