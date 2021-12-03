import { html } from "../lib.js";


export const layoutTemplate = (state, view) => html`
<nav>
    <a href="/">Home</a>
    <a href="/rooms">Rooms</a>
    <a href="/login">Login</a>
    <a href="/register">Register</a>
</nav>
${view}
<footer>&copy; 2021</footer>`;
