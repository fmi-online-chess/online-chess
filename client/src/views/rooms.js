import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";
import { createRoom, getLobby, getRooms, joinRoom } from "../data/rooms.js";
import { createSubmitHandler } from "../util/handlers.js";
import { showError, showInfo } from "../util/notify.js";


const roomsTemplate = (roomsPromise, onCreateSubmit) => html`
<div class="wrapper game-room">
    <header>
        <h1 class="section-title">Game Rooms</h1>
    </header>
    <div class="room-actions">
        <section class="create">
            <h2>Create Room</h2>
            <form @submit=${onCreateSubmit}>
                <p class="icon-field">
                    <label for="name" class="required-field">Room Name:</label>
                    <input name="name" id="name" type="text" required placeholder="Room 1" />
                    <i class="fas fa-chess-board"></i>
                </p>
                <p class="submit-input">
                    <input value="Create room" type="submit" />
                </p>
            </form>
        </section>

        <section class="join">
            <h2>Join Room</h2>
            <ul>
                ${until(roomsPromise, spinner())}
            </ul>
        </section>
    </div>
</div>`;

const lobbyTemplate = (roomDataPromise) => html`
<div class="wrapper form">
    <h1 class="form-title">Lobby</h1>
    ${until(roomDataPromise, spinner())}        
</div>`;

export function roomsPage(ctx) {
    return roomsTemplate(loadRooms(), createSubmitHandler(onCreateSubmit));

    async function onCreateSubmit({ name }) {
        if (!name) {
            return void showError("Name cannot be empty!");
        }

        if (!ctx.appState.user) {
            return void showError("You have to login before creating a room.");
        }

        const result = await createRoom(name);

        showInfo(`Room ${name} created successfully!`);

        ctx.page.redirect(`/rooms/${result._id}`);
    }
}

async function loadRooms() {
    const rooms = await getRooms();

    if (rooms.length == 0) {
        return html`<p>No available rooms.</p>`;
    } else {
        return rooms.map(r => html`<li><a href="/rooms/${r._id}"><i class="fas fa-greater-than"></i> <span>${r.name}<span></a></li>`);
    }
}

export function lobbyPage(ctx) {
    const roomId = ctx.params.id;

    return lobbyTemplate(loadLobby(ctx, roomId));
}

async function loadLobby(ctx, roomId) {
    let roomData;
    
    try {
        roomData = await getLobby(roomId);
    } catch(err) {
        return ctx.page.redirect("/rooms");
    }

    const hasLoggedUser = ctx.appState.user !== undefined;
    const canResume = hasLoggedUser && roomData.players.find(p => p._id == ctx.appState.user?._id) != undefined;
    const canJoin = roomData.players.length < 2 && !canResume;
    const canSpectate = roomData.players.length === 2 && !canResume;

    return html`
    <div class="room-box">
        <section class="room-data">
            <h2>${roomData.name}</h2>
            <ul>
                ${roomData.players.map(p => html`<li><i class="fas fa-user"></i> ${p.username}</li>`)}
            </ul>
            ${canJoin ? html`<button @click=${onJoin} class="room-entrance-btn">Join Room</button>` : null}
            ${canSpectate ? html`<button @click=${onSpectate} class="room-entrance-btn">Spectate Game</button>` : null}
            ${canResume ? html`<button @click=${onResume} class="room-entrance-btn">Resume</button>` : null}
        </section>
        <section class="media"></section>
    </div>`;

    async function onJoin() {
        if (hasLoggedUser) {
            await joinRoom(roomId);
            ctx.page.redirect(`/rooms/${roomId}/board`);
        } else {
            showError("You have to login before joining a room.");
        }
    }

    async function onSpectate() {
        showInfo("Spectator mode.");
    }

    async function onResume() {
        if (roomData.players.length === 2) {
            ctx.page.redirect(`/rooms/${roomId}/board`);
        } else {
            showError("Waiting for an opponent to join.");
        }
    }
}