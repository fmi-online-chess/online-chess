/* globals env */
import { page } from "../lib.js";
import { clearUserData, getUserData } from "../util/userData.js";
import { INVALID_TOKEN } from "./errors.js";
import { showInfo, showError } from "../util/notify.js";


const hostname = env?.hostname || "http://localhost:5000";

export async function request(url, options) {
    try {
        const response = await fetch(hostname + url, options);
        if (response.ok != true) {
            const err = await response.json();
            if (err.code == INVALID_TOKEN) {
                clearUserData();
                page.redirect("/login?error=token");
            }
            throw err;
        }

        if (response.status == 204) {
            return response;
        } else {
            return response.json();
        }
    }
    catch (err) {
        showError(err.message);
        throw err;
    }
}

function createOptions(method = "get", data) {
    const options = {
        method,
        headers: {}
    };

    if (data != undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    const user = getUserData();

    if (user) {
        options.headers["Authorization"] = user.accessToken;
    }

    return options;
}

export async function get(url) {
    return request(url, createOptions());
}

export async function post(url, data) {
    return request(url, createOptions("post", data));
}

export async function put(url, data) {
    return request(url, createOptions("put", data));
}

export async function del(url) {
    return request(url, createOptions("delete"));
}