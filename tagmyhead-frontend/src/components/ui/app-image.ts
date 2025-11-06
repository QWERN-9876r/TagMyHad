import { LitElement, css, html, type CSSResultGroup } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-image')
export class AppImage extends LitElement {
    @property({ type: String }) src = ''
    @property({ type: String }) alt = ''
    @property({ type: String }) width = ''
    @property({ type: String }) height = ''

    static styles = css`
        :host {
            display: inline-flex;

            align-items: center;
            justify-content: center;
            width: fit-content;
        }
    `

    render() {
        return html`<img
            width=${this.width}
            height=${this.height}
            src="${this.src}"
            alt="${this.alt}"
        />`
    }
}
