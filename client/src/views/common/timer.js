import { html, render } from "../../lib.js";


let ticker = null;
const root = document.createElement("div");
root.id = "timer-wrapper";

const timer = (name, time, onReady) => html`<div class="clock-wrap">
    <div class="name-box">
        ${name}
    </div>
    <div class="player__digits">
        <span>${Math.trunc(time / 60)}</span>:<span>${pad(time % 60)}</span>
    </div>
    <button class="timer__start-bttn" type="button" @click=${onReady}>READY</button>
</div>`;

const group = (players, time, onReady) => html`<div id="timer-wrap">
    ${timer(players[0], time.localBlack ? time.black : time.white, onReady)}
    <div id="two-point">
        :
    </div>
    ${timer(players[1], time.localBlack ? time.white : time.black, onReady)}
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
        render(group(players, time, onReady), root);
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