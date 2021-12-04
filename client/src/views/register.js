import { register } from "../data/user.js";
import { html } from "../lib.js";


const registerTemplate = (submitForm) => html`
<h1>Register Page</h1>
<form @submit=${submitForm}>
    <label>
        <span>Username:</span>
        <input name="username" type="text" />
    </label>
    <label>
        <span>Password:</span>
        <input name="password" type="password" />
    </label>
    <label>
        <span>Confirm Password:</span>
        <input name="confirm-password" type="password" />
    </label>
    <input value="Submit" type="submit" />
</form>`;


export function registerPage(ctx) {
    return registerTemplate(submitForm);

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const username = formData.get("username");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirm-password");

        if (password !== confirmPassword) {
            return alert("Passwords do not match!");
        }

        const result = await register(username, password);

        ctx.appState.user = result; 

        ctx.page.redirect("/");
    }
}   