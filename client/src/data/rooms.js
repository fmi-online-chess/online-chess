import * as api from "./api.js";


const endpoints = {
    allRooms: "/rooms",
    roomById: (roomId) => "/rooms/" + roomId,
    joinRoomById: (roomId) => `/rooms/${roomId}/players`,
};

export async function getRooms() {
    return api.get(endpoints.allRooms);
}

export async function getLobby(roomId) {
    return api.get(endpoints.roomById(roomId));
}

export async function joinRoom(roomId, seat, username) {
    return api.post(endpoints.joinRoomById(roomId), { seat, username });
}