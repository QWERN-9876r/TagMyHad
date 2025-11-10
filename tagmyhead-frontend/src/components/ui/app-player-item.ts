import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-player-item')
export class AppPlayerItem extends LitElement {
    @property({ type: String }) name = ''
    @property({ type: String }) playerId = ''
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
            box-shadow: 0 0 0 2px var(--color-success-glass);
        }

        :host([is-winner]) .player-item:hover {
            border-color: var(--color-success);
        }

        @keyframes show {
            0% {
                transform: scale(1.2);
                opacity: 0;
            }

            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .player-item {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-md);
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            transition: all var(--transition-base);
            height: 66px;
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

        .player-actions {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .remove-btn {
            background: transparent;
            border: none;
            color: var(--color-text-tertiary);
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-base);
            font-size: var(--font-size-lg);
        }

        .remove-btn:hover {
            background: rgba(255, 51, 102, 0.1);
            color: var(--color-error);
        }

        .remove-btn:active {
            transform: scale(0.9);
        }

        /* Скрываем кнопку для себя */
        :host([is-you]) .remove-btn {
            display: none;
        }

        /* Стили для кнопки-заглушки когда она скрыта */
        .remove-placeholder {
            width: 32px;
            height: 32px;
        }
    `

    private handleRemove() {
        this.dispatchEvent(
            new CustomEvent('remove-player', {
                detail: { name: this.name, id: this.playerId },
                bubbles: true,
                composed: true,
            })
        )
    }

    render() {
        return html`
            <div class="player-item">
                <div class="player-info">
                    <span class="player-name">${this.name}</span>
                    ${this.isYou
                        ? html`<app-badge variant="primary">You</app-badge>`
                        : ''}
                    ${this.isWinner
                        ? html`<app-badge variant="success">Winner</app-badge>`
                        : ''}
                </div>

                <div class="player-actions">
                    ${this.character
                        ? html`
                              <app-badge variant="secondary"
                                  >${this.character}</app-badge
                              >
                          `
                        : ''}
                    ${!this.isYou
                        ? html`
                              <button
                                  class="remove-btn"
                                  @click=${this.handleRemove}
                                  title="Remove player"
                              >
                                  ✕
                              </button>
                          `
                        : html`<div class="remove-placeholder"></div>`}
                </div>
            </div>
        `
    }
}
