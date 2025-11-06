import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { API } from '../api/api'

import { navigate } from '../router'

@customElement('home-page')
export class HomePage extends LitElement {
    @state() joinCode = ''
    @state() joinName = ''
    @state() createName = ''
    @state() error = ''
    @state() loading = false

    createRenderRoot() {
        return this
    }

    async handleCreateRoom() {
        if (this.loading) {
            return
        }

        if (!this.createName.trim()) {
            this.error = 'Please enter your name'
            this.requestUpdate()
            return
        }

        this.loading = true
        this.error = ''
        this.requestUpdate()

        try {
            const { code } = await API.createRoom()

            localStorage.setItem('playerName', this.createName.trim())

            const player = await API.joinRoom(code, this.createName.trim())

            localStorage.setItem('playerId', player.id)

            navigate(`/room/${code}`)
        } catch (err) {
            console.error('Error:', err)
            this.error =
                err instanceof Error ? err.message : 'Failed to create room'
            this.loading = false
            this.requestUpdate()
        }
    }

    async handleJoinRoom() {
        if (this.loading) {
            return
        }

        const code = this.joinCode.trim().toUpperCase()
        const name = this.joinName.trim()

        if (!name || !code) {
            this.error = 'Please enter both name and room code'
            this.requestUpdate()
            return
        }

        this.loading = true
        this.error = ''
        this.requestUpdate()

        try {
            const room = await API.getRoom(code, '')

            if (room.started) {
                this.error = 'This game has already started'
                this.loading = false
                this.requestUpdate()
                return
            }

            localStorage.setItem('playerName', name)

            API.joinRoom(code, name).then(({ id }) => {
                localStorage.setItem('playerId', id)
                navigate(`/room/${code}`)
            })
        } catch (err) {
            console.error('Error:', err)
            this.error = err instanceof Error ? err.message : 'Room not found'
            this.loading = false
            this.requestUpdate()
        }
    }

    render() {
        return html`
            <app-container>
                <app-card>
                    <app-text variant="h1">
                        <app-image
                            width="50px"
                            src="icon.webp"
                            alt=""
                        ></app-image>
                        TagMyHead
                        <app-badge variant="secondary"
                            >beta</app-badge
                        ></app-text
                    >
                    <app-text variant="subtitle" color="secondary">
                        Guess who you are by asking yes/no questions!<br />
                        A social deduction game for 2+ players.
                    </app-text>

                    ${this.error
                        ? html`
                              <app-alert animated variant="error">
                                  ${this.error}
                              </app-alert>
                          `
                        : ''}

                    <app-text variant="h2">Create New Room</app-text>
                    <div>
                        <app-input
                            placeholder="Enter your name"
                            .value=${this.createName}
                            maxlength="20"
                            required
                            @app-input=${(e: CustomEvent) => {
                                this.createName = e.detail.value
                            }}
                        ></app-input>
                        <app-button
                            ?loading=${this.loading}
                            ?disabled=${this.loading}
                            @button-click=${this.handleCreateRoom}
                        >
                            ${this.loading ? 'Creating...' : 'Create Room'}
                        </app-button>
                    </div>

                    <app-divider></app-divider>

                    <app-text variant="h2">Join Existing Room</app-text>
                    <div>
                        <app-input
                            placeholder="Room Code (e.g. ABC123)"
                            .value=${this.joinCode}
                            maxlength="6"
                            required
                            type="text"
                            style="text-transform: uppercase;"
                            @app-input=${(e: CustomEvent) => {
                                this.joinCode = e.detail.value.toUpperCase()
                            }}
                        ></app-input>
                        <app-input
                            placeholder="Your name"
                            .value=${this.joinName}
                            maxlength="20"
                            required
                            @app-input=${(e: CustomEvent) => {
                                this.joinName = e.detail.value
                            }}
                        ></app-input>
                        <app-button
                            variant="secondary"
                            ?loading=${this.loading}
                            ?disabled=${this.loading}
                            @button-click=${this.handleJoinRoom}
                        >
                            ${this.loading ? 'Joining...' : 'Join Room'}
                        </app-button>
                    </div>
                </app-card>
            </app-container>
        `
    }
}
