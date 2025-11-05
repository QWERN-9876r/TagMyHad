// src/components/icons/icon-close.ts
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('icon-close')
export class IconClose extends LitElement {
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
            animation: rotate-in 0.3s ease-in-out;
        }

        @keyframes rotate-in {
            0% {
                transform: rotate(-90deg);
                opacity: 0;
            }
            100% {
                transform: rotate(0deg);
                opacity: 1;
            }
        }

        .animated line {
            animation: draw-line 0.3s ease-in-out;
        }

        @keyframes draw-line {
            0% {
                stroke-dashoffset: 30;
            }
            100% {
                stroke-dashoffset: 0;
            }
        }

        .animated line {
            stroke-dasharray: 30;
            stroke-dashoffset: 30;
        }

        .animated line:nth-child(1) {
            animation: draw-line 0.3s ease-in-out forwards;
        }

        .animated line:nth-child(2) {
            animation: draw-line 0.3s ease-in-out 0.1s forwards;
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
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'icon-close': IconClose
    }
}
