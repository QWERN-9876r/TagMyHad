export interface Player {
    id: string
    name: string
    isWinner?: boolean
}

export interface Room {
    code: string
    players: Player[]
    started: boolean
    created_at: string
    characters: Record<string, string>
    whoMakeFor?: Record<string, string>
    messages: WSMessage[]
}

export interface GameState {
    type: 'init'
    players: Player[]
    started: boolean
    characters: Record<string, string>
    opponentName: string
}

export interface WSMessage {
    type:
        | 'pong'
        | 'join'
        | 'leave'
        | 'chat'
        | 'question'
        | 'answer'
        | 'guess'
        | 'guess_result'
        | 'game_state'
        | 'set_character'
    playerId: string
    removedId?: string
    winnerId?: string
    playerName?: string
    text?: string
    character?: string
    correct?: boolean
    timestamp: number
}

export interface CreateRoomResponse {
    code: string
}
