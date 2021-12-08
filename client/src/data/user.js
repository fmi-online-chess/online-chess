import { clearUserData, setUserData } from "../util/userData.js";
import { post } from "./api.js";

export async function login(username, password) {
    const result = await post("/users/login", { username, password });

    setUserData(result);

    return result;
}

export async function register(username, password) {
    const result = await post("/users/register", { username, password });

    setUserData(result);

    return result;
}

export function logout() {
    clearUserData();
}

window.api = {
    login,
    logout,
    register
};