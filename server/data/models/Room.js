import mongoose from "mongoose";


// TODO store which player plays white
const schema = new mongoose.Schema({
    name: { type: String, required: true },
    chatHistory: { type: [Object], default: [] },
    players: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
});

export default mongoose.model("Room", schema);