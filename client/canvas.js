const WK = document.getElementById("WK");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let alive = true;

window.stop = () => alive = false;


init(ctx);

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function init(ctx) {
    canvas.addEventListener("click", (event) => {
        if (!king.isMoving) {
            const x = Math.ceil((event.clientX - 8 - gridSize / 2) / gridSize);
            const y = Math.ceil((event.clientY - 8 - gridSize / 2) / gridSize);

            console.log(x, y);
            king.isMoving = true;
            king.x = x;
            king.y = y;
        }
    });
    /*
    window.addEventListener("keydown", (event) => {
        event.preventDefault();
        if (!king.isMoving) {
            switch (event.code) {
                case "ArrowLeft":
                    king.x--;
                    king.isMoving = true;
                    break;
                case "ArrowRight":
                    king.x++;
                    king.isMoving = true;
                    break;
                case "ArrowUp":
                    king.y--;
                    king.isMoving = true;
                    break;
                case "ArrowDown":
                    king.y++;
                    king.isMoving = true;
                    break;
            }
        }
    });
    */
    const gridSize = 50;
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px Tahoma";
    const light = "rgb(255, 206, 158)";
    const dark = "rgb(209, 139, 71)";

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    const c = {
        x: 50,
        y: 50,
        xVel: 5,
        yVel: 2
    };
    const king = {
        oldX: 1,
        oldY: 1,
        frame: 0,
        x: 1,
        y: 1,
        isMoving: false
    };

    requestAnimationFrame(animate);

    let lastTime = 0;
    let delta = 0;

    function animate(time) {
        delta += time - lastTime;
        lastTime = time;

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

        clear();
        drawBoard();
        drawPiece(king);
        drawCircle(c);


        if (alive) {
            requestAnimationFrame(animate);
        }
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawPiece(king) {
        let x = king.x;
        let y = king.y;
        if (king.isMoving) {
            if (king.frame >= 100) {
                king.isMoving = false;
                king.frame = 0;
                king.oldX = king.x;
                king.oldY = king.y;
            } else {
                king.frame++;
                x = lerp(king.oldX, king.x, king.frame / 100);
                y = lerp(king.oldY, king.y, king.frame / 100);
            }
        }

        ctx.drawImage(
            WK,
            (x - 1) * gridSize + gridSize / 2,
            (y - 1) * gridSize + gridSize / 2,
            50, 50
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

    function drawCircle({ x, y }) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}


function lerp(a, b, p) {
    return a + (b - a) * p;
}