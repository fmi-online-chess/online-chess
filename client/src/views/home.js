import { html } from "../lib.js";


const homeTemplate = () => html`
<nav>
    <a href="/rooms">Rooms</a>
    <a href="/login">Login</a>
    <a href="/register">Register</a>
</nav>
<h1>Home Page</h1>
<p>Hello World!</p>`;


export async function homePage(ctx) {
    ctx.render(homeTemplate());
}