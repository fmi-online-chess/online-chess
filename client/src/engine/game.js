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

export function createGame() {
    const board = createBoard();

    return {
        render(game) {
            return boardTemplate(board, (indexes) => onAction(indexes, game));
        },
        setState(state) {
            deserializeBoard(board, state);
        }
    };

    function onAction(indexes, game) {
        if (indexes) {
            const fromFile = files[indexes[0]];
            const fromRank = ranks[indexes[1]];
            const toFile = files[indexes[2]];
            const toRank = ranks[indexes[3]];
            game.action(fromFile + fromRank + toFile + toRank);
        } else {
            game.action();
        }
    }
}