import { html, until } from "../lib.js";
import spinner from "./common/spinner.js";
import { getLobby, getRooms, joinRoom } from "../data/rooms.js";


const roomsTemplate = (roomsPromise) => html`
<h1>Available Rooms</h1>
<ul>
    ${until(roomsPromise, spinner())}
</ul>`;

const lobbyTemplate = (roomDataPromise) => html`
<h1>Lobby</h1>
${until(roomDataPromise, spinner())}`;

export function roomsPage(ctx) {
    return roomsTemplate(loadRooms());
}

async function loadRooms() {
    const rooms = await getRooms();

    if (rooms.length == 0) {
        return html`<p>No available rooms.</p>`;
    } else {
        return rooms.map(r => html`<li><a href="/room/${r.id}">${r.name}</a></li>`);
    }
}

export function lobbyPage(ctx) {
    const roomId = ctx.params.id;

    return lobbyTemplate(loadLobby(ctx, roomId));
}

async function loadLobby(ctx, roomId) {
    const roomData = await getLobby(roomId);
    let username = "";

    return html`
    <h2>${roomData.name}</h2>
    <input @input=${onInput} type="text" name="username" placeholder="Enter your display name">
    <ul>
        <li>${roomData.players.player1 || html`<button @click=${() => onJoin("player1")} ?disabled=${true}>Join Room</button>`}</li>
        <li>${roomData.players.player2 || html`<button @click=${() => onJoin("player2")} ?disabled=${true}>Join Room</button>`}</li>
    </ul>`;

    async function onJoin(seat) {
        const result = await joinRoom(roomId, seat, username);
        localStorage.setItem("gameToken", result.playerId);
        ctx.page.redirect(`/room/${roomId}/board`);
    }

    function onInput(ev) {
        username = ev.target.value || "";

        if (username) {
            [...document.querySelectorAll("button")].forEach(b => b.disabled = false);
        } else {
            [...document.querySelectorAll("button")].forEach(b => b.disabled = true);
        }
    }
}