import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-player-item')
export class AppPlayerItem extends LitElement {
    @property({ type: String }) name = ''
    @property({ type: Boolean }) isYou = false
    @property({ type: Boolean, attribute: 'is-winner' }) isWinner = false
    @property({ type: String }) character?: string

    static styles = css`
        :host {
            display: block;
            margin: var(--space-sm) 0;
        }

        :host([is-winner]) .player-item {
            border-color: var(--color-success);
        }

        :host([is-winner]) .player-item:hover {
            border-color: var(--color-success);
        }

        .player-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-md);
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            transition: all var(--transition-base);
        }

        .player-item:hover {
            border-color: var(--color-border-hover);
        }

        .player-info {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .player-name {
            font-weight: var(--font-weight-medium);
            color: var(--color-text-primary);
        }

        .character {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
        }
    `

    render() {
        return html`
            <div class="player-item">
                <div class="player-info">
                    <span class="player-name">${this.name}</span>
                    ${this.isYou
                        ? html`<app-badge variant="primary">You</app-badge>`
                        : ''}
                </div>
                ${this.character && !this.isYou
                    ? html`
                          <app-badge variant="secondary"
                              >${this.character}</app-badge
                          >
                      `
                    : ''}
            </div>
        `
    }
}
