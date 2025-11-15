import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-alert')
export class AppAlert extends LitElement {
    @property({ type: String }) variant:
        | 'error'
        | 'success'
        | 'warning'
        | 'info' = 'info'

    static styles = css`
        :host {
            display: block;
            margin: var(--space-md) 0;
            view-transition-name: alert;
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

        /* View Transition анимации */
        ::view-transition-old(alert),
        ::view-transition-new(alert) {
            animation-duration: 0.4s;
            animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        /* Появление алерта */
        ::view-transition-new(alert) {
            animation-name: alert-in;
        }

        /* Исчезновение алерта */
        ::view-transition-old(alert) {
            animation-name: alert-out;
        }

        @keyframes alert-in {
            0% {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
                filter: blur(4px);
            }
            50% {
                opacity: 1;
                transform: translateY(5px) scale(1.02);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
            }
        }

        @keyframes alert-out {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
            }
            100% {
                opacity: 0;
                transform: translateY(-10px) scale(0.98);
                filter: blur(2px);
            }
        }

        /* Специфичные анимации для разных типов */
        .alert.error::view-transition-new(alert) {
            animation-name: alert-in-error;
        }

        .alert.success::view-transition-new(alert) {
            animation-name: alert-in-success;
        }

        .alert.warning::view-transition-new(alert) {
            animation-name: alert-in-warning;
        }

        .alert.info::view-transition-new(alert) {
            animation-name: alert-in-info;
        }

        @keyframes alert-in-error {
            0% {
                opacity: 0;
                transform: translateX(-30px) scale(0.9);
                filter: blur(4px);
            }
            100% {
                opacity: 1;
                transform: translateX(0) scale(1);
                filter: blur(0);
            }
        }

        @keyframes alert-in-success {
            0% {
                opacity: 0;
                transform: scale(0.8);
                filter: blur(4px);
            }
            70% {
                transform: scale(1.05);
            }
            100% {
                opacity: 1;
                transform: scale(1);
                filter: blur(0);
            }
        }

        @keyframes alert-in-warning {
            0% {
                opacity: 0;
                transform: rotate(-2deg) translateY(-20px);
                filter: blur(4px);
            }
            100% {
                opacity: 1;
                transform: rotate(0) translateY(0);
                filter: blur(0);
            }
        }

        @keyframes alert-in-info {
            0% {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                filter: blur(4px);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
            }
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
