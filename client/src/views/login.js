import { html } from "https://unpkg.com/lit-html?module";
import { login } from "../data/user.js";


const loginTemplate = (submitForm) => html`
<h1>Login Page</h1>
<p>Hello World!</p>
<form @submit=${submitForm}>
    <input name="username" type="text" />
    <input name="password" type="password" />
    <input value="Submit" type="submit" />
</form>`;


export function loginPage(ctx) {
    // login();
    ctx.render(loginTemplate(submitForm));

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const username = formData.get("username");
        const password = formData.get("password");
        await login(username, password);
        ctx.page.redirect("/");
    }
}  