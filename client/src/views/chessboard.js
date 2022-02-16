import { html } from "../lib.js";
import { log } from "../util/logger.js";
import { showError } from "../util/notify.js";
import { getLobby } from "../data/rooms.js";
import { createGame } from "../engine/index.js";
import { createTimer } from "./common/timer.js";
import spinner from "./common/spinner.js";


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
                <a href="javascript:void(0)" class="modal-close">See board</a>
            </div>
        </section>
    </section>
</section>`;

const chatTemplate = (history, players, onSubmit, time, onReady) => html`
<div id="side-menu">
    ${createTimer(players, time, onReady)}
    ${onSubmit == null ? null : html`
    <div id="chat-menu">
        <textarea disabled .value=${history} id="chat-area"></textarea>
        <form @submit=${onSubmit} id="chat-form">
            <input type="text" name="message" id="chat-message" placeholder="Aa" autocomplete="off" />
            <input type="submit" value="Send" id="chat-button" />
        </form>
    </div>`}
</div>`;


let view = null;

export function chessboard(ctx) {
    const roomId = ctx.params.id;
    const isSpectator = ctx.query.spectate != undefined;
    if (!isSpectator && !ctx.appState.user) {
        return ctx.page.redirect(`/login?origin=/rooms/${roomId}/board`);
    }
    validateGame(ctx, roomId, isSpectator);

    return view || html`
    <div id="board-page">
        <div id="board-id" class="waiting-opponent">
            <img src="/static/icon.png" alt="Chess Knight Icon" />
            ${spinner("Waiting for opponent to join")}
            <button @click=${onReturnToLobby}>Back to lobby</button>
        </div>
    </div>`;

    async function onReturnToLobby() {
        ctx.page.redirect(`/rooms/${roomId}`);
    }
}

function validateGame(ctx, roomId, isSpectator) {
    if ((view == null) || !ctx.appState.game) {
        log("- no view or game not initialized");
        createView(ctx, isSpectator);
    } else if (ctx.appState.game.roomId != roomId) {
        log("- game ID mismatch");
        view = null;
        const oldGame = ctx.appState.game;
        // Wait for this promise to ensure a connection was established in the first place
        oldGame.contentReady.then(() => {
            oldGame.disconnect();
        });
        createView(ctx, isSpectator);
    }
}

async function createView(ctx, isSpectator) {
    const roomId = ctx.params.id;
    let roomData;

    try {
        roomData = await getLobby(roomId);
    } catch (err) {
        return ctx.page.redirect("/rooms");
    }
    const isUserPartOfRoom = ctx.appState.user !== undefined &&
        roomData.players.filter(p => p.username === ctx.appState.user.username)[0] !== undefined;

    if (!isSpectator && !isUserPartOfRoom) {
        showError(`You are not joined to room "${roomData.name}".`);
        return ctx.page.redirect(`/rooms/${roomId}`);
    } else if (isSpectator && isUserPartOfRoom) {
        showError("You cannot spectate a game you are playing.");
        return ctx.page.redirect(`/rooms/${roomId}`);
    }

    const playerNames = roomData.players.map(p => p.username);
    if (roomData.white == 1) {
        playerNames.reverse();
    }
    // eslint-disable-next-line require-atomic-updates
    ctx.appState.game = createGame(ctx.appState.user, playerNames, roomId, update, updateTimer, isSpectator);
    ctx.appState.game.contentReady.catch(() => {
        delete ctx.appState.game;
        ctx.page.redirect("/rooms");
    });

    // Redraw chat on every update - new messages are displayed via update
    // Cache game screen indefinetly - its contents are controlled via Canvas

    const time = {
        white: Math.round(roomData.startingTime / 1000),
        black: Math.round(roomData.startingTime / 1000),
        current: null,
        localBlack: false,
        playersReady: new Set()
    };

    return render();

    function updateTimer(packet) {
        if (typeof packet == "string") {
            time.localBlack = ctx.appState.game.color == "B";
            time.playersReady.add(packet);
        } else {
            const [white, black, current, localBlack] = packet;
            time.white = white;
            time.black = black;
            time.current = current;
            time.localBlack = localBlack;
        }

        update();
    }

    function render() {
        view = pageTemplate(ctx.appState.game.canvas,
            ctx.appState.game.players,
            ctx.appState.game.chat.map(toText).join("\n"),
            isSpectator ? null : onMessageSubmit,
            time,
            isSpectator ? null : onReady);
        return view;
    }

    function update() {
        render();
        ctx.update();
    }

    function toText({ username, message }) {
        return `${(ctx.appState.user && username == ctx.appState.user.username) ? "You" : username}: ${message}`;
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
        ctx.appState.game.onPlayerReady();
    }
}