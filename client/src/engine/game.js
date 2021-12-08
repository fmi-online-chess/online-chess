import { boardTemplate } from "./view.js";


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

export function createGame() {
    const board = createBoard();

    return {
        render() {
            return boardTemplate(board);
        },
        move(action) {
            const fromCol = index[action[0]];
            const fromRow = index[action[1]];
            const toCol = index[action[2]];
            const toRow = index[action[3]];

            const piece = board[fromRow][fromCol];
            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = "";
        }
    };
}