import mongoose from "mongoose";


const schema = new mongoose.Schema({
    username: { type: String, required: true },
    hashedPassword: { type: String, required: true }
});

export default mongoose.model("User", schema);