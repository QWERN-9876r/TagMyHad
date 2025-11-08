import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { API } from '../api/api'
import { navigate } from '../router'
import type { Room } from '../types'

interface RouteContext {
    params: {
        code: string
    }
}

@customElement('lobby-page')
export class LobbyPage extends LitElement {
    @state() room: Room | null = null
    @state() error: string = ''
    @state() playerId: string = ''
    @state() roomCode: string = ''
    @state() loading: boolean = true

    private pollInterval: number | null = null

    createRenderRoot() {
        return this
    }

    async onBeforeEnter(location: RouteContext) {
        this.roomCode = location.params.code

        // Проверяем что у нас есть playerId
        const playerId = localStorage.getItem('playerId')
        const playerName = localStorage.getItem('playerName')

        if (!playerId || !playerName) {
            // Если нет - перенаправляем на главную
            navigate('/')
            return
        }

        this.playerId = playerId
        await this.loadRoom()
        this.loading = false

        // Проверяем каждые 2 секунды не началась ли игра
        this.pollInterval = window.setInterval(() => this.loadRoom(), 2000)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        if (this.pollInterval) {
            clearInterval(this.pollInterval)
        }
    }

    async loadRoom() {
        try {
            this.room = await API.getRoom(this.roomCode, this.playerId)

            // Проверяем что мы все еще в комнате
            const isInRoom = this.room.players.some(
                (p) => p.id === this.playerId
            )
            if (!isInRoom) {
                this.error = 'You are not in this room'
                if (this.pollInterval) {
                    clearInterval(this.pollInterval)
                    this.pollInterval = null
                }
                return
            }

            if (this.room.started) {
                if (this.pollInterval) {
                    clearInterval(this.pollInterval)
                    this.pollInterval = null
                }
                navigate(`/room/${this.roomCode}/game`)
            }
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to load room'
            if (this.pollInterval) {
                clearInterval(this.pollInterval)
                this.pollInterval = null
            }
        }
    }

    async handleStartGame() {
        if (!this.room || this.room.players.length < 2) {
            return
        }

        try {
            await API.startGame(this.roomCode)

            console.log('start')

            navigate(`/room/${this.roomCode}/game`)
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to start game'
        }
    }

    handleLeaveRoom() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval)
            this.pollInterval = null
        }
        localStorage.removeItem('playerId')
        navigate('/')
    }

    render() {
        if (this.loading) {
            return html`
                <app-container>
                    <app-card>
                        <app-text variant="h2" color="secondary"
                            >Loading room...</app-text
                        >
                    </app-card>
                </app-container>
            `
        }

        if (!this.room || this.error) {
            return html`
                <app-container>
                    <app-card>
                        ${this.error
                            ? html`
                                  <app-alert variant="error"
                                      >${this.error}</app-alert
                                  >
                              `
                            : ''}
                        <app-button @click=${this.handleLeaveRoom}>
                            Back to Home
                        </app-button>
                    </app-card>
                </app-container>
            `
        }

        const canStart = this.room.players.length >= 2

        return html`
            <app-container>
                <app-card>
                    <app-text variant="h1">Waiting Room</app-text>
                    <app-text variant="subtitle" color="secondary">
                        Share the room code with your friends to start playing!
                    </app-text>

                    <app-room-code code=${this.roomCode}></app-room-code>

                    <app-text variant="h2">
                        Players
                        <app-badge variant="secondary"
                            >${this.room.players.length}</app-badge
                        >
                    </app-text>

                    <div>
                        ${this.room.players.map(
                            (player) => html`
                                <app-player-item
                                    name=${player.name}
                                    ?isYou=${player.id === this.playerId}
                                ></app-player-item>
                            `
                        )}
                    </div>

                    ${!canStart
                        ? html`
                              <app-alert variant="info">
                                  Waiting for more players... (minimum 2
                                  required)
                              </app-alert>
                          `
                        : ''}

                    <app-button
                        @click=${this.handleStartGame}
                        ?disabled=${!canStart}
                    >
                        ${canStart
                            ? `Start Game (${this.room.players.length} players)`
                            : 'Need at least 2 players'}
                    </app-button>

                    <app-button variant="ghost" @click=${this.handleLeaveRoom}>
                        Leave Room
                    </app-button>
                </app-card>
            </app-container>
        `
    }
}
