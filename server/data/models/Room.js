import mongoose from "mongoose";


const schema = new mongoose.Schema({
    name: { type: String, required: true },
    chatHistory: { type: [Object], default: [] },
    players: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    white: { type: Number, default: () => Math.round(Math.random()) },
    state: { type: String, default: "" },
    history: { type: [String], default: [] },
    started: { type: Number, default: null },
    remainingWhite: { type: Number, default: null },
    remainingBlack: { type: Number, default: null },
    lastMoved: { type: Number, default: null }
});

export default mongoose.model("Room", schema);