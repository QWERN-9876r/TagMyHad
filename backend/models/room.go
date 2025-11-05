package models

import (
	"crypto/rand"
	"math/big"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Player struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IsWinner bool `json:"is_winner"`
}

type Room struct {
	Code       string            `json:"code"`
	Players    []Player          `json:"players"`
	Started    bool              `json:"started"`
	Characters map[string]string `json:"characters"` // playerId -> character
	WhoMakeFor map[string]Player `json:"who_make_for"`
	CreatedAt  time.Time         `json:"created_at"`
	
	// WebSocket connections
	Connections map[string]*websocket.Conn `json:"-"` // playerId -> connection
	connMu      sync.RWMutex
}

// WebSocket message types
type WSMessage struct {
	Type      string `json:"type"`      // "join", "chat", "guess", "answer", "game_state"
	PlayerID  string `json:"player_id"`
	WinnerID  string `json:"winner_id"`
	PlayerName string `json:"player_name,omitempty"`
	Text      string `json:"text,omitempty"`
	Character string `json:"character,omitempty"`
	Correct   *bool  `json:"correct,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// Game state для отправки клиентам
type GameState struct {
	Type       string            `json:"type"`
	Players    []Player          `json:"players"`
	Started    bool              `json:"started"`
	Characters map[string]string `json:"characters"`
	OpponentName string          `json:"opponentName"`
}

// Глобальное хранилище комнат
var (
	rooms = make(map[string]*Room)
	mu    sync.RWMutex
)

// Генерация кода комнаты
func GenerateRoomCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 6)
	for i := range code {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		code[i] = charset[n.Int64()]
	}
	return string(code)
}

// Создать комнату
func CreateRoom() *Room {
	mu.Lock()
	defer mu.Unlock()

	code := GenerateRoomCode()
	for {
		if _, exists := rooms[code]; !exists {
			break
		}
		code = GenerateRoomCode()
	}

	room := &Room{
		Code:        code,
		Players:     []Player{},
		Started:     false,
		WhoMakeFor: make(map[string]Player),
		Characters:  make(map[string]string),
		Connections: make(map[string]*websocket.Conn),
		CreatedAt:   time.Now(),
	}

	rooms[code] = room
	return room
}

// Получить комнату
func GetRoom(code string) (*Room, bool) {
	mu.RLock()
	defer mu.RUnlock()
	room, exists := rooms[code]
	return room, exists
}

func (r *Room) findPlayerById(playerId string) int {
	for i, player := range r.Players {
		if player.ID == playerId {
			return i
		}
	}

	return -1
}

func (r* Room) sendMessageToAll(msg WSMessage) {
	for _, conn := range r.Connections {
		go func(c *websocket.Conn) {
			c.WriteJSON(msg)
		}(conn)
	}
}

// Добавить игрока
func (r *Room) AddPlayer(name string) Player {
	mu.Lock()
	defer mu.Unlock()

	player := Player{
		ID:   GenerateRoomCode(),
		Name: name,
		IsWinner: false,
	}
	r.Players = append(r.Players, player)
	return player
}

// Начать игру
func (r *Room) StartGame() {
	mu.Lock()
	defer mu.Unlock()

	if r.Started {
		return
	}

	for i, player := range r.Players {
		if i + 1 == len(r.Players) {
			r.WhoMakeFor[player.ID] = r.Players[0]
			continue
		}

		r.WhoMakeFor[player.ID] = r.Players[i + 1]
	}

	r.Started = true
}

func (r *Room) SetCharacter(msg WSMessage) {
	characterFor := r.WhoMakeFor[msg.PlayerID]
	r.Characters[characterFor.ID] = msg.Character

	r.connMu.RLock()
	defer r.connMu.RUnlock()

	msg.Text = characterFor.Name + " is a " + msg.Character
	msg.PlayerID = characterFor.ID
	msg.Timestamp = time.Now().Unix()
	msg.Type = "set_character"

	r.sendMessageToAll(msg)
}

func (r *Room) AddWinner(msg WSMessage) {
	playerIndex := r.findPlayerById(msg.WinnerID)
	player := r.Players[playerIndex]

	if (player.IsWinner) {
		return
	}

	player.IsWinner = true

	msg.Text = r.Players[playerIndex].Name + " won"

	r.sendMessageToAll(msg)
}

// Добавить WebSocket соединение
func (r *Room) AddConnection(playerID string, conn *websocket.Conn) {
	r.connMu.Lock()
	defer r.connMu.Unlock()
	r.Connections[playerID] = conn
}

// Удалить WebSocket соединение
func (r *Room) RemoveConnection(playerID string) {
	r.connMu.Lock()
	defer r.connMu.Unlock()
	if conn, exists := r.Connections[playerID]; exists {
		conn.Close()
		delete(r.Connections, playerID)
	}
}

// Broadcast сообщение всем в комнате
func (r *Room) Broadcast(msg WSMessage) {
	r.connMu.RLock()
	defer r.connMu.RUnlock()

	msg.Timestamp = time.Now().Unix()

	for _, conn := range r.Connections {
		go func(c *websocket.Conn) {
			c.WriteJSON(msg)
		}(conn)
	}
}

// Отправить сообщение конкретному игроку
func (r *Room) SendToPlayer(playerID string, msg WSMessage) {
	r.connMu.RLock()
	defer r.connMu.RUnlock()

	msg.Timestamp = time.Now().Unix()

	if conn, exists := r.Connections[playerID]; exists {
		conn.WriteJSON(msg)
	}
}

// Получить игровое состояние для конкретного игрока
func (r *Room) GetGameStateForPlayer(playerID string) GameState {
	mu.RLock()
	defer mu.RUnlock()

	userIndex := 0

	for i, player := range r.Players {
		if player.ID == playerID {
			userIndex = i
		}
	}

	opponentIndex := userIndex + 1

	if opponentIndex == len(r.Players) {
		opponentIndex = 0
	}

	// Показываем персонажей всех КРОМЕ текущего игрока
	visibleCharacters := make(map[string]string)
	for pid, char := range r.Characters {
		if pid != playerID {
			visibleCharacters[pid] = char
		}
	}

	return GameState{
		Type:       "init",
		Players:    r.Players,
		Started:    r.Started,
		Characters: visibleCharacters,
		OpponentName: r.Players[opponentIndex].Name,
	}
}

// Очистка старых комнат
func CleanupOldRooms() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		mu.Lock()
		now := time.Now()
		for code, room := range rooms {
			if now.Sub(room.CreatedAt) > 2*time.Hour {
				// Закрываем все соединения
				room.connMu.Lock()
				for _, conn := range room.Connections {
					conn.Close()
				}
				room.connMu.Unlock()
				
				delete(rooms, code)
			}
		}
		mu.Unlock()
	}
}
