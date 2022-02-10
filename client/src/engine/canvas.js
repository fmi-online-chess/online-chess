import { log } from "../util/logger.js";

const pieceSprites = {
    "WK": { sx: 0, sy: 0, sw: 100, sh: 100, },
    "WQ": { sx: 100, sy: 0, sw: 100, sh: 100, },
    "WB": { sx: 200, sy: 0, sw: 100, sh: 100, },
    "WN": { sx: 300, sy: 0, sw: 100, sh: 100, },
    "WR": { sx: 400, sy: 0, sw: 100, sh: 100, },
    "WP": { sx: 500, sy: 0, sw: 100, sh: 100, },
    "BK": { sx: 0, sy: 100, sw: 100, sh: 100, },
    "BQ": { sx: 100, sy: 100, sw: 100, sh: 100, },
    "BB": { sx: 200, sy: 100, sw: 100, sh: 100, },
    "BN": { sx: 300, sy: 100, sw: 100, sh: 100, },
    "BR": { sx: 400, sy: 100, sw: 100, sh: 100, },
    "BP": { sx: 500, sy: 100, sw: 100, sh: 100, },
};

export function createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 450;
    canvas.height = 450;
    return canvas;
}

export function initRenderer(canvas, reversed, onAction, onSelect, isSpectator = false) {
    const sprites = new Image();
    sprites.onload = () => {
        log("Assets ready");
        render();
    };
    sprites.src = "/static/spritesheet.png";

    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");

    canvas.addEventListener("click", (event) => {
        if (!((toMove == "W" && !reversed) || (toMove == "B" && reversed))) {
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left - gridSize / 2) / gridSize);
        const y = Math.floor((event.clientY - rect.top - gridSize / 2) / gridSize);

        const file = files[x];
        const rank = ranks[y];
        if (file && rank) {
            if (selected == "") {
                if (onSelect(file + rank)) {
                    selected = file + rank;
                }
            } else {
                const move = validMoves.find(m => m.slice(0, 4) == (selected + file + rank));
                if (move) {
                    onAction(move);
                }
                validMoves = [];
                selected = "";
            }
        }
        render();
    });

    const gridSize = 50;
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px Tahoma";
    const light = "rgb(255, 206, 158)";
    const dark = "rgb(209, 139, 71)";
    const moveFrames = 30;

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
    if (reversed) {
        files.reverse();
        ranks.reverse();
    }

    let selected = "";
    let validMoves = [];
    let lastMoves = [];
    let oldSerializedState = null;
    let state = [];
    let toMove = null;


    return {
        canvas,
        setState(serializedState, nextToMove) {
            // Ensure the state is not empty during the diff-check
            oldSerializedState = oldSerializedState || JSON.parse(JSON.stringify(serializedState));

            [state, lastMoves] = deserializeState(oldSerializedState, serializedState, reversed);

            // There is unexpected behaviour when assigning a reference from the function parameter to a variable in the scope
            // It appears the parsing engine maintains the same address in memory and will place the paramter data inside the local variable
            oldSerializedState = JSON.parse(JSON.stringify(serializedState));
            toMove = isSpectator ? null : nextToMove;
            render();
        },
        showMoves(moves) {
            validMoves = moves;
            for (let move of moves) {
                let tint = drawSemi;
                if (move[4] == "x" || move[4] == "s") {
                    tint = drawAttack;
                } else if (move[4] == "o") {
                    tint = drawCastle;
                } else if (move[4] == "O") {
                    tint = drawCastle;
                }
                tint(move.slice(2));
            }
        },
        render
    };

    function render() {
        let isMoving = false;

        clear();
        drawBoard();
        if (selected != "") {
            drawHighlight(selected);
        } else {
            for (let move of lastMoves) {
                let { oldFile, oldRank, newFile, newRank } = move;
                if (reversed) {
                    oldFile = 7 - oldFile;
                    newFile = 7 - newFile;
                } else {
                    oldRank = 7 - oldRank;
                    newRank = 7 - newRank;
                }

                drawSemi([files[oldFile], ranks[oldRank]]);
                drawHighlight([files[newFile], ranks[newRank]]);
            }
        }

        for (let piece of state) {
            drawPiece(piece);
            if (piece.isMoving) {
                isMoving = true;
            }
        }

        if (isMoving) {
            requestAnimationFrame(render);
        }
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawPiece(piece) {
        let x = piece.x;
        let y = piece.y;
        if (piece.isMoving) {
            if (piece.frame >= moveFrames) {
                piece.isMoving = false;
                piece.frame = 0;
                piece.oldX = piece.x;
                piece.oldY = piece.y;
            } else {
                piece.frame++;
                x = lerp(piece.oldX, piece.x, piece.frame / moveFrames);
                y = lerp(piece.oldY, piece.y, piece.frame / moveFrames);
            }
        }

        const sprite = pieceSprites[piece.type];

        ctx.drawImage(
            sprites,
            sprite.sx,
            sprite.sy,
            sprite.sw,
            sprite.sh,
            (x - 1) * gridSize + gridSize / 2,
            (y - 1) * gridSize + gridSize / 2,
            gridSize,
            gridSize
        );
    }

    function drawBoard() {
        ctx.save();
        ctx.fillStyle = dark;
        ctx.fillRect(0, 0, gridSize * 9, gridSize * 9);
        ctx.strokeRect(gridSize / 2, gridSize / 2, gridSize * 8, gridSize * 8);
        ctx.restore();

        for (let rank = 1; rank <= 8; rank++) {
            for (let file = 1; file <= 8; file++) {
                drawSquare(file, rank);
            }
        }

        ctx.save();
        ctx.fillStyle = light;
        for (let i in files) {
            ctx.fillText(files[i], gridSize * i + gridSize, 10);
            ctx.fillText(files[i], gridSize * i + gridSize, gridSize * 8 + 40);
        }
        for (let i in ranks) {
            ctx.fillText(ranks[i], 10, gridSize * i + gridSize);
            ctx.fillText(ranks[i], gridSize * 8 + 40, gridSize * i + gridSize);
        }
        ctx.restore();
    }

    function drawSquare(file, rank) {
        ctx.save();
        ctx.fillStyle = ((file + rank) % 2) ? dark : light;

        const x = (file - 1) * gridSize + gridSize / 2;
        const y = (rank - 1) * gridSize + gridSize / 2;
        ctx.fillRect(x, y, gridSize, gridSize);

        ctx.restore();
    }

    function drawTint(selected, color) {
        if (files.indexOf(selected[0]) == -1 || ranks.indexOf(selected[1]) == -1) {
            return;
        }
        ctx.save();
        ctx.fillStyle = color;

        const file = files.indexOf(selected[0]) + 1;
        const rank = ranks.indexOf(selected[1]) + 1;

        const x = (file - 1) * gridSize + gridSize / 2;
        const y = (rank - 1) * gridSize + gridSize / 2;
        ctx.fillRect(x, y, gridSize, gridSize);

        ctx.restore();
    }

    function drawHighlight(selected) {
        drawTint(selected, "rgba(64, 255, 64, 0.75)");
    }

    function drawSemi(selected) {
        drawTint(selected, "rgba(128, 255, 128, 0.4)");
    }

    function drawAttack(selected) {
        drawTint(selected, "rgba(255, 64, 64, 0.5)");
    }

    function drawCastle(selected) {
        drawTint(selected, "rgba(64, 64, 255, 0.5)");
    }
}

