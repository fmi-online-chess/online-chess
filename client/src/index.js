import { createApp } from "./app.js";
import { homePage } from "./views/home.js";
import { registerPage } from "./views/register.js";
import { loginPage } from "./views/login.js";
import { lobbyPage, roomsPage } from "./views/rooms.js";
import { chessboard } from "./views/chessboard.js";


const app = createApp(document.getElementById("container"));

app.view("/", homePage);
app.view("/register", registerPage);
app.view("/login", loginPage);
app.view("/rooms", roomsPage);
app.view("/rooms/:id", lobbyPage);
app.view("/rooms/:id/board", chessboard);
// app.view("/rooms/:id/spectate", spectateGame);

app.start();