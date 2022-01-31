import { register } from "../data/user.js";
import { html } from "../lib.js";
import { createSubmitHandler } from "../util/handlers.js";
import { showInfo, showError } from "../util/notify.js";


const registerTemplate = (submitForm) => html`
<div class="wrapper form">
    <h1 class="form-title">Register</h1>
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
        <p class="icon-field">
            <label for="confirmPassword" class="required-field">Confirm Password:</label>
            <input name="confirmPassword" id="confirmPassword" type="password" required placeholder="*******" />
            <i class="fas fa-lock"></i>
        </p>
        <p class="submit-input">
            <input value="Submit" type="submit" />
        </p>
    </form>
    <h4>Already have an account? <a href="/login">Sign in</a></h4>
</div>`;


export function registerPage(ctx) {
    if (ctx.appState.user) {
        ctx.page.redirect("/");
    }
    
    return registerTemplate(createSubmitHandler(onSubmit));

    async function onSubmit({username, password, confirmPassword}) {
        if (password !== confirmPassword) {
            return void showError("Passwords do not match!");
        }

        const result = await register(username, password);

        showInfo(`User ${username} registered successfully!`);

        ctx.appState.user = result; 

        ctx.page.redirect("/");
    }
}   