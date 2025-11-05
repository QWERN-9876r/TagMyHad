import type { GameState, WSMessage } from '../types'

type MessageHandler = (msg: WSMessage | GameState) => void

export class GameWebSocket {
    private ws: WebSocket | null = null
    private listeners: Map<string, Set<MessageHandler>> = new Map()

    connect(roomCode: string, playerId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const protocol =
                window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const host = window.location.host
            const url = `${protocol}//${host}/ws/${roomCode}/${playerId}`

            console.log('Connecting to WebSocket:', url)
            this.ws = new WebSocket(url)

            this.ws.onopen = () => {
                console.log('WebSocket connected')
                resolve()
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                reject(error)
            }

            this.ws.onmessage = (event) => {
                try {
                    const msg: WSMessage = JSON.parse(event.data)
                    console.log('Received message:', msg)
                    this.emit(msg.type, msg)
                    this.emit('*', msg)
                } catch (err) {
                    console.error('Failed to parse message:', err)
                }
            }

            this.ws.onclose = () => {
                console.log('WebSocket closed')
                this.emit('close', {} as WSMessage)
            }
        })
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

    send(type: string, data: Partial<WSMessage> = {}) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }))
            console.log(JSON.stringify({ type, ...data }))
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
        this.send('add_winner', { winner_id: winnerId })
    }

    sendGuess(character: string) {
        this.send('guess', { character })
    }

    close() {
        this.listeners.clear()
        this.ws?.close()
        this.ws = null
    }
}
