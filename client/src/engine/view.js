import { html } from "../lib.js";


const pieces = {
    W: {
        K: "\u2654",
        Q: "\u2655",
        R: "\u2656",
        B: "\u2657",
        N: "\u2658",
        P: "\u2659"
    },
    B: {
        K: "\u265A",
        Q: "\u265B",
        R: "\u265C",
        B: "\u265D",
        N: "\u265E",
        P: "\u265F"
    }
};

export const boardTemplate = (board) => html`
<div class="r">
    ${row(0, board[7])}
    ${row(1, board[6])}
    ${row(0, board[5])}
    ${row(1, board[4])}
    ${row(0, board[3])}
    ${row(1, board[2])}
    ${row(0, board[1])}
    ${row(1, board[0])}
</div>`;

const row = (i, data) => html`
<div class="r">
    ${data.map((p, j) => cell((i + j) % 2, p))}
</div>`;

const cell = (i, p) => html`<div class="c ${i ? " b" : "w"}">${piece(p, i)}</div>`;

const piece = (p, i) => {
    if (p) {
        let color = p[0];
        if (i == 1) {
            color = (color == "W") ? "B" : "W";
        }
        return html`<span class="p">${pieces[color][p[1]]}</span>`;
    } else {
        return null;
    }
};