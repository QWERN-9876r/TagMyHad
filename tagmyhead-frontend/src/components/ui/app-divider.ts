import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-divider')
export class AppDivider extends LitElement {
    @property({ type: String }) text?: string

    static styles = css`
        :host {
            display: block;
            margin: var(--space-2xl) 0;
        }

        .divider {
            position: relative;
            text-align: center;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--color-border);
        }

        .text {
            position: relative;
            display: inline-block;
            background: var(--color-surface);
            padding: 0 var(--space-md);
            color: var(--color-text-tertiary);
            font-size: var(--font-size-sm);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .simple {
            height: 1px;
            background: var(--color-border);
        }
    `

    render() {
        if (this.text) {
            return html`
                <div class="divider">
                    <span class="text">${this.text}</span>
                </div>
            `
        }
        return html`<div class="simple"></div>`
    }
}
