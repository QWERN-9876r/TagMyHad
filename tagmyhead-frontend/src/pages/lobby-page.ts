import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { API } from '../api/api'
import { GameWebSocket } from '../api/websocket'
import { navigate } from '../router'
import type { Room } from '../types'

import '../components/join-room-form'

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
    @state() showNameForm: boolean = false
    @state() joiningRoom: boolean = false

    private ws: GameWebSocket | null = null

    createRenderRoot() {
        return this
    }

    async onBeforeEnter(location: RouteContext) {
        this.roomCode = location.params.code

        // Проверяем credentials для этой комнаты
        let playerId = localStorage.getItem(`playerId_${this.roomCode}`)
        let playerName = localStorage.getItem(`playerName_${this.roomCode}`)

        if (!playerId || !playerName) {
            const lastRoomCode = localStorage.getItem('lastRoomCode')
            if (lastRoomCode === this.roomCode) {
                playerId = localStorage.getItem('playerId')
                playerName = localStorage.getItem('playerName')
            }
        }

        if (!playerId || !playerName) {
            this.loading = false
            this.showNameForm = true
            this.requestUpdate()
            return
        }

        this.playerId = playerId

        try {
            await this.loadRoom()

            if (this.error === 'You are not in this room') {
                this.error = ''
                this.loading = false
                this.showNameForm = true
                this.requestUpdate()
                return
            }

            await this.connectWebSocket()
        } catch (err) {
            this.error = ''
            this.loading = false
            this.showNameForm = true
            this.requestUpdate()
        } finally {
            this.loading = false
            this.requestUpdate()
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.ws?.close()
    }

    async handleJoinSubmit(e: CustomEvent) {
        const { name } = e.detail

        this.joiningRoom = true
        this.error = ''
        this.requestUpdate()

        try {
            const player = await API.joinRoom(this.roomCode, name)

            localStorage.setItem(`playerId_${this.roomCode}`, player.id)
            localStorage.setItem(`playerName_${this.roomCode}`, player.name)
            localStorage.setItem('playerId', player.id)
            localStorage.setItem('playerName', player.name)
            localStorage.setItem('lastRoomCode', this.roomCode)

            this.playerId = player.id
            this.showNameForm = false
            this.requestUpdate()

            await this.loadRoom()
            await this.connectWebSocket()
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to join room'
        } finally {
            this.joiningRoom = false
            this.requestUpdate()
        }
    }

    handleJoinError(e: CustomEvent) {
        this.error = e.detail.message
        this.requestUpdate()
    }

    handleJoinCancel() {
        navigate('/')
    }

    async connectWebSocket() {
        if (!this.playerId || !this.roomCode) {
            return
        }

        try {
            this.ws = new GameWebSocket()
            await this.ws.connect(this.roomCode, this.playerId)

            this.ws.on('game_started', () => {
                navigate(`/room/${this.roomCode}/game`)
            })

            this.ws.on('join', async () => {
                await this.loadRoom()
            })

            this.ws.on('leave', async () => {
                await this.loadRoom()
            })
        } catch (err) {
            console.error('WebSocket connection failed:', err)
            this.error = 'Failed to connect to room'
        }
    }

    async loadRoom() {
        if (!this.roomCode || !this.playerId) {
            return
        }

        try {
            this.room = await API.getRoom(this.roomCode, this.playerId)

            const isInRoom = this.room.players.some(
                (p) => p.id === this.playerId
            )

            if (!isInRoom) {
                this.error = 'You are not in this room'
                this.room = null
                return
            }

            this.error = ''

            if (this.room.started) {
                navigate(`/room/${this.roomCode}/game`)
            }

            this.requestUpdate()
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to load room'
            throw err
        }
    }

    async handleStartGame() {
        if (!this.room || this.room.players.length < 2) {
            return
        }

        try {
            await API.startGame(this.roomCode)
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to start game'
        }
    }

    handleLeaveRoom() {
        this.ws?.close()

        localStorage.removeItem(`playerId_${this.roomCode}`)
        localStorage.removeItem(`playerName_${this.roomCode}`)

        const lastRoomCode = localStorage.getItem('lastRoomCode')
        if (lastRoomCode === this.roomCode) {
            localStorage.removeItem('playerId')
            localStorage.removeItem('playerName')
            localStorage.removeItem('lastRoomCode')
        }

        navigate('/')
    }

    render() {
        if (this.showNameForm) {
            return html`
                <join-room-form
                    roomCode=${this.roomCode}
                    error=${this.error}
                    ?loading=${this.joiningRoom}
                    @submit=${this.handleJoinSubmit}
                    @error=${this.handleJoinError}
                    @cancel=${this.handleJoinCancel}
                ></join-room-form>
            `
        }

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
                        <app-button @button-click=${this.handleLeaveRoom}>
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
                        @button-click=${this.handleStartGame}
                        ?disabled=${!canStart}
                    >
                        ${canStart
                            ? `Start Game (${this.room.players.length} players)`
                            : 'Need at least 2 players'}
                    </app-button>

                    <app-button
                        variant="ghost"
                        @button-click=${this.handleLeaveRoom}
                    >
                        Leave Room
                    </app-button>
                </app-card>
            </app-container>
        `
    }
}
