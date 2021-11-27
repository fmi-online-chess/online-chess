import express from "express"


const userController = express.Router()


userController.get("/", (req, res) => {
    res.status(200).json({
        Boc: "is done"
    })
})

export default userController