import { sessions } from "./mockData.js";

export default function initialize() {
    return (req, res, next) => {
        const token = req.headers["authorization"];

        if (token) {
            const user = sessions[token];
            if (!user) {
                return res.status(401).json({
                    message: "Invalid authorization token!"
                });
            }

            req.user = user;
            console.log(`User ${user.username} identified`);
        }
        next();
    };
}