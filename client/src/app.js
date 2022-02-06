import { logout } from "./data/user.js";
import { page, render } from "./lib.js";
import { addQuery, createState } from "./util/middleware.js";
import { showInfo } from "./util/notify.js";
import { getUserData } from "./util/userData.js";
import { layoutTemplate } from "./views/layout.js";

export  function createApp(container, initialState = {}) {
    const state = JSON.parse(JSON.stringify(initialState));
    state.onLogout = async () => {
        await logout();
        delete state.user;

        showInfo("Logged out successfully.");
        update();
    };
    const user = getUserData();
    if (user) {
        state.user = user;
    }

    const currentView = {
        handler: null,
        params: []
    };

    page.redirect("index.html", "/");
    page(createState(state));
    page(addQuery);
    page(addUpdate);

    const app = {
        view(path, handler) {
            page(path, bindLayout(handler));
        },
        use(middleware) {
            page(middleware);
        },
        start() {
            page.start();
        }
    };

    return app;


    function update() {
        const templateResult = currentView.handler(...currentView.params);
        render(layoutTemplate(state, templateResult), container);
    }

    function bindLayout(handler) {
        return function (...params) {
            currentView.handler = handler;
            currentView.params = params;
            requestAnimationFrame(update);
        };
    }

    function addUpdate(ctx, next) {
        ctx.update = update;
        next();
    }
}
