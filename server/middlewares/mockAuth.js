import crypto from "crypto";
import { getId, users, sessions } from "./mockData.js";

export default function initialize() {
    return (req, res, next) => {
        req.auth = {
            login,
            logout,
            register
        }
        next();
    }
}

function login(username, password) {
    const user = Object.values(users).find(u => u.username.toLocaleLowerCase() === username.toLocaleLowerCase());

    if (!user) {
        throw {
            message: "Incorrect username or password!.",
            status: 403
        };
    }
    
    if (user.hashedPassword !== hash(password)) {
        throw {
            message: "Incorrect username or password!.",
            status: 403
        };
    }

    console.log(`User ${user.username} logged in successfully.`);
    return createSession(user);
}

function logout(token) {
    const user = sessions[token] || {};
    console.log(`User ${user.username} logged out successfully.`);

    delete sessions[token];
}

function register(username = "", password = "") {
    if (username === "" || password === "") {
        throw {
            message: "Username and password cannot be empty.",
            status: 400
        };
    }

    if (Object.values(users).find(u => u.username === username)) {
        throw {
            message: "Username already used.",
            status: 409
        };
    }

    const user = {
        id: getId(),
        username,
        hashedPassword: hash(password)
    };

    users[user.id] = user;
    console.log(`User ${user.username} registered successfully.`);

    return createSession(user);
}

function createSession(user) {
    const result = Object.assign({}, user);
    delete result.hashedPassword;
    const accessToken = hash(Date.now().toString());
    result.accessToken = accessToken;
    sessions[accessToken] = user;

    return result;
}

function hash(text) {
    const hmac = crypto.createHmac("sha256", "secret");
    hmac.update(text);

    return hmac.digest("hex");
}