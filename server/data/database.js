import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/online-chess";
console.log("MONGODB_URI", MONGODB_URI);

export default async function initialize(app) {
    return new Promise((resolve, reject) => {
        mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const db = mongoose.connection;
        db.on("error", err => {
            console.error("Database error: ", err.message);
            reject(err.message);
        });
        db.on("open", () => {
            console.log("Database connected");
            resolve();
        });
    });
}