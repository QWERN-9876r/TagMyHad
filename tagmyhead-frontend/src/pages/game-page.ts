import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { GameWebSocket } from '../api/websocket'
import { API } from '../api/api'
import type { Room, WSMessage } from '../types'
import { navigate } from '../router'
import { log } from '../utils/log'

interface RouteContext {
    params: {
        code: string
    }
}

@customElement('game-page')
export class GamePage extends LitElement {
    @state() room: Room | null = null
    @state() messages: WSMessage[] = []
    @state() error = ''
    @state() roomCode = ''
    @state() playerId = ''
    @state() guessInput = ''
    @state() characterInput = ''
    @state() loading = true
    @state() opponentName = ''
    @state() winners: string[] = []
    @state() characters: Record<string, string> = {}

    private ws: GameWebSocket | null = null

    static styles = css`
        .game-layout {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: var(--space-lg);
            margin-top: var(--space-lg);
        }

        .players_title {
            display: flex;
            align-items: center;
        }

        .mystery-card {
            background: rgba(167, 139, 250, 0.1);
            border: 2px dashed var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-lg);
            text-align: center;
            margin: var(--space-lg) 0;
        }

        .mystery-icon {
            font-size: var(--font-size-4xl);
            margin: var(--space-md) 0;
        }

        .guess-section {
            margin-top: var(--space-lg);
            padding: var(--space-lg);
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
        }

        .guess-form {
            display: flex;
            gap: var(--space-sm);
            margin-top: var(--space-md);
        }

        .guess-form input {
            flex: 1;
        }

        .guess-form button {
            padding: var(--space-md) var(--space-xl);
            background: var(--color-secondary);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: var(--font-weight-semibold);
            transition: all var(--transition-base);
        }

        .guess-form button:hover {
            background: var(--color-secondary-hover);
        }

        @media (max-width: 968px) {
            .game-layout {
                grid-template-columns: 1fr;
            }
        }
    `

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
        await this.loadRoomAndConnect()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.ws?.close()
    }

    async loadRoomAndConnect() {
        try {
            this.room = await API.getRoom(this.roomCode, this.playerId)

            this.messages = this.room.messages

            this.ws = new GameWebSocket()
            await this.ws.connect(this.roomCode, this.playerId)

            this.ws.on('*', (msg) => {
                if (msg.type === 'init') {
                    this.opponentName = msg.opponentName
                    this.characters = msg.characters

                    return
                }

                if (!msg.type || msg.type === 'game_state') return

                if (msg.type === 'set_character') {
                    if (this.room) {
                        this.room.characters[msg.player_id] = msg.character!
                    }
                }
                this.messages = [...this.messages, msg]
                this.requestUpdate()
            })

            this.ws.on('game_state', () => {
                this.refreshRoom()
            })

            this.ws.on('add_winner', (msg) => {
                const playerId = (msg as WSMessage).player_id
                const player = this.room?.players.find(
                    (player) => player.id === playerId
                )

                if (!player) return

                player.is_winner = true
            })

            this.ws.on('add_winner', () => {
                this.refreshRoom()
            })

            this.ws.on('set_character', (msg) => {
                this.characters[(msg as WSMessage).player_id] = (
                    msg as WSMessage
                ).character!
            })

            this.ws.on('player_left', async (msg) => {
                if (!this.room) return

                this.room.players = this.room.players.filter(
                    ({ id }) => (msg as WSMessage).player_id !== id
                )
            })

            this.loading = false
            this.requestUpdate()
        } catch (err) {
            this.error =
                err instanceof Error ? err.message : 'Failed to load game'
            this.loading = false
            this.requestUpdate()
        }
    }

    async refreshRoom() {
        try {
            this.room = await API.getRoom(this.roomCode, this.playerId)

            this.messages = this.room.messages

            this.requestUpdate()
        } catch (err) {
            console.error('Failed to refresh room:', err)
        }
    }

    handleSendMessage(e: CustomEvent) {
        const { type, text } = e.detail

        if (!this.ws) return

        switch (type) {
            case 'chat':
                this.ws.sendChat(text)
                break
            case 'question':
                this.ws.sendQuestion(text)
                break
            case 'answer':
                this.ws.sendAnswer(text)
                break
        }
    }

    handleCharacterInput(e: Event) {
        e.preventDefault()
        const character = this.characterInput.trim()

        if (!character || !this.ws) return

        this.ws.sendCharacter(character)
        this.characterInput = ''
    }

    handleGuess(e: Event) {
        e.preventDefault()
        const character = this.guessInput.trim()

        if (!character || !this.ws) return

        this.ws.sendGuess(character)
        this.guessInput = ''
        this.requestUpdate()
    }

    private handleLeaveGame() {
        this.ws?.close()
        localStorage.removeItem('playerId')
        navigate('/')
    }

    private handleSuccessAnswer({ detail: { playerId } }: CustomEvent) {
        log(playerId)

        this.ws?.addWinner(playerId)
    }

    private handleRemovePlayer(e: CustomEvent) {
        const playerId = e.detail.id
        const playerName = e.detail.name

        log('Removing player:', playerName)

        if (confirm(`Remove player ${playerName}?`)) {
            this.ws?.send('remove_player', { player_id: playerId })
            this.refreshRoom()
        }
    }

    render() {
        if (this.loading) {
            return html`
                <app-container>
                    <app-card>
                        <app-text variant="h2" color="secondary"
                            >Connecting to game...</app-text
                        >
                    </app-card>
                </app-container>
            `
        }

        if (!this.room) {
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
                        <app-button @button-click=${this.handleLeaveGame}>
                            Back to Home
                        </app-button>
                    </app-card>
                </app-container>
            `
        }

        return html`
            <app-container>
                <app-card>
                    <app-text variant="h1">Room: ${this.roomCode}</app-text>

                    ${this.error
                        ? html`
                              <app-alert variant="error"
                                  >${this.error}</app-alert
                              >
                          `
                        : ''}

                    <div class="mystery-card">
                        <app-text variant="h3">Your Character</app-text>
                        <app-text color="secondary">
                            You don't know who you are!<br />
                            Ask yes/no questions to figure it out.
                        </app-text>
                    </div>

                    <div class="game-layout">
                        <div class="sidebar">
                            <app-text variant="h2">
                                <div>Players</div>
                                <app-badge variant="secondary"
                                    >${this.room.players.length}</app-badge
                                >
                            </app-text>

                            <div @remove-player=${this.handleRemovePlayer}>
                                ${this.room.players.map(
                                    (player) => html`
                                        <app-player-item
                                            name=${player.name}
                                            id=${player.id}
                                            ?isYou=${player.id ===
                                            this.playerId}
                                            character=${this.characters[
                                                player.id
                                            ] || ''}
                                            ?is-winner=${player.is_winner}
                                        ></app-player-item>
                                    `
                                )}
                            </div>

                            <div class="guess-section">
                                <app-text variant="h3"
                                    >${this.opponentName} is a:</app-text
                                >
                                <form class="guess-form">
                                    <app-input
                                        type="text"
                                        placeholder="Who is he/she"
                                        .value=${this.characterInput}
                                        @input=${(e: Event) =>
                                            (this.characterInput = (
                                                e.target as HTMLInputElement
                                            ).value)}
                                    ></app-input>
                                    <app-button
                                        @button-click=${this
                                            .handleCharacterInput}
                                        >Send</app-button
                                    >
                                </form>
                            </div>

                            <app-button
                                variant="ghost"
                                @button-click=${this.handleLeaveGame}
                            >
                                Leave Game
                            </app-button>
                        </div>

                        <div class="main-area">
                            <app-text variant="h2">💬 Chat</app-text>
                            <app-chat-box
                                .messages=${this.messages}
                                playerId=${this.playerId}
                                @send-message=${this.handleSendMessage}
                                @success-answer=${this.handleSuccessAnswer}
                            ></app-chat-box>
                        </div>
                    </div>
                </app-card>
            </app-container>
        `
    }
}
