import User from "../data/models/User.js";


async function createUser(username, hashedPassword) {
    const user = new User({
        username,
        hashedPassword
    });

    await user.save();

    return user;
}

async function getUserByUsername(username) {
    return await User.findOne({ username: { $regex: username, $options: "i" } });
}

export {
    createUser,
    getUserByUsername
};