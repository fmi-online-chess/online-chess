export function getUserData() {
    return JSON.parse(localStorage.getItem("user-data"));
}

export function setUserData(data) {
    localStorage.setItem("user-data", JSON.stringify(data));
}

export function clearUserData() {
    return localStorage.removeItem("user-data");
}