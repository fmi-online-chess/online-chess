import { html } from "../lib.js";


export const layoutTemplate = (state, view) => html`
<header class="site-header">
    <div class="wrapper">
        <div class="site-branding">
            <a href="/">
                <p class="site-title">
                    Chess
                </p>
                <p class="site-subtitle">
                    Online
                </p>
            </a>
        </div>

        <nav class="site-nav">
            ${state.user ? 
                html`
                <ul class="logged">
                    <li><a href="/rooms"><i class="fas fa-chess"></i> Rooms</a></li>
                    <li><a href="javascript:void(0)" title="Logout user" @click=${state.onLogout}><i class="fas fa-sign-out-alt"></i> ${state.user.username}</a></li>
                </ul>` : 
                html`
                <ul>
                    <li><a href="/rooms"><i class="fas fa-chess"></i> Rooms</a></li>
                    <li><a href="/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
                    <li><a href="/register"><i class="fas fa-user-plus"></i> Register</a></li>
                </ul>`}
        </nav>
    </div>
</header>
<main class="site-main">
    <div id="notifications">
        <div id="errorBox" class="notification">
            <span>Error</span>
        </div>
        <div id="infoBox" class="notification">
            <span>Info</span>
        </div>
    </div>
    ${view}
</main>
<footer class="site-footer">
    <div class="wrapper">
        <section class="about-team">
            <header>
                <h5>Team Repositories</h5>
            </header>

            <ul class="social-links">
                <li>
                    <a href="https://github.com/fmi-online-chess/online-chess" target="_blank">
                        <i class="fab fa-github"></i> Project Repo
                    </a>
                </li>
                <li>
                    <a href="https://github.com/viktorpts" target="_blank">
                        <i class="fab fa-github"></i> Viktor Kostadinov
                    </a>
                </li>
                <li>
                    <a href="https://github.com/MihalevD" target="_blank">
                        <i class="fab fa-github"></i> Denislav Mihalev
                    </a>
                </li>
                <li>
                    <a href="https://github.com/alexdimitrov2000" target="_blank">
                        <i class="fab fa-github"></i> Alex Dimitrov
                    </a>
                </li>
            </ul>
        </section>

        <section class="rights-reserved">
            <p>
                JavaScript Advanced @ FMI
            </p>
            <p>
                All rights reserved &copy; 2021/2022
            </p>
        </section>
    </div>
</footer>`;
