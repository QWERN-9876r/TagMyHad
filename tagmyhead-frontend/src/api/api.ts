import type { Room, Player, CreateRoomResponse } from '../types'

const API_BASE = '/api'

export class API {
    static async createRoom(): Promise<CreateRoomResponse> {
        const res = await fetch(`${API_BASE}/room/create`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to create room')
        return res.json()
    }

    static async getRoom(code: string, playerId: string): Promise<Room> {
        const res = await fetch(`${API_BASE}/room/${code}?playerId=${playerId}`)
        if (!res.ok) throw new Error('Room not found')
        return res.json()
    }

    static async joinRoom(code: string, name: string): Promise<Player> {
        const res = await fetch(`${API_BASE}/room/${code}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ name }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to join room')
        }

        const player = await res.json()

        return player
    }

    static async startGame(code: string): Promise<void> {
        const res = await fetch(`${API_BASE}/room/${code}/start`, {
            method: 'POST',
        })
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to start game')
        }
    }
}
