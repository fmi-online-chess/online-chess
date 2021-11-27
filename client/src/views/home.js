import { html } from 'https://unpkg.com/lit-html?module';


const pageTemplate = () => html`
<h1>Home Page</h1>
<p>Hello World!</p>`;


export function homePage(render) {
    render(pageTemplate());
}   