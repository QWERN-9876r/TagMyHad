import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import '../icons/icon-check'
import '../icons/icon-close'
import { classMap } from 'lit/directives/class-map.js'
import { hasAnswer, saveAnswer } from '../../utils/saveAnswer'

@customElement('app-chat-message')
export class AppChatMessage extends LitElement {
    @property({ type: String }) type:
        | 'chat'
        | 'question'
        | 'answer'
        | 'guess'
        | 'system'
        | 'join'
        | 'set_character'
        | 'leave'
        | 'game_state'
        | 'set_character'
        | 'add_winner' = 'chat'

    @property({ type: String }) playerName = ''
    @property({ type: String }) playerId = ''
    @property({ type: String }) text = ''
    @property({ type: String }) character = ''
    @property({ type: Boolean }) correct = false
    @property({ type: Number }) timestamp = 0
    @property({ type: Boolean }) isYour = false
    @property({ type: String }) id = ''
    @state() shouldShowActionButtons = false

    static styles = css`
        :host {
            display: flex;
            gap: var(--space-md);
            margin: var(--space-sm) 0;
            align-items: flex-start;
        }

        .message {
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--radius-md);
            border-left: 3px solid;
            font-size: var(--font-size-sm);
            animation: slideIn 0.2s ease-out;
            width: 100%;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .message.chat {
            background: rgba(96, 165, 250, 0.1);
            border-color: var(--color-info);
            color: var(--color-text-primary);
            width: fit-content;
        }

        .message.question {
            background: rgba(251, 191, 36, 0.1);
            border-color: var(--color-warning);
            color: var(--color-text-primary);
            width: fit-content;
        }

        .message.answer {
            background: rgba(52, 211, 153, 0.1);
            border-color: var(--color-success);
            color: var(--color-text-primary);
            width: fit-content;
        }

        .message.guess {
            background: rgba(244, 114, 182, 0.1);
            border-color: var(--color-secondary);
            color: var(--color-text-primary);
        }

        .message.system,
        .message.join,
        .message.leave,
        .message.add_winner {
            background: rgba(100, 116, 139, 0.1);
            border-color: var(--color-border);
            color: var(--color-text-secondary);
            text-align: center;
            font-style: italic;
        }

        .message.add_winner {
            background: var(--color-success-glass);
        }

        .player-name {
            font-weight: var(--font-weight-semibold);
            color: var(--color-primary);
        }

        .result {
            font-weight: var(--font-weight-bold);
            margin-left: var(--space-xs);
        }

        .result.correct {
            color: var(--color-success);
        }

        .result.incorrect {
            color: var(--color-error);
        }

        .timestamp {
            font-size: var(--font-size-xs);
            color: var(--color-text-tertiary);
            margin-left: var(--space-sm);
        }

        .answer_buttons {
            display: flex;
            gap: var(--space-sm);
            flex-shrink: 0;
        }

        @keyframes showActionButton {
            0% {
                opacity: 0;
                transform: scale(0.5) rotate(-15deg);
            }
            50% {
                transform: scale(1.1) rotate(5deg);
            }
            100% {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
        }

        .answer_buttons button {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: var(--radius-lg);
            border: none;
            cursor: pointer;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-base);
            animation: showActionButton 300ms var(--transition-bounce);
            box-shadow: var(--shadow-md);
            overflow: hidden;
        }

        .answer_buttons button::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.2) 0%,
                transparent 100%
            );
            opacity: 0;
            transition: opacity var(--transition-fast);
        }

        .answer_buttons button:hover {
            transform: translateY(-2px) scale(1.05);
        }

        .answer_buttons button:hover::before {
            opacity: 1;
        }

        .answer_buttons button:active {
            transform: translateY(0) scale(0.95);
        }

        .success_button {
            background: linear-gradient(
                135deg,
                var(--color-success) 0%,
                #3be622 100%
            );
            box-shadow: var(--shadow-md), 0 0 15px rgba(80, 255, 57, 0.4);
        }

        .success_button:hover {
            box-shadow: var(--shadow-lg), 0 0 25px rgba(80, 255, 57, 0.6),
                0 0 40px rgba(80, 255, 57, 0.3);
        }

        .success_button:active {
            box-shadow: var(--shadow-sm), 0 0 10px rgba(80, 255, 57, 0.5);
        }

        .success_button icon-check {
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .failure_button {
            background: linear-gradient(
                135deg,
                var(--color-error) 0%,
                #e61c4d 100%
            );
            box-shadow: var(--shadow-md), 0 0 15px rgba(255, 51, 102, 0.4);
        }

        .failure_button:hover {
            box-shadow: var(--shadow-lg), 0 0 25px rgba(255, 51, 102, 0.6),
                0 0 40px rgba(255, 51, 102, 0.3);
        }

        .failure_button:active {
            box-shadow: var(--shadow-sm), 0 0 10px rgba(255, 51, 102, 0.5);
        }

        .failure_button icon-close {
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .answer_buttons button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        @media (max-width: 768px) {
            .answer_buttons button {
                width: 40px;
                height: 40px;
            }
        }
    `

    private handleSuccess() {
        this.shouldShowActionButtons = false
        this.correct = true

        saveAnswer(this.id)

        this.dispatchEvent(
            new CustomEvent('success-answer', {
                bubbles: true,
                composed: true,
                detail: {
                    playerId: this.playerId,
                },
            })
        )
    }

    private formatTime(timestamp: number): string {
        const date = new Date(timestamp * 1000)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    connectedCallback(): void {
        super.connectedCallback()

        this.shouldShowActionButtons =
            this.type === 'answer' && !this.isYour && !hasAnswer(this.id)
    }

    render() {
        if (!this.text) return null

        return html`
            <div
                class=${classMap({
                    message: true,
                    [this.type]: true,
                    isYour: this.isYour,
                })}
            >
                ${this.type === 'chat' ||
                this.type === 'question' ||
                this.type === 'answer'
                    ? html`
                          <span class="player-name">${this.playerName}:</span>
                          ${this.text}
                          <span class="timestamp"
                              >${this.formatTime(this.timestamp)}</span
                          >
                      `
                    : ''}
                ${this.type === 'guess'
                    ? html`
                          <span class="player-name">${this.playerName}</span>
                          guessed
                          <strong>${this.character}</strong>
                          <span
                              class="result ${this.correct
                                  ? 'correct'
                                  : 'incorrect'}"
                          >
                              ${this.correct ? '✓ Correct!' : '✗ Wrong'}
                          </span>
                          <span class="timestamp"
                              >${this.formatTime(this.timestamp)}</span
                          >
                      `
                    : ''}
                ${this.type === 'join' ||
                this.type === 'leave' ||
                this.type === 'system' ||
                this.type === 'set_character' ||
                this.type === 'add_winner'
                    ? html`
                          ${this.text}
                          <span class="timestamp"
                              >${this.formatTime(this.timestamp)}</span
                          >
                      `
                    : ''}
            </div>
            ${this.shouldShowActionButtons
                ? html`<div class="answer_buttons">
                      <button
                          @click=${this.handleSuccess}
                          class="success_button"
                          aria-label="Mark as correct"
                      >
                          <icon-check size="24"></icon-check>
                      </button>
                      <button
                          @click=${() => (this.shouldShowActionButtons = false)}
                          class="failure_button"
                          aria-label="Mark as incorrect"
                      >
                          <icon-close size="24"></icon-close>
                      </button>
                  </div>`
                : null}
        `
    }
}
