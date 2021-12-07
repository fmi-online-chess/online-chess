import {
    Router
} from "express";
import * as usersData from "../data/userData.js";


const userController = Router();

userController.post("/login", (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const result = req.auth.login(username, password);

        res.json(result);
    } catch (err) {
        res.status(err.status).json({
            message: err.message
        });
    }
});

userController.get("/logout", (req, res) => {
    const token = req.headers["authorization"];

    req.auth.logout(token);

    res.status(204).end();
});

userController.post("/register", (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const result = req.auth.register(username, password);

        res.json(result);
    } catch (err) {
        res.status(err.status).json({
            message: err.message
        });
    }
});

export default userController;