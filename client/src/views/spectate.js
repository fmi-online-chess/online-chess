import { html } from "../lib.js";
import { log } from "../util/logger.js";
import { showError } from "../util/notify.js";
import { getLobby } from "../data/rooms.js";
import { createGame } from "../engine/index.js";
import { createTimer } from "./common/timer.js";


const pageTemplate = (board, players, history, time, onReady) => html`
<div id="board-page">
    <div id="board-id">
        ${board}
    </div>
    ${chatTemplate(history, players, time, onReady)}
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

const chatTemplate = (history, players, time, onReady) => html`
<div id="side-menu">
    ${createTimer(players, time, onReady)}
    <div id="chat-menu">
        <textarea disabled .value=${history} id="chat-area"></textarea>
    </div>
</div>`;


let view = null;

export function spectateGame(ctx) {
    const roomId = ctx.params.id;
    
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
        
        oldGame.contentReady.then(() => {
            oldGame.disconnect();
        });
        createView(ctx);
    }
}

async function createView(ctx) {
    const roomId = ctx.params.id;
    let roomData;
    
    try {
        roomData = await getLobby(roomId);
    } catch(err) {
        return ctx.page.redirect("/rooms");
    }
    const isUserPartOfRoom = ctx.appState.user !== undefined && 
                            roomData.players.filter(p => p.username === ctx.appState.user.username)[0] !== undefined;

    if (roomData.players.length < 2) {
        showError(`Room "${roomData.name}" has less than 2 players.`);
        return ctx.page.redirect(`/rooms/${roomId}`);
    } else if (isUserPartOfRoom) {
        showError(`You cannot spectate a game you are playing.`);
        return ctx.page.redirect(`/rooms/${roomId}`);
    }

    const playerNames = roomData.players.map(p => p.username);
    // eslint-disable-next-line require-atomic-updates
    ctx.appState.game = createGame(null, playerNames, roomId, update, updateTimer, true);
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
        localBlack: false,
        playersReady: new Set()
    };

    return render();

    function updateTimer(packet) {
        if (typeof packet == "string") {
            time.playersReady.add(packet);
        } else {
            const [white, black, current ] = packet;
            time.white = white;
            time.black = black;
            time.current = current;
        }

        update();
    }

    function render() {
        view = pageTemplate(ctx.appState.game.canvas,
            ctx.appState.game.players,
            ctx.appState.game.chat.map(toText).join("\n"),
            time,
            null);
        return view;
    }

    function update() {
        render();
        ctx.update();
    }

    function toText({ username, message }) {
        return `${username}: ${message}`;
    }
}