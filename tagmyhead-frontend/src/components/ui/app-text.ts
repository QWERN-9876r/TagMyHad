import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-text')
export class AppText extends LitElement {
    @property({ type: String }) variant:
        | 'h1'
        | 'h2'
        | 'h3'
        | 'subtitle'
        | 'body' = 'body'
    @property({ type: String }) color: 'primary' | 'secondary' | 'tertiary' =
        'primary'

    static styles = css`
        div {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .h1 {
            font-size: var(--font-size-3xl);
            font-weight: var(--font-weight-bold);
            color: var(--color-text-primary);
            margin-bottom: var(--space-md);
            line-height: var(--line-height-tight);
        }

        .h2 {
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
            margin: var(--space-xl) 0 var(--space-md);
            line-height: var(--line-height-tight);
        }

        .h3 {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
            margin-bottom: var(--space-sm);
        }

        .subtitle {
            font-size: var(--font-size-base);
            line-height: var(--line-height-relaxed);
            margin-bottom: var(--space-xl);
        }

        .body {
            font-size: var(--font-size-base);
            line-height: var(--line-height-normal);
        }

        .color-primary {
            color: var(--color-text-primary);
        }

        .color-secondary {
            color: var(--color-text-secondary);
        }

        .color-tertiary {
            color: var(--color-text-tertiary);
        }

        @media (max-width: 768px) {
            .h1 {
                font-size: var(--font-size-2xl);
            }
        }
    `

    render() {
        return html`
            <div class="${this.variant} color-${this.color}">
                <slot></slot>
            </div>
        `
    }
}
