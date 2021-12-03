import { html } from "../lib.js";


const registerTemplate = (submitForm) => html`
<h1>Register Page</h1>
<p>Hello World!</p>
<form @submit=${submitForm}>
    <input name="username" type="text" />
    <input name="password" type="password" />
    <input value="Submit" type="submit" />
</form>`;


export function registerPage(ctx) {
    // login();
    ctx.render(registerTemplate(submitForm));

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        console.log(...formData.entries());

        ctx.page.redirect("/");
    }
}   