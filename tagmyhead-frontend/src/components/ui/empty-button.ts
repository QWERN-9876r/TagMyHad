import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('empty-button')
export class EmptyButton extends LitElement {
    static styles = css`
        button {
            background: none;
            border: none;
            cursor: pointer;
            box-shadow: none;
        }
    `

    render() {
        return html`<button><slot></slot></button>`
    }
}
