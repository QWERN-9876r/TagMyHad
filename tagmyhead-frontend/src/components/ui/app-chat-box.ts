import { LitElement, html, css } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import type { WSMessage } from '../../types'
import './app-chat-message'
import { repeat } from 'lit/directives/repeat.js'

@customElement('app-chat-box')
export class AppChatBox extends LitElement {
    @property({ type: Array }) messages: WSMessage[] = []
    @property({ type: String }) playerId = ''
    @state() inputText = ''
    @state() messageType: 'chat' | 'question' | 'answer' = 'chat'
    @query('.messages') messagesContainer!: HTMLElement

    static styles = css`
        :host {
            display: block;
        }

        .chat-container {
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--color-surface);
        }

        .messages {
            height: 400px;
            overflow-y: auto;
            padding: var(--space-md);
            background: var(--color-bg-secondary);
        }

        .empty-state {
            text-align: center;
            color: var(--color-text-tertiary);
            padding: var(--space-2xl);
            font-style: italic;
        }

        .input-area {
            padding: var(--space-md);
            background: var(--color-surface);
            border-top: 1px solid var(--color-border);
        }

        .message-type-tabs {
            display: flex;
            gap: var(--space-xs);
            margin-bottom: var(--space-sm);
        }

        .tab {
            flex: 1;
            padding: var(--space-sm);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            background: transparent;
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .tab.active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
        }

        .input-row {
            display: flex;
            gap: var(--space-sm);
        }

        .input-row input {
            flex: 1;
            padding: var(--space-sm) var(--space-md);
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-primary);
            font-size: var(--font-size-sm);
            font-family: var(--font-family);
            outline: none;
        }

        .input-row input:focus {
            border-color: var(--color-primary);
        }

        .input-row button {
            padding: var(--space-sm) var(--space-lg);
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: var(--font-weight-medium);
            transition: all var(--transition-fast);
        }

        .input-row button:hover {
            background: var(--color-primary-hover);
        }
    `

    static shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        mode: 'open' as const,
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('messages')) {
            this.scrollToBottom()
        }
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop =
                    this.messagesContainer.scrollHeight
            }, 0)
        }
    }

    handleSend(e: Event) {
        e.preventDefault()
        const text = this.inputText.trim()
        if (!text) return

        this.dispatchEvent(
            new CustomEvent('send-message', {
                detail: { type: this.messageType, text },
                bubbles: true,
                composed: true,
            })
        )

        this.inputText = ''
    }

    render() {
        return html`
            <div class="chat-container">
                <div class="messages">
                    ${this.messages.length === 0
                        ? html`
                              <div class="empty-state">
                                  No messages yet. Start chatting!
                              </div>
                          `
                        : ''}
                    ${repeat(
                        this.messages,
                        (_, i) => i,
                        (msg) => html`
                            <app-chat-message
                                type=${msg.type}
                                playerName=${msg.player_name || ''}
                                text=${msg.text || ''}
                                character=${msg.character || ''}
                                ?correct=${msg.correct || false}
                                timestamp=${msg.timestamp}
                                playerId=${msg.player_id}
                                ?isYour=${msg.player_id === this.playerId}
                            ></app-chat-message>
                        `
                    )}
                </div>

                <div class="input-area">
                    <div class="message-type-tabs">
                        <button
                            class="tab ${this.messageType === 'chat'
                                ? 'active'
                                : ''}"
                            @click=${() => (this.messageType = 'chat')}
                        >
                            💬 Chat
                        </button>
                        <button
                            class="tab ${this.messageType === 'question'
                                ? 'active'
                                : ''}"
                            @click=${() => (this.messageType = 'question')}
                        >
                            ❓ Question
                        </button>
                        <button
                            class="tab ${this.messageType === 'answer'
                                ? 'active'
                                : ''}"
                            @click=${() => (this.messageType = 'answer')}
                        >
                            ✅ Answer
                        </button>
                    </div>

                    <form @submit=${this.handleSend}>
                        <div class="input-row">
                            <input
                                type="text"
                                placeholder=${this.messageType === 'question'
                                    ? 'Ask a yes/no question...'
                                    : this.messageType === 'answer'
                                    ? 'Answer yes/no...'
                                    : 'Type a message...'}
                                .value=${this.inputText}
                                @input=${(e: Event) =>
                                    (this.inputText = (
                                        e.target as HTMLInputElement
                                    ).value)}
                            />
                            <button type="submit">Send</button>
                        </div>
                    </form>
                </div>
            </div>
        `
    }
}
