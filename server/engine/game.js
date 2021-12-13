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
const impossibleBlackMoves = ["", "BR", "BN", "BB", "BQ", "BK", "BP", "WK"];
const impossibleWhiteMoves = ["", "WR", "WN", "WB", "WQ", "WK", "WP", "BK"];

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
                        if (!(fromRank - toRank == 1 && Math.abs(fromFile - toFile) == 1 &&
                                impossibleBlackMoves.indexOf(board[toRank][toFile]) == -1 &&
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
                        if (!(toRank - fromRank == 1 && Math.abs(fromFile - toFile) == 1 &&
                                impossibleWhiteMoves.indexOf(board[toRank][toFile]) == -1 &&
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
                case "BN":
                    break;
            }
            board[fromRank][fromFile] = "";
            board[toRank][toFile] = piece;

            return true;
        }
    };
}