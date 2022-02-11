function setModalStyles(modalElement, players, winner, reason, isSpectator) {
    const modalContainer = document.getElementsByClassName("dialog-container")[0];
    const modalTitle = modalElement.getElementsByClassName("title")[0];
    const modalInfo = modalElement.getElementsByClassName("info")[0];

    if (reason == "stalemate") {
        modalContainer.style.borderColor = "rgb(235, 219, 0)";
        modalTitle.textContent = "Draw";
        modalInfo.textContent = "Game ends in stalemate.";
    } else if (isSpectator) {
        modalContainer.style.borderColor = "rgb(235, 219, 0)";
        modalTitle.textContent = "Game Concluded";
        modalInfo.textContent = `Player ${players[winner]} (${winner == 0 ? "white" : "black"}) won by ${reason}.`;
    } else if (winner == 0) {
        modalContainer.style.borderColor = "rgb(75,181,67)";
        modalTitle.textContent = "Victory";
        modalInfo.textContent = `Congratulations! You defeated ${players[1]} by ${reason}.`;
    } else {
        modalContainer.style.borderColor = "rgb(255,0,0)";
        modalTitle.textContent = "Defeat";
        modalInfo.textContent = `Player ${players[1]} won by ${reason}.`;
    }
}

export function showModal(data, userColor, players, isSpectator) {
    const modalElement = document.getElementsByClassName("modal")[0];
    modalElement.querySelector(".modal-close").addEventListener("click", () => {
        modalElement.style.display = "none";
    });

    let reason = "checkmate";
    let winner = "";
    if (data.includes("1-0")) {
        winner = userColor == "B" ? 1 : 0;
    } else if (data.includes("0-1")) {
        winner = userColor == "B" ? 0 : 1;
    } else if (data == "1/2-1/2") {
        reason = "stalemate";
        winner = "stalemate";
    }
    if (data.includes("timeout")) {
        reason = "time limit";
    }

    setModalStyles(modalElement, players, winner, reason, isSpectator);

    modalElement.style.display = "block";
}