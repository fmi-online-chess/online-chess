import Room from "../data/models/Room.js";


async function getRooms() {
    return Room.find({}).select(["_id", "name"]);
}

async function getRoomById(id) {
    return Room.findById(id).select(["_id", "name", "players"]).populate("players", ["_id", "username"]);
}

async function getRoomDetails(id) {
    return Room.findById(id).populate("players", ["_id", "username"]);
}

async function createRoom(name) {
    const room = new Room({ name });

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