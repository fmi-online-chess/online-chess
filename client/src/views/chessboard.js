import {
    createGame
} from "../engine/index.js";
import {
    getLobby
} from "../data/rooms.js";
import {
    html
} from "../lib.js";
import {
    log
} from "../util/logger.js";
import {
    showError
} from "../util/notify.js";
import { createTimer } from "./common/timer.js";


const pageTemplate = (board, players, history, onSubmit, time, onReady) => html`
<div id="board-page">
    <div id="board-id">
        ${board}
    </div>
    ${chatTemplate(history, players, onSubmit, time, onReady)}
</div>
<section class="modal">
    <section class="dialog-container">
        <section id="dialog">
            <h1 class="title"></h1>
            <p class="info"></p>
            <div class="buttons">
                <a href="/rooms">Play again</a>
            </div>
        </section>
    </section>
</section>`;

const chatTemplate = (history, players, onSubmit, time, onReady) => html`
<div id="side-menu">
    ${createTimer(players, time, onReady)}
    <div id="chat-menu">
        <textarea disabled .value=${history} id="chat-area"></textarea>
        <form @submit=${onSubmit} id="chat-form">
            <input type="text" name="message" id="chat-message" placeholder="Aa" autocomplete="off" />
            <input type="submit" value="Send" id="chat-button" />
        </form>
    </div>
</div>`;


let view = null;

export function chessboard(ctx) {
    const roomId = ctx.params.id;
    if (!ctx.appState.user) {
        return ctx.page.redirect(`/login?origin=/rooms/${roomId}/board`);
    }
    validateGame(ctx, roomId);

    return view;
}

function validateGame(ctx, roomId) {
    if ((view == null) || !ctx.appState.game) {
        log("- no view or game not initialized");
        createView(ctx);
    } else if (ctx.appState.game.roomId != roomId) {
        log("- game ID mismatch");
        const oldGame = ctx.appState.game;
        // Wait for this promise to ensure a connection was established in the first place
        oldGame.contentReady.then(() => {
            oldGame.disconnect();
        });
        createView(ctx);
    }
}

async function createView(ctx) {
    const roomId = ctx.params.id;
    const roomData = await getLobby(roomId);
    const isUserPartOfRoom = roomData.players.filter(p => p.username === ctx.appState.user.username)[0] !== undefined;

    if (roomData.players.length < 2) {
        showError(`Room "${roomData.name}" has less than 2 players.`);
        return ctx.page.redirect("/rooms");
    } else if (!isUserPartOfRoom) {
        showError(`You are not joined to room "${roomData.name}".`);
        return ctx.page.redirect("/rooms");
    }

    const secondPlayer = roomData.players.filter(p => p.username !== ctx.appState.user.username)[0];
    // eslint-disable-next-line require-atomic-updates
    ctx.appState.game = createGame(ctx.appState.user, secondPlayer, roomId, update, updateTimer);
    ctx.appState.game.contentReady.catch(() => {
        delete ctx.appState.game;
        ctx.page.redirect("/rooms");
    });

    // Redraw chat on every update - new messages are displayed via update
    // Cache game screen indefinetly - its contents are controlled via Canvas

    const time = {
        white: 900,
        black: 900,
        current: null,
        localBlack: false
    };

    return render();

    function updateTimer([white, black, current, localBlack]) {
        time.white = white;
        time.black = black;
        time.current = current;
        time.localBlack = localBlack;
        update();
    }

    function render() {
        view = pageTemplate(ctx.appState.game.canvas,
            ctx.appState.game.players,
            ctx.appState.game.chat.map(toText).join("\n"),
            onMessageSubmit,
            time,
            onReady);
        return view;
    }

    function update() {
        render();
        ctx.update();
    }

    function toText({
        username,
        message
    }) {
        return `${username == ctx.appState.user.username ? "You" : username}: ${message}`;
    }

    function onMessageSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const message = formData.get("message").trim();

        if (message) {
            ctx.appState.game.sendMessage({
                username: ctx.appState.user.username,
                message
            });
            event.target.reset();
            update();
        }
    }

    function onReady(event) {
        event.preventDefault();
        document.getElementById("player__digits").classList.add("active");
    }
}