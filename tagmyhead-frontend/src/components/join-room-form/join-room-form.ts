import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { joinRoomFormStyles } from './join-room-form.css'

@customElement('join-room-form')
export class JoinRoomForm extends LitElement {
    static styles = [joinRoomFormStyles]

    @property() roomCode = ''
    @property() error = ''
    @property({ type: Boolean }) loading = false

    @state() private nameInput = ''

    private handleSubmit(e: Event) {
        e.preventDefault()

        const name = this.nameInput.trim()

        if (!name) {
            this.dispatchEvent(
                new CustomEvent('error', {
                    detail: { message: 'Please enter your name' },
                    bubbles: true,
                    composed: true,
                })
            )
            return
        }

        if (name.length < 2) {
            this.dispatchEvent(
                new CustomEvent('error', {
                    detail: { message: 'Name must be at least 2 characters' },
                    bubbles: true,
                    composed: true,
                })
            )
            return
        }

        if (name.length > 20) {
            this.dispatchEvent(
                new CustomEvent('error', {
                    detail: {
                        message: 'Name must be less than 20 characters',
                    },
                    bubbles: true,
                    composed: true,
                })
            )
            return
        }

        this.dispatchEvent(
            new CustomEvent('submit', {
                detail: { name },
                bubbles: true,
                composed: true,
            })
        )
    }

    private handleCancel() {
        this.dispatchEvent(
            new CustomEvent('cancel', {
                bubbles: true,
                composed: true,
            })
        )
    }

    render() {
        return html`
            <div class="join-form-container">
                <div class="join-form-card">
                    <div class="join-form-header">
                        <h1 class="join-form-title">
                            <span class="emoji">🎮</span>
                            <span>Join Room</span>
                        </h1>
                        <p class="join-form-subtitle">
                            Enter your name to start playing
                        </p>
                    </div>

                    <div class="room-code-display">
                        <div class="room-code-label">Room Code</div>
                        <div class="room-code-value">${this.roomCode}</div>
                    </div>

                    ${this.error
                        ? html`
                              <div class="error-message">
                                  <span class="emoji">⚠️</span>
                                  <span>${this.error}</span>
                              </div>
                          `
                        : ''}

                    <form @submit=${this.handleSubmit}>
                        <div class="join-form-body">
                            <div class="form-field">
                                <label class="form-label" for="name-input">
                                    Your Name
                                </label>
                                <input
                                    id="name-input"
                                    class="form-input"
                                    type="text"
                                    placeholder="Enter your awesome name..."
                                    .value=${this.nameInput}
                                    @input=${(e: Event) =>
                                        (this.nameInput = (
                                            e.target as HTMLInputElement
                                        ).value)}
                                    ?disabled=${this.loading}
                                    maxlength="20"
                                    autofocus
                                />
                            </div>
                        </div>

                        <div class="join-form-footer">
                            <button
                                type="button"
                                class="btn btn-ghost"
                                @click=${this.handleCancel}
                                ?disabled=${this.loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary"
                                ?disabled=${this.loading ||
                                !this.nameInput.trim()}
                            >
                                ${this.loading
                                    ? html`
                                          <span class="loading-spinner"></span>
                                          <span>Joining...</span>
                                      `
                                    : html` <span>Join Room</span> `}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'join-room-form': JoinRoomForm
    }
}
