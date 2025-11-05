export interface Player {
    id: string
    name: string
    is_winner?: boolean
}

export interface Room {
    code: string
    players: Player[]
    started: boolean
    created_at: string
    characters: Record<string, string>
    who_make_for?: Record<string, string>
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
        | 'join'
        | 'leave'
        | 'chat'
        | 'question'
        | 'answer'
        | 'guess'
        | 'guess_result'
        | 'game_state'
        | 'set_character'
    player_id: string
    winner_id?: string
    player_name?: string
    text?: string
    character?: string
    correct?: boolean
    timestamp: number
}

export interface CreateRoomResponse {
    code: string
}
