import { io } from "http://localhost:5000/socket.io/socket.io.esm.min.js";
import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";


let game = null;

const boardTemplate = (readyPromise) => html`
<h1>Chessboard</h1>
${until(readyPromise, spinner())}`;

export function chessBoard(ctx) {
    const roomId = ctx.params.id;
    if (!game) {
        game = connect(roomId);
    }

    return boardTemplate(loadGame(game));
}

async function loadGame(game) {
    game.onChat = onChat;
    await game.ready;

    return html`
    <textarea disabled></textarea>
    <form @submit=${onSubmit}>
        <input type="text" name="message"><input type="submit" value="Send">
    </form>`;

    function onChat(message) {
        document.querySelector("textarea").value += message;
        document.querySelector("textarea").value += "\n";
    }

    function onSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const message = formData.get("message").trim();

        if (message) {
            game.sendMessage(message);
            game.chat.push(message);
            document.querySelector("textarea").value += "You: ";
            document.querySelector("textarea").value += message;
            document.querySelector("textarea").value += "\n";
            event.target.reset();
        }
    }
}

function connect(roomId) {
    const token = localStorage.getItem("gameToken");
    let onReady = null;
    let onError = null;

    const game = {
        connected: false,
        chat: [],
        ready: new Promise((res, rej) => {
            onReady = res;
            onError = rej;
        }),
        onChat: null,
        sendMessage(data) {
            socket.emit("message", data);
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

    socket.on("action", (data) => {
        console.log(data);
    });

    socket.on("message", (data) => {
        game.chat.push(data);

        if (typeof game.onChat == "function") {
            game.onChat(data);
        }
    });

    return game;
}