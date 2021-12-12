import { register } from "../data/user.js";
import { html } from "../lib.js";
import { createSubmitHandler } from "../util/handlers.js";


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
        <input name="confirmPassword" type="password" />
    </label>
    <input value="Submit" type="submit" />
</form>`;


export function registerPage(ctx) {
    return registerTemplate(createSubmitHandler(onSubmit));

    async function onSubmit({username, password, confirmPassword}) {
        if (password !== confirmPassword) {
            return alert("Passwords do not match!");
        }

        const result = await register(username, password);

        ctx.appState.user = result; 

        ctx.page.redirect("/");
    }
}   