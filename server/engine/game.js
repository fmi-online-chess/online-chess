import { index, files, ranks, ableMove, inCheck, castlingMove, isEnPassant } from "./moves.js";


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
    const positions = state.slice(2);
    for (let rank of board) {
        rank.fill("");
    }
    for (let c = 0; c < positions.length; c += 4) {
        const token = positions.slice(c, c + 4);
        const file = index[token[0]];
        const rank = index[token[1]];
        const piece = token.slice(2);
        board[rank][file] = piece;
    }
}

function confirmMove(action, board, history) {
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

    if (ableMove(move, board, history)) {
        const piece = board[fromRank][fromFile];

        if (piece[1] == "K" && castlingMove(piece[0], move, board, history)) {
            const rookFile = (toFile == 2) ? 0 : 7;
            const rookTo = (toFile == 2) ? 3 : 5;
            board[fromRank][rookFile] = "";
            board[fromRank][rookTo] = piece[0] + "R";
        } else if (piece[1] == "P" && isEnPassant(move, history[history.length - 1])) {
            const lastMove = history[history.length - 1];
            board[index[lastMove[5]]][index[lastMove[4]]] = "";
        }

        board[fromRank][fromFile] = "";
        board[toRank][toFile] = piece;

        return true;
    } else {
        return false;
    }
}

function findValidMoves(board, position, history) {
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

            if (ableMove(move, board, history)) {
                const propagated = copyBoard(board);
                confirmMove(targetMove, propagated, history);
                if (inCheck(color, propagated, [...history, targetMove]) == false) {
                    let special = "";
                    if (board[toRank][toFile] != "") {
                        special = "x";
                    } else if (isEnPassant(move, history[history.length - 1])) {
                        special = "s";
                    } else if (piece[1] == "K" && castlingMove(color, move, board, history)) {
                        special = (toFile == 2) ? "O" : "o";
                    }
                    valid.push(targetMove.slice(2, 6) + special);
                }
            }
        }
    }
    return valid;
}

function countMoves(board, color, history) {
    let moves = 0;
    for (let file of files) {
        for (let rank of ranks) {
            const piece = board[index[rank]][index[file]];
            if (piece && piece[0] == color) {
                moves += findValidMoves(board, file + rank, history).length;
            }
        }
    }
    return moves;
}

export function createGame(room) {
    const board = createBoard(room.state);
    const history = room.history.slice();

    return {
        started: room.started,
        remainingWhite: room.remainingWhite,
        remainingBlack: room.remainingBlack,
        lastMoved: room.lastMoved,
        serialize() {
            const state = [];
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    if (board[rank][file]) {
                        state.push(files[file] + ranks[rank] + board[rank][file]);
                    }
                }
            }
            const lastMove = history[history.length - 1];
            const toMove = (lastMove == undefined || lastMove[0] == "B") ? "W" : "B";
            return toMove + ":" + state.join("");
        },
        move(action) {
            const color = action[0];
            const propagated = copyBoard(board);
            confirmMove(action, propagated, history);
            if (inCheck(color, propagated, [...history, action])) {
                return false;
            } else if (confirmMove(action, board, history)) {
                history.push(action);
                return true;
            } else {
                return false;
            }
        },
        validMoves(position) {
            return findValidMoves(board, position, history);
        },
        playerStatus(color) {
            const moves = countMoves(board, color, history);
            if (moves == 0) {
                if (inCheck(color, board, history)) {
                    return "check mate";
                } else {
                    return "stalemate";
                }
            } else {
                return "ok";
            }
        }
    };
}