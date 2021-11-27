import express from "express"


const userController = express.Router()


userController.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (password === "123456") {
        res.status(200).json({
            username,
            id: "123ID",
            token: "token123"
        });
    } else {
        res.status(401).json({
            message: "Passwords do not match!"
        });
    }
});

export default userController