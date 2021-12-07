import bcrypt from "bcryptjs";
import errors from "./errors.js";
export const validateUser = (usersData) => async (
    username,
    password
) => {
    const user = await getUserByUserName(usersData)(username);

    if (user.error) {
        throw new Error("Username does not exist!");
    }

    if (await bcrypt.compare(password, user.data.password)) {
        return user.data;
    }

    return null;
};


export const getUserByUserName = (usersData) => async (username) => {
    const user = await usersData.getUserByUserName(username);

    if (user === null) {
        return {
            error: errors.NOT_FOUND,
            data: null,
        };
    }
    return {
        error: null,
        data: user,
    };
};

export const createUser = (usersData) => async (username, password) => {

    if (await usersData.getUserByUserName(username) !== null) {
        return {
            error: errors.DUPLICATE_RECORD,
            data: null,
        };
    }

    const createdUser = await usersData.createUser(username, password);

    return {
        error: null,
        data: createdUser,
    };
};