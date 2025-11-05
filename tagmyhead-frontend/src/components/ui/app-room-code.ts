import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-room-code')
export class AppRoomCode extends LitElement {
    @property({ type: String }) code = ''
    @property({ type: Boolean }) copied = false

    static styles = css`
        :host {
            display: block;
            margin: var(--space-lg) 0;
        }

        .room-code-wrapper {
            text-align: center;
        }

        .room-code {
            display: inline-block;
            padding: var(--space-lg) var(--space-2xl);
            background: var(--color-primary);
            color: white;
            border-radius: var(--radius-lg);
            font-size: var(--font-size-3xl);
            font-weight: var(--font-weight-bold);
            font-family: var(--font-family);
            letter-spacing: 0.2em;
            cursor: pointer;
            transition: all var(--transition-base);
            user-select: all;
        }

        .room-code:hover {
            background: var(--color-primary-hover);
            transform: scale(1.02);
        }

        .room-code:active {
            transform: scale(0.98);
        }

        .hint {
            margin-top: var(--space-sm);
            color: var(--color-text-tertiary);
            font-size: var(--font-size-sm);
        }

        .hint.copied {
            color: var(--color-success);
        }

        @media (max-width: 768px) {
            .room-code {
                font-size: var(--font-size-2xl);
                letter-spacing: 0.15em;
                padding: var(--space-md) var(--space-lg);
            }
        }
    `

    private async handleClick() {
        try {
            try {
                await navigator.clipboard.writeText(this.code)
            } catch {
                document.execCommand(this.code)
            }
            this.copied = true
            setTimeout(() => {
                this.copied = false
            }, 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    render() {
        return html`
            <div class="room-code-wrapper">
                <div class="room-code" @click=${this.handleClick}>
                    ${this.code}
                </div>
                <div class="hint ${this.copied ? 'copied' : ''}">
                    ${this.copied ? '✓ Copied!' : 'Click to copy'}
                </div>
            </div>
        `
    }
}
