import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";
import { createRoom, getLobby, getRooms, joinRoom } from "../data/rooms.js";
import { createSubmitHandler } from "../util/handlers.js";


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
<h1>Lobby</h1>
${until(roomDataPromise, spinner())}`;

export function roomsPage(ctx) {
    return roomsTemplate(loadRooms(), createSubmitHandler(onCreateSubmit));

    async function onCreateSubmit({ name }) {
        if (!name) {
            return alert("Name cannot be empty");
        }

        const result = await createRoom(name);
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
    const roomData = await getLobby(roomId);

    const canResume = roomData.players.find(p => p._id == ctx.appState.user._id) != undefined;
    const canJoin = roomData.players.length < 2 && !canResume;

    return html`
    <h2>${roomData.name}</h2>
    <ul>
        ${roomData.players.map(p => html`<li>${p.username}</li>`)}
    </ul>
    ${canJoin ? html`<button @click=${onJoin}>Join Room</button>` : null}
    ${canResume ? html`<a href="/rooms/${roomId}/board">Resume</button>` : null}`;

    async function onJoin() {
        await joinRoom(roomId);
        ctx.page.redirect(`/rooms/${roomId}/board`);
    }
}