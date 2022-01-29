const index = {
    "a": 0,
    "b": 1,
    "c": 2,
    "d": 3,
    "e": 4,
    "f": 5,
    "g": 6,
    "h": 7,
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,
};

const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

function createBoard(state) {
    const board = [
        ["WR", "WN", "WB", "WQ", "WK", "WB", "WN", "WR"],
        ["WP", "WP", "WP", "WP", "WP", "WP", "WP", "WP"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["BP", "BP", "BP", "BP", "BP", "BP", "BP", "BP"],
        ["BR", "BN", "BB", "BQ", "BK", "BB", "BN", "BR"]
    ];
    if (state) {
        deserializeBoard(board, state);
    }
    return board;
}
const impossibleBlackMoves = ["BR", "BN", "BB", "BQ", "BK", "BP", "WK"];
const impossibleWhiteMoves = ["WR", "WN", "WB", "WQ", "WK", "WP", "BK"];

function deserializeBoard(board, state) {
    for (let rank of board) {
        rank.fill("");
    }
    for (let c = 0; c < state.length; c += 4) {
        const token = state.slice(c, c + 4);
        const file = index[token[0]];
        const rank = index[token[1]];
        const piece = token.slice(2);
        board[rank][file] = piece;
    }
}

const isAttacked = (board, color, slotJ, slotI) => {
    if (color === 'black') {
        for (let i = 0; i <= 7; i++) {
            for (let j = 0; j <= 7; j++) {
                if (board[i][j].startsWith('W')) {
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
                if (board[i][j].startsWith('B')) {
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
    if (color === 'black') {
        if (fromRank == 7 && fromFile == 4 && toRank == 7 && toFile == 2 && board[7][0] == 'BR' &&
            board[7][1] == '' && board[7][2] == '' && board[7][3] == '' && notInCheck()) {
            return true;
        }
        return false;
    } else {
        if (fromRank == 0 && fromFile == 4 && toRank == 0 && toFile == 2 && board[0][0] == 'WR' &&
            board[0][1] == '' && board[7][2] == '' && board[0][3] == '' && notInCheck()) {
            return true;
        }
        return false;
    }
};
const CastlingMoveS = (color, fromRank, fromFile, toRank, toFile, board) => {
    if (color === 'black' && fromRank == 7 && fromFile == 4 && toRank == 7 && toFile == 6 && board[7][7] == 'BR' &&
        board[7][6] == '' && board[7][5] == '' && notInCheck()) {
        return true;
    }
    if (fromRank == 0 && fromFile == 4 && toRank == 0 && toFile == 6 && board[0][7] == 'WR' &&
        board[0][6] == '' && board[0][5] == '' && notInCheck()) {
        return true;
    }
    return false;

};

const clearMoveHV = (fromRank, fromFile, toRank, toFile, board) => {
    if (fromRank == toRank) { // Same row, horizontal sliding move
        // Single step
        if (Math.abs(fromFile - toFile) == 1) {
            return true;
        }
        // Check if any of the tiles _between_ the starting and ending (exclusive) is occupied
        for (let i = Math.min(fromFile + 1, toFile + 1); i < Math.max(fromFile, toFile); i++) {
            if (board[fromRank][i] != '') {
                return false;
            }
        }
        return true;
    } else if (fromFile == toFile) { // Same column, vertical sliding move
        // Single step
        if (Math.abs(fromRank - toRank) == 1) {
            return true;
        }
        // 
        for (let i = Math.min(fromRank + 1, toRank); i < Math.max(fromRank, toRank); i++) {
            if (board[i][fromFile] != '') {
                return false;
            }
        }
        return true;
    }

};

const clearMoveDg = (fromRank, fromFile, toRank, toFile, board) => {
    const difference = Math.abs(fromRank - toRank);
    for (let i = 1; i < difference; i++) {
        if (fromRank < toRank && fromFile > toFile) {
            if (board[fromRank + i][fromFile - i] != '') {
                return false;
            }
        }
        if (fromRank < toRank && fromFile < toFile) {
            if (board[fromRank + i][fromFile + i] != '') {
                return false;
            }
        }
        if (fromRank > toRank && fromFile < toFile) {
            if (board[fromRank - i][fromFile + i] != '') {
                return false;
            }
        }
        if (fromRank > toRank && fromFile > toFile) {
            if (board[fromRank - i][fromFile - i] != '') {
                console.log(board[fromRank + i][fromFile - i]);
                return false;
            }
        }
    }
    return true;
};


const ableMove = (action, board) => {
    const fromFile = index[action[0]];
    const fromRank = index[action[1]];
    const toFile = index[action[2]];
    const toRank = index[action[3]];
    if (board[fromRank][fromFile] === "") {
        return false;
    }
    const piece = board[fromRank][fromFile];
    switch (piece) {
        case "BP":
            if (fromFile !== toFile) {
                if (!(fromRank - toRank == 1 && Math.abs(fromFile - toFile) == 1 && [...impossibleBlackMoves, ''].indexOf(board[toRank][toFile]) == -1 &&
                    fromRank > toRank)) {
                    return false;
                }
            } else {
                if (fromRank == 6) {
                    if (!((toRank === 4 || toRank === 5) && board[toRank][toFile] == "")) {
                        return false;
                    }
                } else {
                    if (!(fromRank - toRank == 1 && toRank <= 7 && board[toRank][toFile] == "")) {
                        return false;
                    }
                }
            }
            break;
        case "WP":
            if (fromFile !== toFile) {
                if (!(toRank - fromRank == 1 && Math.abs(fromFile - toFile) == 1 && [...impossibleWhiteMoves, ''].indexOf(board[toRank][toFile]) == -1 &&
                    toRank > fromRank)) {
                    return false;
                }
            } else {
                if (fromRank == 1) {
                    if (!((toRank === 2 || toRank === 3) && board[toRank][toFile] == "")) {
                        return false;
                    }
                } else {
                    if (!(toRank - fromRank == 1 && toRank <= 7 && board[toRank][toFile] == "")) {
                        return false;
                    }
                }
            }
            break;
        case "BK":
            if (CastlingMoveL('black', fromRank, fromFile, toRank, toFile, board) ||
                CastlingMoveS('black', fromRank, fromFile, toRank, toFile, board)) {
                break;
            }
            if (!(Math.abs(fromRank - toRank) <= 1 && Math.abs(fromFile - toFile) <= 1 &&
                impossibleBlackMoves.indexOf(board[toRank][toFile]) == -1 && !isAttacked(board, 'black', toFile, toRank))) {
                return false;
            }
            break;
        case "WK":
            if (CastlingMoveL('white', fromRank, fromFile, toRank, toFile, board) ||
                CastlingMoveS('white', fromRank, fromFile, toRank, toFile, board)) {
                break;
            }
            if (!(Math.abs(fromRank - toRank) <= 1 && Math.abs(fromFile - toFile) <= 1 &&
                impossibleWhiteMoves.indexOf(board[toRank][toFile]) == -1 && !isAttacked(board, 'white', toFile, toRank))) {
                return false;
            }
            break;
        case "BN":
            if (!(Math.abs(fromFile - toFile) != Math.abs(fromRank - toRank) && Math.abs(fromFile - toFile) <= 2 &&
                Math.abs(fromFile - toFile) > 0 && Math.abs(fromRank - toRank) <= 2 &&
                Math.abs(fromRank - toRank) > 0 && impossibleBlackMoves.indexOf(board[toRank][toFile]) == -1)) {
                return false;
            }
            break;
        case "WN":
            if (!(Math.abs(fromFile - toFile) != Math.abs(fromRank - toRank) && Math.abs(fromFile - toFile) <= 2 &&
                Math.abs(fromFile - toFile) > 0 && Math.abs(fromRank - toRank) <= 2 &&
                Math.abs(fromRank - toRank) > 0 && impossibleWhiteMoves.indexOf(board[toRank][toFile]) == -1)) {
                return false;
            }
            break;
        case "BR":
            if (!((fromRank == toRank || fromFile == toFile) && clearMoveHV(fromRank, fromFile, toRank, toFile, board) &&
                impossibleBlackMoves.indexOf(board[toRank][toFile]) == -1)) {
                return false;
            }
            break;
        case "WR":
            if (!((fromRank == toRank || fromFile == toFile) && clearMoveHV(fromRank, fromFile, toRank, toFile, board) &&
                impossibleWhiteMoves.indexOf(board[toRank][toFile]) == -1)) {
                return false;
            }
            break;
        case "BB":
            if (!(Math.abs(fromRank - toRank) == Math.abs(fromFile - toFile) && clearMoveDg(fromRank, fromFile, toRank, toFile, board) &&
                impossibleBlackMoves.indexOf(board[toRank][toFile]) == -1)) {
                return false;
            }
            break;
        case "WB":
            if (!(Math.abs(fromRank - toRank) == Math.abs(fromFile - toFile) && clearMoveDg(fromRank, fromFile, toRank, toFile, board) &&
                impossibleWhiteMoves.indexOf(board[toRank][toFile]) == -1)) {
                return false;
            }
            break;
        case "BQ":
            if (!((Math.abs(fromRank - toRank) == Math.abs(fromFile - toFile) || (fromRank == toRank || fromFile == toFile)) &&
                impossibleBlackMoves.indexOf(board[toRank][toFile]) == -1 &&
                (clearMoveDg(fromRank, fromFile, toRank, toFile, board) || clearMoveHV(fromRank, fromFile, toRank, toFile, board)))) {
                return false;
            }
            break;
        case "WQ":
            if (!((Math.abs(fromRank - toRank) == Math.abs(fromFile - toFile) || (fromRank == toRank || fromFile == toFile)) &&
                impossibleWhiteMoves.indexOf(board[toRank][toFile]) == -1 &&
                (clearMoveDg(fromRank, fromFile, toRank, toFile, board) /*|| clearMoveHV(fromRank, fromFile, toRank, toFile, board)*/))) {
                return false;
            }
            break;

    }
    // board[fromRank][fromFile] = "";
    // board[toRank][toFile] = piece;

    return true;
};

const confirmMove = (action, board) => {
    if (ableMove(action, board)) {
        const fromFile = index[action[0]];
        const fromRank = index[action[1]];
        const toFile = index[action[2]];
        const toRank = index[action[3]];

        const piece = board[fromRank][fromFile];

        if (piece == "BK") {
            if (CastlingMoveL('black', fromRank, fromFile, toRank, toFile, board)) {
                board[7][0] = '';
                board[7][3] = 'BR';
            }
            if (CastlingMoveS('black', fromRank, fromFile, toRank, toFile, board)) {
                board[7][7] = '';
                board[7][5] = 'BR';
            }
        } else if (piece == "WK") {
            if (CastlingMoveL('white', fromRank, fromFile, toRank, toFile, board)) {
                board[0][0] = '';
                board[0][3] = 'WR';
            }
            if (CastlingMoveS('white', fromRank, fromFile, toRank, toFile, board)) {
                board[0][7] = '';
                board[0][5] = 'WR';
            }
        }

        board[fromRank][fromFile] = "";
        board[toRank][toFile] = piece;

        return true;
    } else {
        return false;
    }
};

export function createGame(initialState) {
    const board = createBoard(initialState);

    return {
        serialize() {
            const state = [];
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    if (board[rank][file]) {
                        state.push(files[file] + ranks[rank] + board[rank][file]);
                    }
                }
            }
            return state.join("");
        },
        move(action) {
            return confirmMove(action, board);
        },
        validMoves(position) {
            // TODO generate list of valid moves for starting position
            // dumb way - iterate entire board
            // less dumb way - limit moves to directions
            // return ableMove(position, board);
            const valid = [];
            for (let file of files) {
                for (let rank of ranks) {
                    const move = position + file + rank;
                    if (ableMove(move, board)) {
                        valid.push(move);
                    }
                }
            }
            return valid;
        }
    };
}