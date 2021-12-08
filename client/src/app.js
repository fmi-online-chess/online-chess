import { logout } from "./data/user.js";
import { page, render } from "./lib.js";
import { createObservableState } from "./util/state.js";
import { getUserData } from "./util/userData.js";
import { layoutTemplate } from "./views/layout.js";

export  function createApp(initialState) {
    const container = document.getElementById("container");
    const state = initialState;
    state.onLogout = async () => {
        await logout();
        delete state.user;
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
    page(addState);

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

    function addState(ctx, next) {
        ctx.appState = state;
        ctx.update = update;
        next();
    }
}
