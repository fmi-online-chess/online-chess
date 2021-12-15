import { html } from "../lib.js";


const homeTemplate = () => html`
<section class="entry-content">
    <div class="wrapper">
        <p class="entry-header">Chess Game</p>
        <a href="/rooms"><i class="fas fa-chess"></i> Play</a>
    </div>
</section>
<section class="chess-rules">
    <div class="wrapper">
        <header>
            <h2 class="section-title">Basic Rules</h2>
        </header>

        <p>
            The rules of chess govern the play of the game of chess. There are variations of the rules for fast chess, correspondence chess, online chess, and Chess960.
        </p>

        <p>
            Chess is a two-player board game using a chessboard and sixteen pieces of six types for each player. Each type of piece moves in a distinct way. The object of the game is to checkmate (threaten with inescapable capture) the opponent's king. Games do not necessarily end in checkmate; a player who expects to lose may resign. A game can also end in a draw in several ways.
        </p>

        <p>
            Besides the basic moves of the pieces, rules also govern the equipment used, time control, conduct and ethics of players, accommodations for physically challenged players, and recording of moves using chess notation. Procedures for resolving irregularities that can occur during a game are provided as well.
        </p>
    </div>
</section>`;


export function homePage(ctx) {
    return homeTemplate();
}