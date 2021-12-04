import { html } from "../lib.js";
import { login } from "../data/user.js";

const loginTemplate = (submitForm) => html`
<h1>Login Page</h1>
<form @submit=${submitForm}>
    <label>
        <span>Username:</span>
        <input name="username" type="text" />
    </label>
    <label>
        <span>Password:</span>
        <input name="password" type="password" />
    </label>
    <input value="Submit" type="submit" />
</form>`;


export function loginPage(ctx) {
    return loginTemplate(submitForm);

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const username = formData.get("username");
        const password = formData.get("password");
        const result = await login(username, password);

        ctx.appState.user = result;

        ctx.page.redirect("/");
    }
}  