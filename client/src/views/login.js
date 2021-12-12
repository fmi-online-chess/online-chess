import { html } from "../lib.js";
import { login } from "../data/user.js";
import { createSubmitHandler } from "../util/handlers.js";

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
    return loginTemplate(createSubmitHandler(onSubmit));

    async function onSubmit({username, password}) {
        const result = await login(username, password);

        ctx.appState.user = result;

        if (ctx.query.origin) {
            ctx.page.redirect(ctx.query.origin);
        } else {
            ctx.page.redirect("/");
        }
    }
}  