function lerp(a, b, p) {
    return a + (b - a) * p;
}

export function stateToPiece(type, rank, file, reversed) {
    const piece = {
        type,
        oldX: file + 1,
        oldY: 8 - (rank),
        frame: 0,
        x: file + 1,
        y: 8 - (rank),
        isMoving: false,
        moveFrom(oldRank, oldFile) {
            piece.oldX = oldFile + 1;
            piece.oldY = 8 - (oldRank);
            if (reversed) {
                piece.oldX = 9 - piece.oldX;
                piece.oldY = 9 - piece.oldY;
            }
            piece.isMoving = true;
        }
    };
    if (reversed) {
        piece.x = 9 - piece.x;
        piece.y = 9 - piece.y;
        piece.oldX = 9 - piece.oldX;
        piece.oldY = 9 - piece.oldY;
    }
    return piece;
}

function deserializeState(oldState, newState, reversed) {
    const state = [];
    const moves = {};

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {

            const isTarget = diffCheckState(oldState, newState, rank, file, moves);

            if (newState[rank][file] != "") {
                const piece = stateToPiece(newState[rank][file], rank, file, reversed);
                if (isTarget) {
                    const origin = moves[piece.type];
                    if (origin) {
                        piece.moveFrom(origin.oldRank, origin.oldFile);
                        piece.oldRank = origin.oldRank;
                        piece.oldFile = origin.oldFile;
                    }
                    moves[piece.type] = piece;
                    piece.newRank = rank;
                    piece.newFile = file;
                }
                state.push(piece);
            }
        }
    }

    return [state, Object.values(moves)];
}

function diffCheckState(oldState, newState, rank, file, moves) {
    if (oldState[rank][file] != "" && newState[rank][file] == "") {
        const piece = oldState[rank][file];

        if (moves[piece] != undefined) {
            moves[piece].moveFrom(rank, file);
        } else {
            moves[piece] = {};
        }
        moves[piece].oldRank = rank;
        moves[piece].oldFile = file;

        return false;
    } else {
        // Target discovered ?
        return oldState[rank][file] != newState[rank][file];
    }
}