import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { API } from '../api/api'
import { GameWebSocket } from '../api/websocket'
import { navigate } from '../router'
import type { Room } from '../types'
import { log } from '../utils/log'

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

    private ws: GameWebSocket | null = null

    createRenderRoot() {
        return this
    }

    async onBeforeEnter(location: RouteContext) {
        this.roomCode = location.params.code

        const playerId = localStorage.getItem('playerId')
        const playerName = localStorage.getItem('playerName')

        if (!playerId || !playerName) {
            navigate('/')
            return
        }

        this.playerId = playerId
        await this.loadRoom()

        // ✅ Подключаем WebSocket
        await this.connectWebSocket()

        this.loading = false
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        // ✅ Закрываем WebSocket при уходе со страницы
        this.ws?.close()
    }

    async connectWebSocket() {
        try {
            this.ws = new GameWebSocket()
            await this.ws.connect(this.roomCode, this.playerId)

            // ✅ Слушаем событие старта игры
            this.ws.on('game_started', () => {
                log('🎮 Game started via WebSocket!')
                navigate(`/room/${this.roomCode}/game`)
            })

            // Обновляем список игроков при изменениях
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
        try {
            this.room = await API.getRoom(this.roomCode, this.playerId)

            const isInRoom = this.room.players.some(
                (p) => p.id === this.playerId
            )
            if (!isInRoom) {
                this.error = 'You are not in this room'
                return
            }

            // ✅ Проверяем started (на случай если WebSocket еще не подключен)
            if (this.room.started) {
                navigate(`/room/${this.roomCode}/game`)
            }
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to load room'
        }
    }

    async handleStartGame() {
        if (!this.room || this.room.players.length < 2) {
            return
        }

        try {
            await API.startGame(this.roomCode)

            // ✅ Переход произойдет автоматически через WebSocket событие
            log('Starting game...')
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to start game'
        }
    }

    handleLeaveRoom() {
        this.ws?.close()
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
