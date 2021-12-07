import constraints from "./constraints.js";

export default {
    username: (value) => typeof value === "string" &&
        value.length >= constraints.minFormEntry &&
        value.length <= constraints.maxFormEntry,
    password: (value) => typeof value === "string" &&
        value.length >= constraints.minFormEntry &&
        value.length <= constraints.maxFormEntry,
};