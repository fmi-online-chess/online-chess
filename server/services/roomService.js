import Room from "../data/models/Room.js";


async function getRooms() {
    return Room.find({ concluded: false }).select(["_id", "name"]);
}

async function getRoomById(id) {
    return Room.findById(id).select(["_id", "name", "players", "startingTime"]).populate("players", ["_id", "username"]);
}

async function getRoomDetails(id) {
    return Room.findById(id).populate("players", ["_id", "username"]);
}

async function createRoom(name, time, color) {
    const model = { name };
    if (color == "white") {
        model.white = 0;
    } else if (color == "black") {
        model.white = 1;
    }
    if (time) {
        model.startingTime = Number(time) * 60000;
    }

    const room = new Room(model);

    await room.save();

    return room;
}


async function joinRoom(roomId, playerId) {
    const room = await getRoomById(roomId);

    if (room.players.length >= 2) {
        throw {
            message: "Room is full"
        };
    } else {
        room.players.push(playerId);
        await room.save();

        return room;
    }
}

export {
    getRooms,
    getRoomById,
    getRoomDetails,
    createRoom,
    joinRoom
};