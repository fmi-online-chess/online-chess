import { html } from "../lib.js";


const homeTemplate = () => html`
<h1>Home Page</h1>
<p>Hello World!</p>`;


export function homePage(ctx) {
    return homeTemplate();
}