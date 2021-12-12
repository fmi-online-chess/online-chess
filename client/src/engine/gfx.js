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

export const boardTemplate = (board, onAction) => {
    return html`
    <div class="r" @click=${(event)=> onClick(event, onAction)}>
        ${reverseMap(board, (r, i) => row(i, r))}
    </div>`;
};

const row = (i, data) => html`
<div class="r">
    ${data.map((p, j) => cell(i, j, p))}
</div>`;

const cell = (i, j, p) => html`<div class="c ${((i + j) % 2) ? " w" : "b" } ${(`${j}${i}` == selectionState) ? "selected" : ""}" data-position=${`${j}${i}`} data-piece=${p}>${piece(p, (i + j) % 2)}</div>`;

const piece = (p, i) => {
    if (p) {
        let color = p[0];
        if (i == 0) {
            color = (color == "W") ? "B" : "W";
        }
        return html`<span class="p">${pieces[color][p[1]]}</span>`;
    } else {
        return null;
    }
};

let selectionState = null;

function reverseMap(array, fn) {
    const result = [];
    for (let i = array.length - 1; i >= 0; i--) {
        result.push(fn(array[i], i));
    }
    return result;
}

function onClick(event, onAction) {
    let target = event.target;
    if (event.target.tagName == "SPAN") {
        target = target.parentNode;
    }

    if (selectionState == null) {
        if (target.dataset.piece) {
            selectionState = target.dataset.position;
            onAction();
        }
    } else {
        // TODO validate move
        onAction(selectionState + target.dataset.position);
        selectionState = null;
    }
}