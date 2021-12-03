import { createApp } from "./app.js";
import { homePage } from "./views/home.js";
import { registerPage } from "./views/register.js";
import { loginPage } from "./views/login.js";
import { roomsPage } from "./views/rooms.js";


const app = createApp({
    counter: 0,
    nestedObject: {
        value: 1
    }
});

app.view("/", homePage);
app.view("/register", registerPage);
app.view("/login", loginPage);
app.view("/rooms", roomsPage);

app.start();