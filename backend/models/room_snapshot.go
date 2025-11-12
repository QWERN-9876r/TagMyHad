package models

// Структура запроса снимка
type snapshotRequest struct {
	playerID   string
	responseCh chan RoomSnapshot
}

// Структура снимка комнаты
type RoomSnapshot struct {
	Code       string
	Players    []Player
	Started    bool
	Characters map[string]string
	Messages   []interface{}
}
