import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('icon-check')
export class IconCheck extends LitElement {
    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        svg {
            width: var(--icon-size, 24px);
            height: var(--icon-size, 24px);
            stroke: currentColor;
            fill: none;
        }

        .animated {
            animation: checkmark 0.4s ease-in-out;
        }

        @keyframes checkmark {
            0% {
                stroke-dashoffset: 100;
            }
            100% {
                stroke-dashoffset: 0;
            }
        }

        .animated path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: checkmark 0.4s ease-in-out forwards;
        }
    `

    @property({ type: Number })
    size = 24

    @property({ type: Number, attribute: 'stroke-width' })
    strokeWidth = 2

    @property({ type: Boolean })
    animated = false

    @property({ type: Boolean })
    circle = false

    render() {
        if (this.circle) {
            return html`
                <svg
                    width="${this.size}"
                    height="${this.size}"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="${this.strokeWidth}"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="${this.animated ? 'animated' : ''}"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9 12l2 2 4-4"></path>
                </svg>
            `
        }

        return html`
            <svg
                width="${this.size}"
                height="${this.size}"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="${this.strokeWidth}"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="${this.animated ? 'animated' : ''}"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'icon-check': IconCheck
    }
}
