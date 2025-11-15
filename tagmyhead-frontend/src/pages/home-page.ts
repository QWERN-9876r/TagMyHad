import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { API } from '../api/api'

import { navigate } from '../router'
import { toggleDevMode } from '../utils/isDev'
import { withViewTransition } from '../utils/with-view-trasition'
import { log } from '../utils/log'

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

    // Функция для извлечения кода из ссылки
    private extractRoomCodeFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url)
            // Проверяем путь вида /room/CODE или /room/CODE/game
            const pathParts = urlObj.pathname.split('/')
            const roomIndex = pathParts.indexOf('room')

            if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
                const code = pathParts[roomIndex + 1]
                // Проверяем, что код состоит из букв и цифр и имеет подходящую длину
                if (/^[A-Z0-9]{4,10}$/i.test(code)) {
                    return code.toUpperCase()
                }
            }

            // Проверяем параметры URL
            const codeParam =
                urlObj.searchParams.get('code') ||
                urlObj.searchParams.get('room')
            if (codeParam && /^[A-Z0-9]{4,10}$/i.test(codeParam)) {
                return codeParam.toUpperCase()
            }
        } catch (e) {
            // Если URL некорректный, возвращаем null
            return null
        }

        return null
    }

    private handlePaste(event: ClipboardEvent) {
        const target = event.target as HTMLInputElement
        if (target.id !== 'join-code-input') return // Обрабатываем только поле кода комнаты

        event.preventDefault()

        const clipboardData = event.clipboardData
        if (!clipboardData) return

        const pastedText = clipboardData.getData('text/plain')

        // Пытаемся извлечь код из вставленного текста
        const roomCode = this.extractRoomCodeFromUrl(pastedText) || pastedText

        // Проверяем, что это валидный код комнаты (только буквы и цифры, 4-10 символов)
        if (/^[A-Z0-9]{4,10}$/i.test(roomCode)) {
            this.joinCode = roomCode.toUpperCase()
        } else {
            // Если это не код, вставляем как есть
            this.joinCode = pastedText.toUpperCase()
        }
    }

    private networkError(err: unknown) {
        console.error('Error:', err)
        this.error = err instanceof Error ? err.message : 'Room not found'
        this.loading = false
        this.requestUpdate()
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

            localStorage.setItem(`playerName_${code}`, this.createName.trim())

            const player = await API.joinRoom(code, this.createName.trim())

            localStorage.setItem(`playerId_${code}`, player.id)

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
            if (await API.hasRoom(code)) {
                API.joinRoom(code, name)
                    .then(async ({ id }) => {
                        localStorage.setItem(`playerName_${code}`, name)
                        localStorage.setItem(`playerId_${code}`, id)

                        const room = await API.getRoom(code, name)

                        if (room.started) {
                            this.error = 'This game has already started'
                            this.loading = false
                            this.requestUpdate()
                            return
                        }

                        navigate(`/room/${code}`)
                    })
                    .catch((err) => this.networkError(err))
            } else {
                this.networkError('Room not found')
            }
        } catch (err) {
            this.networkError(err)
        }
    }

    render() {
        return html`
            <app-container>
                <app-card>
                    <empty-button @dblclick=${toggleDevMode}>
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
                    </empty-button>
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
                            @button-click=${withViewTransition(
                                this.handleCreateRoom,
                                this
                            )}
                        >
                            ${this.loading ? 'Creating...' : 'Create Room'}
                        </app-button>
                    </div>

                    <app-divider></app-divider>

                    <app-text variant="h2">Join Existing Room</app-text>
                    <div>
                        <app-input
                            id="join-code-input"
                            placeholder="Room Code (e.g. ABC123)"
                            .value=${this.joinCode}
                            maxlength="6"
                            required
                            type="text"
                            style="text-transform: uppercase;"
                            @app-input=${(e: CustomEvent) => {
                                this.joinCode = e.detail.value.toUpperCase()
                            }}
                            @paste=${this.handlePaste}
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
                            @button-click=${withViewTransition(
                                this.handleJoinRoom,
                                this
                            )}
                        >
                            ${this.loading ? 'Joining...' : 'Join Room'}
                        </app-button>
                    </div>
                </app-card>
            </app-container>
        `
    }
}
