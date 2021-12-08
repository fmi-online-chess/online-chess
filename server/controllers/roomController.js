import { Router } from "express";
import { authCheck } from "../middlewares/auth.js";
import { createRoom, getRoomById, getRooms, joinRoom } from "../services/roomService.js";


const roomController = Router();

roomController.get("/", async (req, res) => {
    const rooms = await getRooms();
    res.json(rooms);
});

roomController.post("/", authCheck(), async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Room name cannot be empty"
        });
    }

    try {
        const room = await createRoom(name);
        await joinRoom(room._id, req.user._id);

        res.json(room);
    } catch (err) {
        res.status(err.status || 400).json({
            message: err.message
        });
    }
});

roomController.get("/:id", async (req, res) => {
    const roomId = req.params.id;
    const room = await getRoomById(roomId);

    if (room == undefined) {
        res.status(400).json({
            message: "Room not found"
        });
    } else {
        res.json(room);
    }
});

roomController.post("/:id/players", authCheck(), async (req, res) => {
    const roomId = req.params.id;

    try {
        const result = await joinRoom(roomId, req.user._id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({
            message: "Invalid seat allocation"
        });
    }
});

/*
roomController.delete("/:id/players/:seat", (req, res) => {
    const { roomId, seat } = req.params.id;
    const players = req.games.players[roomId];

    if (players == undefined) {
        res.status(400).json({
            message: "Room not found"
        });
    } else {
        try {
            leaveRoom(players, seat);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({
                message: "Invalid seat allocation"
            });
        }
    }
});
*/

export default roomController;