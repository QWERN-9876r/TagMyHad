import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-input')
export class AppInput extends LitElement {
    @property({ type: String }) value = ''
    @property({ type: String }) placeholder = ''
    @property({ type: String }) type = 'text'
    @property({ type: Boolean }) disabled = false
    @property({ type: Boolean }) required = false
    @property({ type: Number }) maxlength?: number

    static styles = css`
        :host {
            display: block;
            margin: var(--space-sm) 0;
        }

        input {
            width: 100%;
            padding: var(--space-md);
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-primary);
            font-size: var(--font-size-base);
            font-family: var(--font-family);
            transition: all var(--transition-base);
            box-sizing: border-box;
            outline: none;
        }

        input::placeholder {
            color: var(--color-text-tertiary);
        }

        input:focus {
            border-color: var(--color-primary);
            background: var(--color-bg-tertiary);
        }

        input:hover:not(:focus):not(:disabled) {
            border-color: var(--color-border-hover);
        }

        input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `

    render() {
        return html`
            <input
                type=${this.type}
                .value=${this.value}
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                ?required=${this.required}
                maxlength=${this.maxlength || ''}
                @input=${this._handleInput}
            />
        `
    }

    private _handleInput(e: Event) {
        const input = e.target as HTMLInputElement
        this.value = input.value
        this.dispatchEvent(
            new CustomEvent('app-input', {
                detail: { value: this.value },
                bubbles: true,
                composed: true,
            })
        )
    }
}
