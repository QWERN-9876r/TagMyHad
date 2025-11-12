import type { GameState, WSMessage } from '../types'
import { log } from '../utils/log'

type MessageHandler = (msg: WSMessage | GameState) => void

export class GameWebSocket {
    private ws: WebSocket | null = null
    private listeners: Map<string, Set<MessageHandler>> = new Map()
    private heartbeatInterval: number | null = null
    private reconnectTimeout: number | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5

    connect(roomCode: string, playerId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const protocol =
                window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const host = window.location.host
            const url = `${protocol}//${host}/ws/${roomCode}/${playerId}`

            log('Connecting to WebSocket:', url)
            this.ws = new WebSocket(url)

            this.ws.onopen = () => {
                log('WebSocket connected')
                this.startHeartbeat()
                resolve()
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                reject(error)
            }

            this.ws.onmessage = (event) => {
                try {
                    const msg: WSMessage = JSON.parse(event.data)
                    log('Received message:', msg)

                    if (msg.type === 'pong') {
                        return
                    }

                    this.emit(msg.type, msg)
                    this.emit('*', msg)
                } catch (err) {
                    console.error('Failed to parse message:', err)
                }
            }

            this.ws.onclose = () => {
                log('WebSocket closed')
                this.stopHeartbeat()
                this.emit('close', {} as WSMessage)

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect(roomCode, playerId)
                }
            }
        })
    }

    private startHeartbeat() {
        this.stopHeartbeat()
        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send('ping')
            }
        }, 30000)
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }

    private scheduleReconnect(roomCode: string, playerId: string) {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
        }

        const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            10000
        )
        log(
            `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`
        )

        this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectAttempts++
            this.connect(roomCode, playerId).catch((err) => {
                console.error('Reconnect failed:', err)
            })
        }, delay)
    }

    on(type: string, callback: MessageHandler) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set())
        }
        this.listeners.get(type)!.add(callback)
    }

    off(type: string, callback: MessageHandler) {
        this.listeners.get(type)?.delete(callback)
    }

    private emit(type: string, msg: WSMessage) {
        this.listeners.get(type)?.forEach((cb) => {
            try {
                cb(msg)
            } catch (err) {
                console.error('Error in message handler:', err)
            }
        })
    }

    private send(type: string, data: Partial<WSMessage> = {}) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }))
            log(JSON.stringify({ type, ...data }))
        }
    }

    sendChat(text: string) {
        this.send('chat', { text })
    }

    sendQuestion(text: string) {
        this.send('question', { text })
    }

    sendAnswer(text: string) {
        this.send('answer', { text })
    }

    sendCharacter(character: string) {
        this.send('set_character', { character })
    }

    addWinner(winnerId: string) {
        this.send('add_winner', { winnerId: winnerId })
    }

    sendGuess(character: string) {
        this.send('guess', { character })
    }

    removePlayer(removedId: string) {
        this.send('remove_player', { removedId })
    }

    close() {
        this.listeners.clear()
        this.ws?.close()
        this.ws = null
    }
}
