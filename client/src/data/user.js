import { get, post } from "./api.js";

export async function login(username, password) {
    const result = await post("/users/login", { username, password });

    localStorage.setItem("user-data", JSON.stringify(result));

    return result;
}

export async function register(username, password) {
    const result = await post("/users/register", { username, password });

    localStorage.setItem("user-data", JSON.stringify(result));

    return result;
}

export async function logout() {
    const result = await get("/users/logout");

    localStorage.removeItem("user-data");

    return result;
}

window.api = {
    login,
    logout,
    register
}