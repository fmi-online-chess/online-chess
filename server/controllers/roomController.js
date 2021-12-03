import { Router } from "express";

const roomController = Router();

roomController.get("/", (req, res) => {
    res.json(req.games.rooms);
});

roomController.get("/:id", (req, res) => {
    const roomId = req.params.id;
    const room = req.games.rooms.find(r => r.id == roomId);
    const players = req.games.players[roomId] || {};
    console.log(players);

    if (room == undefined) {
        res.status(400).json({
            message: "Room not found"
        });
    } else {
        res.json(Object.assign({}, room, {
            players: {
                player1: players.player1 && players.player1.username,
                player2: players.player2 && players.player2.username
            }
        }));
    }
});

roomController.post("/:id/players", (req, res) => {
    const roomId = req.params.id;
    const { seat, username } = req.body;
    if (req.games.players[roomId] == undefined) {
        req.games.players[roomId] = {
            player1: null,
            player2: null
        };
    }
    const players = req.games.players[roomId];

    try {
        const playerId = joinRoom(players, seat, username);
        res.status(201).json({ playerId });
    } catch (err) {
        res.status(400).json({
            message: "Invalid seat allocation"
        });
    }
});

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

function joinRoom(players, seat, username) {
    if (players[seat] != null) {
        throw new Error("Seat already occupied");
    } else {
        const playerId = fauxUuid();

        players[seat] = {
            playerId,
            username
        };

        return playerId;
    }
}

function leaveRoom(players, seat) {
    // TODO must determine if target seat is occupied by the requesting player
    if (players[seat] == null) {
        throw new Error("Seat is empty");
    } else {
        players[seat] = null;
    }
}

function fauxUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default roomController;