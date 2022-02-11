function setModalStyles(modalElement, winner, userColor, opponent) {
    const modalContainer = document.getElementsByClassName("dialog-container")[0];
    const modalTitle = modalElement.getElementsByClassName("title")[0];
    const modalInfo = modalElement.getElementsByClassName("info")[0];

    if (winner == "stalemate") {
        modalContainer.style.borderColor = "rgb(235, 219, 0)";
        modalTitle.textContent = "Draw";
        modalInfo.textContent = "Game ends in stalemate.";
    }
    else if (winner == userColor) {
        modalContainer.style.borderColor = "rgb(75,181,67)";
        modalTitle.textContent = "Victory";
        modalInfo.textContent = `Congratulations! You defeated ${opponent} by checkmate.`;
    }
    else {
        modalContainer.style.borderColor = "rgb(255,0,0)";
        modalTitle.textContent = "Defeat";
        modalInfo.textContent = `Player ${opponent} won by checkmate.`;
    }
}

export function showModal(data, userColor, opponent) {
    const modalElement = document.getElementsByClassName("modal")[0];

    let winner = "";
    if (data.includes("1-0")) {
        winner = "W";
    } else if (data.includes("0-1")) {
        winner = "B";
    } else if (data == "1/2-1/2") {
        winner = "stalemate";
    }

    setModalStyles(modalElement, winner, userColor, opponent);

    modalElement.style.display = "block";
}