import { ableMove, inCheck, castlingMove } from "./moves.js";

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

function copyBoard(board) {
    return JSON.parse(JSON.stringify(board));
}


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

function confirmMove(action, board) {
    const fromFile = index[action[2]];
    const fromRank = index[action[3]];
    const toFile = index[action[4]];
    const toRank = index[action[5]];
    const move = {
        fromFile,
        fromRank,
        toFile,
        toRank
    };

    if (ableMove(move, board)) {
        const piece = board[fromRank][fromFile];

        if (piece[1] == "K" && castlingMove(piece[0], move, board)) {
            const rookFile = (toFile == 2) ? 0 : 7;
            const rookTo = (toFile == 2) ? 3 : 5;
            board[fromRank][rookFile] = "";
            board[fromRank][rookTo] = piece[0] + "R";
        }

        board[fromRank][fromFile] = "";
        board[toRank][toFile] = piece;

        return true;
    } else {
        return false;
    }
}

export function createGame(initialState, initialHistory) {
    const board = createBoard(initialState);
    const history = initialHistory.slice();

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
            const color = action[0];
            const propagated = copyBoard(board);
            confirmMove(action, propagated);
            if (inCheck(color, propagated)) {
                return false;
            } else if (confirmMove(action, board)) {
                history.push(action);
                return true;
            } else {
                return false;
            }
        },
        validMoves(position) {
            // Generate list of valid moves for starting position
            // dumb way - iterate entire board
            // less dumb way - limit moves to directions
            // 200 IQ way - use an expanding mask to only generate valid moves

            const valid = [];
            for (let file of files) {
                for (let rank of ranks) {
                    
                    const fromFile = index[position[0]];
                    const fromRank = index[position[1]];
                    const toFile = index[file];
                    const toRank = index[rank];
                    const piece = board[fromRank][fromFile];
                    const color = piece[0];
                    const targetMove = piece + position + file + rank;
                    const move = {
                        fromFile,
                        fromRank,
                        toFile,
                        toRank
                    };

                    if (ableMove(move, board)) {
                        const propagated = copyBoard(board);
                        confirmMove(targetMove, propagated);
                        if (inCheck(color, propagated) == false) {
                            let special = "";
                            if (board[toRank][toFile] != "") {
                                special = "x";
                            } else if (piece[1] == "K" && castlingMove(color, move, board)) {
                                special = (toFile == 2) ? "O" : "o";
                            }
                            valid.push(targetMove.slice(2,6) + special);
                        }
                    }
                }
            }
            return valid;
        }
    };
}