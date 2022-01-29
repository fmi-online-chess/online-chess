import { createGame } from "../engine/index.js";
import { getLobby } from "../data/rooms.js";
import { html } from "../lib.js";
import { log } from "../util/logger.js";


const pageTemplate = (board, players, history, onSubmit) => html `
<div id="board-page">
    <div id="board-id">
    ${board}
    </div>
    ${chatTemplate(history, players, onSubmit)}
</div>`;

const chatTemplate = (history, players, onSubmit) => html `
<div id="side-menu">
    <div id="timer-wrapper">
    ${timerTemplate(players)}
    </div>
    <div id="chat-menu">
        <textarea disabled .value=${history} id="chat-area"></textarea>
        <form @submit=${onSubmit} id="chat-form">
            <input type="text" name="message" id="chat-message" placeholder="Aa" autocomplete="off" />
            <input type="submit" value="Send" id="chat-button" />
        </form>
    </div>
</div>`;


const timerTemplate = (players) => html `
<div id="timer-wrap">
    <div id="clock-wrap">
        <div id="name-box">
            ${players[0]}
        </div>
        <div id="clock-box">
        15:00
        </div>
    </div>
    <div id="two-point">
    :
    </div>
    <div id="clock-wrap">
        <div id="name-box">
            ${players[1]}
        </div>
        <div id="clock-box">
        15:00
        </div>
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
    const secondPlayer = roomData.players.filter(p => p.username !== ctx.appState.user.username)[0];
    ctx.appState.game = createGame(ctx.appState.user, secondPlayer, roomId, update);

    // Redraw chat on every update - new messages are displayed via update
    // Cache game screen indefinetly - its contents are controlled via Canvas

    return render();

    function render() {
        view = pageTemplate(ctx.appState.game.canvas, 
                            ctx.appState.game.players,
                            ctx.appState.game.chat.map(toText).join("\n"), 
                            onMessageSubmit);
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
}