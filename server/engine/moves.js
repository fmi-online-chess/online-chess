const impossibleMoves = {
    "B": ["BR", "BN", "BB", "BQ", "BK", "BP"],
    "W": ["WR", "WN", "WB", "WQ", "WK", "WP"]
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
        if (castlingMove(color, move, board)) {
            return true;
        }
        if (Math.abs(move.fromRank - move.toRank) > 1 || Math.abs(move.fromFile - move.toFile) > 1) {
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


function isAttacked(color, board, toFile, toRank) {
    for (let rank = 0; rank <= 7; rank++) {
        for (let file = 0; file <= 7; file++) {
            const piece = board[rank][file];
            if (piece[0] && piece[0] != color && ableMove({ fromRank: rank, fromFile: file, toRank, toFile }, board)) {
                return true;
            }
        }
    }
    return false;
}

function inCheck(color, board) {
    const target = findKing(color, board);
    return isAttacked(color, board, target.file, target.rank);
}

function findKing(color, board) {
    for (let rank = 0; rank <= 7; rank++) {
        for (let file = 0; file <= 7; file++) {
            if (board[rank][file] == (color + "K")) {
                return { rank, file };
            }
        }
    }
}

function castlingMove(color, { fromRank, fromFile, toRank, toFile }, board) {
    const rank = (color == "B") ? 7 : 0;
    let path = [];
    if (toFile == 2) {
        path = [0, 1, 2, 3, 4];
    } else if (toFile == 6) {
        path = [7, 6, 5, 4];
    } else {
        return false;
    }
    if (fromRank == rank && fromFile == 4 && toRank == rank && board[rank][path[0]] == (color + "R") &&
        !path.slice(1, -1).some(file => board[rank][file] != "") &&
        !path.some(file => isAttacked(color, board, file, rank))) {
        return true;
    }
    return false;
}

function clearMoveSliding({ fromRank, fromFile, toRank, toFile }, board) {
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
}

function clearMoveDiagonal({ fromRank, fromFile, toRank, toFile }, board) {
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
                return false;
            }
        }
    }
    return true;
}


function ableMove(move, board) {
    const piece = board[move.fromRank][move.fromFile];
    const color = piece[0];
    const target = board[move.toRank][move.toFile];

    if (piece === "" || possibleMove(piece[0], target) == false) {
        return false;
    }

    return moveset[piece[1]](color, move, board, target);
}

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
    inCheck,
    castlingMove
};