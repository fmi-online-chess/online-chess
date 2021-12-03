import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import * as http from "http";
import userController from "./controllers/userController.js";


const PORT = 5000;

const app = express();
const server = http.createServer(app);

app.use(cors(), helmet());
app.use(express.json());
app.use("/users", userController);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {  console.log("a user connected");});


server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});