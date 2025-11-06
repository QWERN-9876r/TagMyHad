import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-alert')
export class AppAlert extends LitElement {
    @property({ type: String }) variant:
        | 'error'
        | 'success'
        | 'warning'
        | 'info' = 'info'
    @property({ type: Boolean, attribute: 'animated' }) animated = false

    static styles = css`
        :host {
            display: block;
            margin: var(--space-md) 0;
        }

        @keyframes slideIn {
            0% {
                opacity: 0;
                transform: translateX(-10px);
            }

            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        :host([animated]) .alert {
            animation: slideIn 1s;
        }

        .alert {
            padding: var(--space-md);
            border-radius: var(--radius-md);
            border-left: 3px solid;
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            font-size: var(--font-size-sm);
        }

        .alert.error {
            background: rgba(248, 113, 113, 0.1);
            border-color: var(--color-error);
            color: var(--color-error);
        }

        .alert.success {
            background: rgba(52, 211, 153, 0.1);
            border-color: var(--color-success);
            color: var(--color-success);
        }

        .alert.warning {
            background: rgba(251, 191, 36, 0.1);
            border-color: var(--color-warning);
            color: var(--color-warning);
        }

        .alert.info {
            background: rgba(96, 165, 250, 0.1);
            border-color: var(--color-info);
            color: var(--color-info);
        }
    `

    render() {
        return html`
            <div class="alert ${this.variant}">
                <slot></slot>
            </div>
        `
    }
}
