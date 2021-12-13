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

export function initRenderer(canvas, reversed, onAction) {
    const sprites = new Image();
    sprites.onload = () => {
        console.log("Assets ready");
        render();
    };
    sprites.src = "/static/spritesheet.png";

    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");

    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left - gridSize / 2) / gridSize);
        const y = Math.floor((event.clientY - rect.top - gridSize / 2) / gridSize);

        const file = files[x];
        const rank = ranks[y];
        if (file && rank) {
            if (selected == "") {
                selected = file + rank;
            } else {
                onAction(selected + file + rank);
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

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
    if (reversed) {
        files.reverse();
        ranks.reverse();
    }

    let selected = "";
    let state = [];

    let lastTime = 0;
    let delta = 0;

    // requestAnimationFrame(animate);

    return {
        canvas,
        setState(newState) {
            state = [];
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    if (newState[rank][file] != "") {
                        state.push(stateToPiece(newState[rank][file], rank, file, reversed));
                    }
                }
            }
            render();
        },
        render
    };

    function render() {
        clear();
        drawBoard();
        if (selected != "") {
            drawHighlight(selected);
        }
        for (let piece of state) {
            drawPiece(piece);
        }
    }

    function animate(time) {
        delta += time - lastTime;
        lastTime = time;

        /*
        while (delta >= 20) {
            c.x += c.xVel;
            if ((c.x > 0 && c.x > 800)
                || (c.x < 0 && c.x < 0)) {
                c.xVel *= -1;
            }

            c.y += c.yVel;
            if ((c.y > 0 && c.y > 600)
                || (c.y < 0 && c.y < 0)) {
                c.yVel *= -1;
            }

            delta -= 20;
        }
        */

        clear();
        drawBoard();

        /*
        if (alive) {
            requestAnimationFrame(animate);
        }
        */
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawPiece(piece) {
        let x = piece.x;
        let y = piece.y;
        if (piece.isMoving) {
            if (piece.frame >= 100) {
                piece.isMoving = false;
                piece.frame = 0;
                piece.oldX = piece.x;
                piece.oldY = piece.y;
            } else {
                piece.frame++;
                x = lerp(piece.oldX, piece.x, piece.frame / 100);
                y = lerp(piece.oldY, piece.y, piece.frame / 100);
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

    function drawHighlight(selected) {
        ctx.save();
        ctx.fillStyle = "rgba(128, 255, 128, 0.5)";

        const file = files.indexOf(selected[0]) + 1;
        const rank = ranks.indexOf(selected[1]) + 1;

        const x = (file - 1) * gridSize + gridSize / 2;
        const y = (rank - 1) * gridSize + gridSize / 2;
        ctx.fillRect(x, y, gridSize, gridSize);

        ctx.restore();
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
        isMoving: false
    };
    if (reversed) {
        piece.x = 9 - piece.x;
        piece.y = 9 - piece.y;
        piece.oldX = 9 - piece.oldX;
        piece.oldY = 9 - piece.oldY;
    }
    return piece;
}