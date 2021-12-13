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

export function createController(onAction) {
    const canvas = createCanvas();
    const gfx = initRenderer(canvas, false, onAction);
    gfx.render();
    
    const board = createBoard();

    const game = {
        onAction(move) {
            const fromFile = index[move[0]];
            const fromRank = index[move[1]];
            const toFile = index[move[2]];
            const toRank = index[move[3]];

            const piece = board[fromRank][fromFile];
            board[fromRank][fromFile] = "";
            board[toRank][toFile] = piece;
            gfx.setState(board);
        },
        setState(state) {
            deserializeBoard(board, state);
            gfx.setState(board);
        },
        canvas: gfx.canvas
    };

    return game;
}