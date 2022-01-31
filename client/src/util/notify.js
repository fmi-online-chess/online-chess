function showBox(boxType, message) {
    const elementId = boxType === "info" ? "infoBox" : "errorBox";
    const notificationBox = document.getElementById(elementId);
    notificationBox.getElementsByTagName("span")[0].textContent = message;
    notificationBox.style.display = "block";
    notificationBox.style.opacity = 1;
    
    setTimeout(() => {
        fadeOut(notificationBox);
    }, 3500);
}

function fadeOut(element) {
    element.style.opacity = 0;
    setTimeout(() => {
        element.style.display = "none";
    }, 400);
}

function showInfo(message) {
    showBox("info", message);
}

function showError(errorMessage) {
    showBox("error", errorMessage);
}

export {
    showInfo,
    showError
};