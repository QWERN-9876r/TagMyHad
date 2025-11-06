import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-badge')
export class AppBadge extends LitElement {
    @property({ type: String }) variant: 'primary' | 'secondary' | 'success' =
        'primary'

    static styles = css`
        :host {
            display: inline-flex;
            justify-content: center;
            align-items: center;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-xs);
            padding: var(--space-xs) var(--space-sm);
            border-radius: var(--radius-full);
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge.primary {
            background: var(--color-primary);
            color: white;
        }

        .badge.secondary {
            background: var(--color-surface);
            color: var(--color-text-secondary);
            border: 1px solid var(--color-border);
        }

        .badge.success {
            background: var(--color-success);
            color: white;
        }
    `

    render() {
        return html`
            <span class="badge ${this.variant}">
                <slot></slot>
            </span>
        `
    }
}
