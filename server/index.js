import express from "express"
import cors from "cors"
import helmet from "helmet"
import userController from "./controllers/userController.js";

const PORT = 3000;

const app = express();
app.use(cors(), helmet())

app.use("/static", express.static("../client"));

app.use("/", userController)
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})