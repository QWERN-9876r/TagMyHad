import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-button')
export class AppButton extends LitElement {
    @property({ type: String }) variant: 'primary' | 'secondary' | 'ghost' =
        'primary'
    @property({ type: Boolean }) disabled = false
    @property({ type: Boolean }) loading = false

    static styles = css`
        :host {
            display: block;
            margin: var(--space-md) 0;
        }

        button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            padding: var(--space-md) var(--space-lg);
            border: none;
            border-radius: var(--radius-md);
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-medium);
            font-family: var(--font-family);
            cursor: pointer;
            transition: all var(--transition-base);
            box-sizing: border-box;
        }

        button.primary {
            background: var(--color-primary);
            color: white;
        }

        button.primary:hover:not(:disabled) {
            background: var(--color-primary-hover);
        }

        button.secondary {
            background: var(--color-surface);
            color: var(--color-text-primary);
            border: 1px solid var(--color-border);
        }

        button.secondary:hover:not(:disabled) {
            border-color: var(--color-primary);
        }

        button.ghost {
            background: transparent;
            color: var(--color-primary);
            border: 1px solid var(--color-border);
        }

        button.ghost:hover:not(:disabled) {
            border-color: var(--color-primary);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `

    render() {
        return html`
            <button
                class=${this.variant}
                type="button"
                ?disabled=${this.disabled || this.loading}
                @click=${this._handleClick}
            >
                ${this.loading ? html`<div class="spinner"></div>` : ''}
                <slot></slot>
            </button>
        `
    }

    private _handleClick(e: MouseEvent) {
        if (this.disabled || this.loading) {
            e.preventDefault()
            e.stopPropagation()
            return
        }

        this.dispatchEvent(
            new CustomEvent('button-click', {
                bubbles: true,
                composed: true,
                detail: {},
            })
        )
    }
}
