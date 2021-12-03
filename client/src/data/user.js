import { post } from "./api.js";

export async function login(username, password) {
    const result = await post("/users/login", { username, password });

    localStorage.setItem("user-data", JSON.stringify(result));

    return result;
}