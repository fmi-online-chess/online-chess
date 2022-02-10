import { log } from "../util/logger.js";
import { createCanvas, initRenderer } from "./canvas.js";


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

function createBoard() {
    return [
        ["WR", "WN", "WB", "WQ", "WK", "WB", "WN", "WR"],
        ["WP", "WP", "WP", "WP", "WP", "WP", "WP", "WP"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["BP", "BP", "BP", "BP", "BP", "BP", "BP", "BP"],
        ["BR", "BN", "BB", "BQ", "BK", "BB", "BN", "BR"]
    ];
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

export function createController(onAction, onSelect, color, updateTimers, isSpectator) {
    const canvas = createCanvas();
    const gfx = initRenderer(canvas, color == "B", onActionProxy, onSelectProxy, isSpectator);
    gfx.render();

    const board = createBoard();

    const game = {
        onAction(moveData) {
            if (moveData.includes("-")) {
                updateTimers([0, 0, null, color == "B"]);
                return gfx.setState(board, null);
            }

            const tokens = moveData.split(":");
            const move = tokens.slice(-1)[0];
            const fromFile = index[move[2]];
            const fromRank = index[move[3]];
            const toFile = index[move[4]];
            const toRank = index[move[5]];

            const piece = board[fromRank][fromFile];
            board[fromRank][fromFile] = "";
            board[toRank][toFile] = piece;

            // Special moves
            if (move[6] == "O") {           // Long castle
                board[fromRank][0] = "";
                board[fromRank][3] = piece[0] + "R";
            } else if (move[6] == "o") {    // Short castle
                board[fromRank][7] = "";
                board[fromRank][5] = piece[0] + "R";
            } else if (move[6] == "s") {    // En passant
                board[piece[0] == "B" ? 3 : 4][toFile] = "";
            }

            const toMove = piece[0] == "B" ? "W" : "B";

            gfx.setState(board, toMove);
            if (tokens.length > 1) {
                // Received color indicates who moved last
                updateTimers([Number(tokens[0]), Number(tokens[1]), tokens[2][0] == "W" ? "black" : "white", color == "B"]);
            }
        },
        onMoves(moves) {
            gfx.showMoves(moves);
        },
        setState(state) {
            const tokens = state.split(":");
            const boardState = tokens.slice(-2).join(":");
            deserializeBoard(board, boardState);
            const toMove = boardState[0];
            gfx.setState(board, toMove);
            if (tokens.length > 2) {
                // Received color indicates who is to move
                updateTimers([Number(tokens[0]), Number(tokens[1]), tokens[2] == "B" ? "black" : "white", color == "B"]);
            }
        },
        canvas: gfx.canvas
    };

    return game;

    function onActionProxy(action) {
        const piece = board[index[action[1]]][index[action[0]]];
        if (piece[0] != color) {
            return;
        } else {
            onAction(piece + action);
        }
    }

    function onSelectProxy(position) {
        const piece = board[index[position[1]]][index[position[0]]];
        if (piece != "" && piece[0] == color) {
            onSelect(position);
            return true;
        } else {
            return false;
        }
    }
}