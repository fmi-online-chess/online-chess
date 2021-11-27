import { html } from 'https://unpkg.com/lit-html?module';
import { login } from '../data/user.js';


const registerTemplate = () => html`
<h1>Register Page</h1>
<p>Hello World!</p>`;


export function registerPage(ctx) {
    login();
    ctx.render(registerTemplate());
}   