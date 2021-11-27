import { html } from 'https://unpkg.com/lit-html?module';


const pageTemplate = (count, onClick) => html`
<h1>Home Page</h1>
<p>Hello World!</p>
<div>
    <button @click=${onClick}>Click Me!</button>
    <p>${count}</p>
</div>`;


export async function homePage(ctx) {
    let counter = 0;
    update();

    function update() {
        ctx.render(pageTemplate(counter, onClick));
    }

    function onClick() {
        counter++;
        update();
    }
}