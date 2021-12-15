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
            <ul>
                <li><a href="/rooms"><i class="fas fa-chess"></i> Rooms</a></li>
                ${state.user ? 
                    html`<li><a href="javascript:void(0)" @click=${state.onLogout}><i class="fas fa-sign-out-alt"></i> Logout</a></li>` : 
                    html`
                    <li><a href="/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
                    <li><a href="/register"><i class="fas fa-user-plus"></i> Register</a></li>
                `}
            </ul>
        </nav>
    </div>
</header>
${view}
<footer>&copy; 2021</footer>`;
