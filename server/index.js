import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";

import userController from "./controllers/userController.js";
import setupEngine from "./engine/index.js";


const PORT = 5000;

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use("/users", userController);

setupEngine(server);

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});