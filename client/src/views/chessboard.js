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


const pageTemplate = (board, players, history, onSubmit, onReady) => html `
<div id="board-page">
    <div id="board-id">
    ${board}
    </div>
    ${chatTemplate(history, players, onSubmit, onReady)}
</div>`;

const chatTemplate = (history, players, onSubmit, onReady) => html `
<div id="side-menu">
    <div id="timer-wrapper">
    ${timerTemplate(players, onReady)}
    </div>
    <div id="chat-menu">
        <textarea disabled .value=${history} id="chat-area"></textarea>
        <form @submit=${onSubmit} id="chat-form">
            <input type="text" name="message" id="chat-message" placeholder="Aa" autocomplete="off" />
            <input type="submit" value="Send" id="chat-button" />
        </form>
    </div>
</div>`;


const timerTemplate = (players, onReady) => html `
<div id="timer-wrap">
    <div id="clock-wrap">
        <div id="name-box" class="player-1">
            ${players[0]}
        </div>
        <div id="player__digits">
        <span id="min1">10</span>:<span id="sec1">00</span>
        </div>
        <button class="timer__start-bttn" type="button" onclick=${onReady}>READY</button>
    </div>
    <div id="two-point">
    :
    </div>
    <div id="clock-wrap" class="player-2">
        <div id="name-box">
            ${players[1]}
        </div>
        <div id="player__digits">
        <span id="min2">10</span>:<span id="sec2">00</span>
        </div>
        <button class="timer__start-bttn" type="button" onclick=${onReady}>READY</button>
    </div>
</div>
`;


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
        view = createView(ctx);
    } else if (ctx.appState.game.roomId != roomId) {
        log("- game ID mismatch");
        const oldGame = ctx.appState.game;
        // Wait for this promise to ensure a connection was established in the first place
        oldGame.contentReady.then(() => {
            oldGame.disconnect();
        });
        view = createView(ctx);
    }
}

async function createView(ctx) {
    const roomId = ctx.params.id;
    const roomData = await getLobby(roomId);
    const isUserPartOfRoom = roomData.players.filter(p => p.username === ctx.appState.user.username)[0] !== undefined;

    if (roomData.players.length < 2) {
        showError(`Room "${roomData.name}" has less than 2 players.`);
        return ctx.page.redirect("/");
    } else if (!isUserPartOfRoom) {
        showError(`You are not joined to room "${roomData.name}".`);
        return ctx.page.redirect("/");
    }

    const secondPlayer = roomData.players.filter(p => p.username !== ctx.appState.user.username)[0];
    // eslint-disable-next-line require-atomic-updates
    ctx.appState.game = createGame(ctx.appState.user, secondPlayer, roomId, update);
    ctx.appState.game.contentReady.catch(() => {
        delete ctx.appState.game;
        ctx.page.redirect("/rooms");
    });

    // Redraw chat on every update - new messages are displayed via update
    // Cache game screen indefinetly - its contents are controlled via Canvas

    return render();

    function render() {
        view = pageTemplate(ctx.appState.game.canvas,
            ctx.appState.game.players,
            ctx.appState.game.chat.map(toText).join("\n"),
            onMessageSubmit,
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