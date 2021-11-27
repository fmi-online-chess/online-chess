import { render } from 'https://unpkg.com/lit-html?module';
import { until } from 'https://unpkg.com/lit-html/directives/until?module';
import page from "//unpkg.com/page/page.mjs";

import { homePage } from './views/home.js';
import { registerPage } from './views/register.js';


const main = document.querySelector('main');
const decoratedRender = (content) => render(content, main);


page('/', () => homePage(decoratedRender));
page('/register', () => registerPage(decoratedRender));

page.start();