const impossibleMoves = {
    "B": ["BR", "BN", "BB", "BQ", "BK", "BP", "WK"],
    "W": ["WR", "WN", "WB", "WQ", "WK", "WP", "BK"]
};


const moveset = {
    "P": (color, move, board, target) => {
        const startingRank = (color == "B") ? 6 : 1;
        const maxDelta = (move.fromRank == startingRank) ? 2 : 1;

        if (!isForward(color, move)) {
            return false;
        } else if (
            isDiagonal(move) &&
            Math.abs(move.fromRank - move.toRank) == 1 &&
            target != ""
        ) {
            return true; // Capture move
        } else if (move.fromFile != move.toFile || target != "") {
            return false;
        } else if (Math.abs(move.fromRank - move.toRank) > maxDelta) {
            return false;
        }

        return true;
    },
    "K": (color, move, board, target) => {
        if (CastlingMoveL(color, move.fromRank, move.fromFile, move.toRank, move.toFile, board) ||
            CastlingMoveS(color, move.fromRank, move.fromFile, move.toRank, move.toFile, board)) {
            return true;
        }
        if (!(Math.abs(move.fromRank - move.toRank) <= 1 && Math.abs(move.fromFile - move.toFile) <= 1 &&
            !isAttacked(board, color, move.toFile, move.toRank))) {
            return false;
        }
        return true;
    },
    "N": (color, move, board, target) => {
        if (!(Math.abs(move.fromFile - move.toFile) != Math.abs(move.fromRank - move.toRank) && Math.abs(move.fromFile - move.toFile) <= 2 &&
            Math.abs(move.fromFile - move.toFile) > 0 && Math.abs(move.fromRank - move.toRank) <= 2 &&
            Math.abs(move.fromRank - move.toRank) > 0)) {
            return false;
        }
        return true;
    },
    "R": (color, move, board, target) => {
        if (!clearMoveSliding(move, board)) {
            return false;
        }
        return true;
    },
    "B": (color, move, board, target) => {
        if (!clearMoveDiagonal(move, board)) {
            return false;
        }
        return true;
    },
    "Q": (color, move, board, target) => {
        if (!(
            clearMoveDiagonal(move, board) ||
            clearMoveSliding(move, board)
        )) {
            return false;
        }
        return true;
    },
};


const isAttacked = (board, color, slotJ, slotI) => {
    if (color === "black") {
        for (let i = 0; i <= 7; i++) {
            for (let j = 0; j <= 7; j++) {
                if (board[i][j].startsWith("W")) {
                    if (ableMove([j + 1, i + 1, slotJ, slotI], board)) {
                        return true;
                    }
                }
            }
        }
        return false;
    } else {
        for (let i = 0; i <= 7; i++) {
            for (let j = 0; j <= 7; j++) {
                if (board[i][j].startsWith("B")) {
                    if (ableMove([j + 1, i + 1, slotJ, slotI], board)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
};

const notInCheck = () => {
    //TODO
    return true;
};

const CastlingMoveL = (color, fromRank, fromFile, toRank, toFile, board) => {
    if (color === "B") {
        if (fromRank == 7 && fromFile == 4 && toRank == 7 && toFile == 2 && board[7][0] == "BR" &&
            board[7][1] == "" && board[7][2] == "" && board[7][3] == "" && notInCheck()) {
            return true;
        }
        return false;
    } else {
        if (fromRank == 0 && fromFile == 4 && toRank == 0 && toFile == 2 && board[0][0] == "WR" &&
            board[0][1] == "" && board[7][2] == "" && board[0][3] == "" && notInCheck()) {
            return true;
        }
        return false;
    }
};
const CastlingMoveS = (color, fromRank, fromFile, toRank, toFile, board) => {
    if (color === "B" && fromRank == 7 && fromFile == 4 && toRank == 7 && toFile == 6 && board[7][7] == "BR" &&
        board[7][6] == "" && board[7][5] == "" && notInCheck()) {
        return true;
    }
    if (fromRank == 0 && fromFile == 4 && toRank == 0 && toFile == 6 && board[0][7] == "WR" &&
        board[0][6] == "" && board[0][5] == "" && notInCheck()) {
        return true;
    }
    return false;

};

const clearMoveSliding = ({ fromRank, fromFile, toRank, toFile }, board) => {
    if (isSliding({ fromRank, fromFile, toRank, toFile }) == false) {
        return false;
    }
    if (fromRank == toRank) { // Same row, horizontal sliding move
        // Check if any of the tiles _between_ the starting and ending (exclusive) is occupied
        for (let i = Math.min(fromFile + 1, toFile + 1); i < Math.max(fromFile, toFile); i++) {
            if (board[fromRank][i] != "") {
                return false;
            }
        }
        return true;
    } else if (fromFile == toFile) { // Same column, vertical sliding move
        // Check if any of the tiles _between_ the starting and ending (exclusive) is occupied
        for (let i = Math.min(fromRank + 1, toRank + 1); i < Math.max(fromRank, toRank); i++) {
            if (board[i][fromFile] != "") {
                return false;
            }
        }
        return true;
    }
};

const clearMoveDiagonal = ({ fromRank, fromFile, toRank, toFile }, board) => {
    if (isDiagonal({ fromRank, fromFile, toRank, toFile }) == false) {
        return false;
    }
    const difference = Math.abs(fromRank - toRank);
    for (let i = 1; i < difference; i++) {
        if (fromRank < toRank && fromFile > toFile) {
            if (board[fromRank + i][fromFile - i] != "") {
                return false;
            }
        }
        if (fromRank < toRank && fromFile < toFile) {
            if (board[fromRank + i][fromFile + i] != "") {
                return false;
            }
        }
        if (fromRank > toRank && fromFile < toFile) {
            if (board[fromRank - i][fromFile + i] != "") {
                return false;
            }
        }
        if (fromRank > toRank && fromFile > toFile) {
            if (board[fromRank - i][fromFile - i] != "") {
                // console.log(board[fromRank + i][fromFile - i]);
                return false;
            }
        }
    }
    return true;
};


const ableMove = (move, board) => {
    const piece = board[move.fromRank][move.fromFile];
    const color = piece[0];
    const target = board[move.toRank][move.toFile];

    if (piece === "" || possibleMove(piece[0], target) == false) {
        return false;
    }

    return moveset[piece[1]](color, move, board, target);
};

function possibleMove(color, target) {
    return impossibleMoves[color].indexOf(target) == -1;
}

function isForward(color, { fromRank, toRank }) {
    return (color == "B") ? fromRank > toRank : fromRank < toRank;
}

function isDiagonal({ fromRank, fromFile, toRank, toFile }) {
    return Math.abs(fromRank - toRank) == Math.abs(fromFile - toFile);
}

function isSliding({ fromRank, fromFile, toRank, toFile }) {
    return (fromRank == toRank) || (fromFile == toFile);
}

export {
    ableMove,
    CastlingMoveL,
    CastlingMoveS
};