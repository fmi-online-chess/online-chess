import express from "express"
import cors from "cors"
import helmet from "helmet"
import userController from "./controllers/userController.js";

const PORT = 5000;

const app = express();
app.use(cors(), helmet())

app.use("/", userController)
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})