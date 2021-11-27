import { request } from "./api.js";

export async function login(username, password) {
    const result = await request('/');

    console.log(result);
}