import mongoose from "mongoose";


const schema = new mongoose.Schema({
    username: { type: String, required: true },
    hashedPassword: { type: String, required: true }
});

schema.index({ username: 1}, {
    unique: true,
    collation: {
        locale: "en",
        strength: 2
    }
});

export default mongoose.model("User", schema);