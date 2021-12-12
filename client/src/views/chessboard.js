import { createGame } from "../engine/index.js";
import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";


// NOTE: This is intentionally a static template - canvas control relies on unchanging reference
const canvas = html`<canvas id="canvas" width="450" height="450"></canvas>`;

const pageTemplate = (board, history, onSubmit) => html`
<h1>Chessboard</h1>
${board}
${chatTemplate(history, onSubmit)}`;

const chatTemplate = (history, onSubmit) => html`
<textarea disabled .value=${history}></textarea>
<form @submit=${onSubmit}>
    <input type="text" name="message"><input type="submit" value="Send">
</form>`;


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
    console.log("validating ...");
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
    let gameElement = null;
    ctx.appState.game = createGame(ctx.appState.user, roomId, update);

    // Redraw chat on every update - new messages are displayed via update
    // Cache game screen indefinetly - its contents are controlled via Canvas

    return render();

    function render() {
        view = pageTemplate(canvasPlaceholder(ctx.appState.game), ctx.appState.game.chat.map(toText).join("\n"), onMessageSubmit);
        return view;
    }

    function update() {
        render();
        ctx.update();
    }

    function toText({ username, message }) {
        return `${username == ctx.appState.user.username ? "You" : username}: ${message}`;
    }

    function canvasPlaceholder(game) {
        if (!game.ready) {
            return until(initGame(game), spinner());
        } else {
            // return gameElement;
            // BEGIN TEMP Redraw board each update - TODO remove when canvas is plugged in
            gameElement = game.render();
            return gameElement;
            // END TEMP
        }
    }

    async function initGame(game) {
        await game.contentReady;
        gameElement = game.render();
        return gameElement;
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
