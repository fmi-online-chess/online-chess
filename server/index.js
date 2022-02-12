import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";

import mockGameData from "./middlewares/mockGameData.js";

import auth from "./middlewares/auth.js";
import userController from "./controllers/userController.js";
import roomController from "./controllers/roomController.js";

import setupDatabase from "./data/database.js";
import setupEngine from "./engine/index.js";

const PORT = process.env.PORT || 5000;

start();

async function start() {
    const app = express();

    const server = createServer(app);

    app.use(cors(), helmet());
    app.use(express.json());

    await setupDatabase(app);

    app.use(auth());

    app.use(mockGameData());

    app.use("/users", userController);
    app.use("/rooms", roomController);

    setupEngine(server);

    server.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });
}