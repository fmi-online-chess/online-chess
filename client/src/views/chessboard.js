import {
    createGame
} from "../engine/index.js";
import {
    html
} from "../lib.js";


const pageTemplate = (board, history, onSubmit) => html `
<div id="board-page">
    <div id="board-id">
    ${board}
    </div>
    ${chatTemplate(history, onSubmit)}
</div>`;

const chatTemplate = (history, onSubmit) => html `
<div id="side-menu">
    <div id="timer-wrapper">
    ${timerTemplate()}
    </div>
    <div id="chat-menu">
        <textarea disabled .value=${history} id="chat-area"></textarea>
        <form @submit=${onSubmit} id="chat-form">
            <input type="text" name="message" id="chat-message" ><input type="submit" value="Send" id="chat-button">
        </form>
    </div>
</div>`;


const timerTemplate = () => html `
<div id="timer-wrap">
    <div id="clock-wrap">
        <div id="name-box">
            name1
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
            name2
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
        console.log("- no view or game not initialized");
        view = createView(ctx);
    } else if (ctx.appState.game.roomId != roomId) {
        console.log("- game ID mismatch");
        const oldGame = ctx.appState.game;
        // Wait for this promise to ensure a connection was established in the first place
        oldGame.contentReady.then(() => {
            oldGame.disconnect();
        });
        view = createView(ctx);
    }
}

function createView(ctx) {
    const roomId = ctx.params.id;
    ctx.appState.game = createGame(ctx.appState.user, roomId, update);

    // Redraw chat on every update - new messages are displayed via update
    // Cache game screen indefinetly - its contents are controlled via Canvas

    return render();

    function render() {
        view = pageTemplate(ctx.appState.game.canvas, ctx.appState.game.chat.map(toText).join("\n"), onMessageSubmit);
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