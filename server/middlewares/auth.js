import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userService from "../services/userService.js";
import { INVALID_TOKEN } from "../services/errors.js";


const {
    SECRET_KEY
} = dotenv.config().parsed;

export default function initialize() {
    return (req, res, next) => {
        req.auth = {
            login,
            register
        };

        if (readToken(req)) {
            next();
        } else {
            res.status(401).json({
                code: INVALID_TOKEN,
                message: "Invalid authorization token!"
            });
        }
    };
}

async function login(username, password) {
    const user = await userService.getUserByUsername(username);

    if (!user) {
        throw {
            message: "Incorrect username or password!",
            status: 403
        };
    } else {
        if (await bcrypt.compare(password, user.hashedPassword)) {

            console.log(`User ${user.username} logged in successfully.`);

            return createToken(user);
        } else {
            throw {
                message: "Incorrect username or password!",
                status: 403
            };
        }
    }
}

async function register(username = "", password = "") {
    if (username === "" || password === "") {
        throw {
            message: "Username and password cannot be empty.",
            status: 400
        };
    }

    if (await userService.getUserByUsername(username)) {
        throw {
            message: "Username already exists.",
            status: 409
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser(username, hashedPassword);

    console.log(`User ${user.username} registered successfully.`);

    return createToken(user);
}

function createToken(user) {
    const userViewModel = { _id: user._id, username: user.username };
    const accessToken = jwt.sign(userViewModel, SECRET_KEY, { expiresIn: "24h" });

    return Object.assign({}, userViewModel, { accessToken });
}

function readToken(req) {
    const token = req.headers["authorization"];
    if (token) {
        try {
            const userData = jwt.verify(token, SECRET_KEY);
            req.user = userData;
            console.log("Authorized user", userData.username);
        } catch (err) {
            return false;
        }
    }
    return true;
}