import { html } from "../lib.js";


const homeTemplate = (onUpdate, counter) => html`
<h1>Home Page</h1>
<p>Hello World! ${counter}</p>
<button @click=${onUpdate}>Trigger update</button>`;


export function homePage(ctx) {
    return homeTemplate(onClick, ctx.appState.nestedObject.value);

    function onClick() {
        ctx.appState.nestedObject.value++;
    }
}