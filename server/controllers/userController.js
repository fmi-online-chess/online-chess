import { Router } from "express";


const userController = Router();

userController.post("/login", async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const result = await req.auth.login(username, password);

        res.json(result);
    } catch (err) {
        res.status(err.status).json({
            message: err.message
        });
    }
    res.end();
});

userController.get("/logout", (req, res) => {
    const token = req.headers["authorization"];

    req.auth.logout(token);

    res.status(204).end();
});

userController.post("/register", async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const result = await req.auth.register(username, password);

        res.json(result);
    } catch (err) {
        res.status(err.status).json({
            message: err.message
        });
    }
});

export default userController;