import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('app-card')
export class AppCard extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-2xl);
            box-shadow: var(--shadow-md);
        }

        @media (max-width: 768px) {
            .card {
                padding: 0;
                margin: 0;
                background: none;
                border: none;
                box-shadow: none;
            }
        }
    `

    render() {
        return html`
            <div class="card">
                <slot></slot>
            </div>
        `
    }
}
