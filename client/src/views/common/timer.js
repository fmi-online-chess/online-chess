import { html, render } from "../../lib.js";


let ticker = null;
const root = document.createElement("div");
root.id = "timer-wrapper";

const timer = ({ name, time, isReady, isBlack }, onReady) => html`<div class="clock-wrap">
    <div class="name-box">
        ${name}
    </div>
    <div class="player-digits">
        <span>${Math.trunc(time / 60)}</span>:<span>${pad(time % 60)}</span>
    </div>
    ${isReady ?
        html`<img class="avatar" src=${isBlack ? "/static/bk.png" : "/static/wk.png"}>` :
        onReady == null ? null : html`<button class="timer-start-btn" type="button" @click=${onReady}>READY</button>`
    }

</div>`;

const group = (playerModels, onReady) => html`<div id="timer-wrap">
    ${timer(playerModels.white, onReady)}
    <div id="two-point">
        :
    </div>
    ${timer(playerModels.black, onReady)}
</div>`;


export function createTimer(players, time, onReady) {
    console.log(time.playersReady);
    update();
    if (ticker != null) {
        clearInterval(ticker);
    }
    ticker = setInterval(tick, 1000);

    return root;

    function update() {
        const playerModels = {
            white: {
                name: players[0],
                time: time.white,
                isReady: time.playersReady.has("W") || time.current != null,
                isBlack: false
            },
            black: {
                name: players[1],
                time: time.black,
                isReady: time.playersReady.has("B") || time.current != null,
                isBlack: true
            }
        };

        render(group(playerModels, onReady), root);
    }

    function tick() {
        if (time.current == "white") {
            time.white--;
        } else if (time.current == "black") {
            time.black--;
        }
        update();
    }
}


function pad(value) {
    return ("00" + Math.abs(value)).slice(-2);
}