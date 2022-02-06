import { html } from "../lib.js";
import { login } from "../data/user.js";
import { createSubmitHandler } from "../util/handlers.js";
import { showInfo } from "../util/notify.js";

const loginTemplate = (submitForm) => html`
<div class="wrapper form">
    <h1 class="form-title">Login</h1>
    <form @submit=${submitForm}>
        <p class="icon-field">
            <label for="username" class="required-field">Username:</label>
            <input name="username" id="username" type="text" required placeholder="Ivan Ivanov" />
            <i class="fas fa-user"></i>
        </p>
        <p class="icon-field">
            <label for="password" class="required-field">Password:</label>
            <input name="password" id="password" type="password" required placeholder="*******" />
            <i class="fas fa-lock"></i>
        </p>
        <p class="submit-input">
            <input value="Submit" type="submit" />
        </p>
    </form>
    <h4><a href="/register">Register</a> if you don't have an account yet.</h4>
</div>`;


export function loginPage(ctx) {
    if (ctx.query.error == "token") {
        delete ctx.appState.user;
    } else if (ctx.appState.user) {
        ctx.page.redirect("/");
    }

    return loginTemplate(createSubmitHandler(onSubmit));

    async function onSubmit({ username, password }) {
        const result = await login(username, password);

        showInfo("Logged in successfully!");

        ctx.appState.user = result;

        if (ctx.query.origin) {
            ctx.page.redirect(ctx.query.origin);
        } else {
            ctx.page.redirect("/");
        }
    }
}  