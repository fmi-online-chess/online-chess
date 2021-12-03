import { createApp } from "./app.js";
import { homePage } from "./views/home.js";
import { registerPage } from "./views/register.js";
import { loginPage } from "./views/login.js";
import { lobbyPage, roomsPage } from "./views/rooms.js";
import { chessBoard } from "./views/engine.js";


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
app.view("/room/:id", lobbyPage);
app.view("/room/:id/board", chessBoard);

app.start();