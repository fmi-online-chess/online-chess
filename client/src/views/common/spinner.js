import { html } from "../../lib.js";


const spinner = (message) => html`
    <div class="spinner-wrapper">
        <p>${message}&hellip;</p>
        <div class="spinner"></div>
    </div>
`;

export default spinner;