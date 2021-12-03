import { render } from "./lib.js";
import { page } from "./lib.js";

import { homePage } from "./views/home.js";
import { registerPage } from "./views/register.js";
import { loginPage } from "./views/login.js";
import { roomsPage } from "./views/engine.js";


const main = document.querySelector("main");
function decoratedRender(content) {
    render(content, main);
}

page((ctx, next) => {
    ctx.render = decoratedRender;

    next();
});


page("/", homePage);
page("/register", registerPage);
page("/login", loginPage);
page("/rooms", roomsPage);

page.start();