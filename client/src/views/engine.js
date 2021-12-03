import { html } from "../lib.js";
import { io } from "http://localhost:5000/socket.io/socket.io.esm.min.js";


const roomsTemplate = (rooms, onConnectionRequest) => html`
<h1>Available Rooms</h1>
<ul>
    ${rooms.map(r => html`<li><a href="/room/${r.id}">${r.name}</a></li>`)}
</ul>
<button @click=${onConnectionRequest}>Test Connection</button>`;

export function roomsPage(ctx) {
    ctx.render(roomsTemplate([
        {
            id: 1,
            name: "Room 1"
        },
        {
            id: 2,
            name: "Room 2"
        },
        {
            id: 3,
            name: "Room 3"
        }
    ], onConnectionRequest));


    function onConnectionRequest() {
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected");
        });

        socket.on("message", (data) => {
            console.log(data);
        });

        setInterval(() => {
            socket.emit("message", "hello");
        }, 5000);
    }
}