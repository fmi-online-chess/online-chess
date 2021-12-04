import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";

import mockGameData from "./middlewares/mockGameData.js";
import mockAuth from "./middlewares/mockAuth.js";
import mockSession from "./middlewares/mockSession.js";
import userController from "./controllers/userController.js";
import roomController from "./controllers/roomController.js";
import setupEngine from "./engine/index.js";
import { authMiddleware } from "./auth/auth.middleware.js";

const PORT = 5000;

const app = express();
const server = createServer(app);

app.use(cors(), helmet());
app.use(mockGameData());
app.use(express.json());
app.use(mockAuth());
app.use(mockSession());
app.use("/users", userController);
app.use("/rooms", roomController);

setupEngine(server);

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});