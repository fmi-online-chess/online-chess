import { html } from "../lib.js";


export const layoutTemplate = (state, view) => html`
<nav>
    <a href="/">Home</a>
    <a href="/rooms">Rooms</a>

    ${state.user ? 
        html`<a href="javascript:void(0)" @click=${state.onLogout}>Logout</a>` : 
        html`
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    `}
</nav>
${view}
<footer>&copy; 2021</footer>`;
