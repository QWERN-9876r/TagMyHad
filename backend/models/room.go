package models

import (
	"crypto/rand"
	"log"
	"math/big"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Player struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IsWinner bool   `json:"is_winner"`
}

type WSMessage struct {
	Type       string `json:"type"`
	PlayerID   string `json:"player_id"`
	WinnerID   string `json:"winner_id"`
	PlayerName string `json:"player_name,omitempty"`
	Text       string `json:"text,omitempty"`
	Character  string `json:"character,omitempty"`
	Correct    *bool  `json:"correct,omitempty"`
	Timestamp  int64  `json:"timestamp"`
}

type GameState struct {
	Type         string            `json:"type"`
	Players      []Player          `json:"players"`
	Started      bool              `json:"started"`
	Characters   map[string]string `json:"characters"`
	OpponentName string            `json:"opponentName"`
}

type PlayerConnection struct {
	conn   *websocket.Conn
	send   chan WSMessage
	player *Player
	room   *Room
}

func NewPlayerConnection(conn *websocket.Conn, player *Player, room *Room) *PlayerConnection {
	return &PlayerConnection{
		conn:   conn,
		send:   make(chan WSMessage, 256),
		player: player,
		room:   room,
	}
}

func (pc *PlayerConnection) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		pc.conn.Close()
	}()

	for {
		select {
		case message, ok := <-pc.send:
			if !ok {
				pc.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			pc.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := pc.conn.WriteJSON(message); err != nil {
				log.Printf("Error writing to %s: %v", pc.player.Name, err)
				return
			}

		case <-ticker.C:
			pc.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := pc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (pc *PlayerConnection) readPump() {
	defer func() {
		pc.room.RemoveConnection(pc.player.ID)
		pc.conn.Close()
	}()

	pc.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	pc.conn.SetPongHandler(func(string) error {
		pc.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		var msg WSMessage
		err := pc.conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		msg.PlayerID = pc.player.ID
		msg.PlayerName = pc.player.Name

		handleWSMessage(pc.room, msg)
	}
}

type Room struct {
	Code       string            `json:"code"`
	Players    []Player          `json:"players"`
	Started    bool              `json:"started"`
	Characters map[string]string `json:"characters"` // playerId -> character
	WhoMakeFor map[string]Player `json:"who_make_for"`
	CreatedAt  time.Time         `json:"created_at"`
	Messages   []WSMessage       `json:"messages"`

	// WebSocket connections
	Connections map[string]*PlayerConnection `json:"-"` // playerId -> connection
	connMu      sync.RWMutex
	dataMu      sync.RWMutex
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
		WhoMakeFor:  make(map[string]Player),
		Characters:  make(map[string]string),
		Connections: make(map[string]*PlayerConnection),
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

// ✅ Получить игрока по ID (новый метод)
func (r *Room) GetPlayer(playerID string) *Player {
	r.dataMu.RLock()
	defer r.dataMu.RUnlock()

	for i := range r.Players {
		if r.Players[i].ID == playerID {
			return &r.Players[i]
		}
	}
	return nil
}

func (r *Room) findPlayerById(playerId string) int {
	for i, player := range r.Players {
		if player.ID == playerId {
			return i
		}
	}
	return -1
}

func (r *Room) sendMessageToAll(msg WSMessage) {
	msg.Timestamp = time.Now().Unix()

	r.dataMu.Lock()
	r.Messages = append(r.Messages, msg)
	r.dataMu.Unlock()

	r.connMu.RLock()
	defer r.connMu.RUnlock()

	for _, pc := range r.Connections {
		select {
		case pc.send <- msg:
		default:
			log.Printf("Channel full for player %s", pc.player.ID)
		}
	}
}

func (r *Room) sendMessageToAllWithExceptions(msg WSMessage, exceptions []string) {
	msg.Timestamp = time.Now().Unix()

	exceptMap := make(map[string]bool)
	for _, id := range exceptions {
		exceptMap[id] = true
	}

	r.dataMu.Lock()
	r.Messages = append(r.Messages, msg)
	r.dataMu.Unlock()

	r.connMu.RLock()
	defer r.connMu.RUnlock()

	for playerID, pc := range r.Connections {
		if exceptMap[playerID] {
			continue
		}

		select {
		case pc.send <- msg:
		default:
			log.Printf("Channel full for player %s", playerID)
		}
	}
}

// Добавить игрока
func (r *Room) AddPlayer(name string) *Player {
	r.dataMu.Lock()
	defer r.dataMu.Unlock()

	for _, player := range r.Players {
		if player.Name == name {
			return nil
		}
	}

	player := Player{
		ID:       GenerateRoomCode(),
		Name:     name,
		IsWinner: false,
	}

	r.Players = append(r.Players, player)
	return &player
}

// Начать игру
func (r *Room) StartGame() {
	r.dataMu.Lock()
	defer r.dataMu.Unlock()

	if r.Started {
		return
	}

	for i, player := range r.Players {
		if i+1 == len(r.Players) {
			r.WhoMakeFor[player.ID] = r.Players[0]
			continue
		}
		r.WhoMakeFor[player.ID] = r.Players[i+1]
	}

	r.Started = true
}

func (r *Room) SetCharacter(msg WSMessage) {
	r.dataMu.Lock()
	characterFor := r.WhoMakeFor[msg.PlayerID]
	r.Characters[characterFor.ID] = msg.Character
	r.dataMu.Unlock()

	msg.Text = characterFor.Name + " is a " + msg.Character
	msg.PlayerID = characterFor.ID
	msg.Timestamp = time.Now().Unix()
	msg.Type = "set_character"

	r.sendMessageToAllWithExceptions(msg, []string{characterFor.ID})

	msg.Character = "?"
	msg.Text = ""
	r.SendToPlayer(characterFor.ID, msg)
}

func (r *Room) AddWinner(msg WSMessage) {
	r.dataMu.Lock()
	playerIndex := r.findPlayerById(msg.WinnerID)

	if playerIndex == -1 {
		r.dataMu.Unlock()
		return
	}

	if r.Players[playerIndex].IsWinner {
		r.dataMu.Unlock()
		return
	}

	r.Players[playerIndex].IsWinner = true
	winnerName := r.Players[playerIndex].Name
	r.dataMu.Unlock()

	msg.Text = winnerName + " won"
	msg.Type = "add_winner"
	r.sendMessageToAll(msg)
}

// Добавить WebSocket соединение
func (r *Room) AddConnection(playerID string, conn *websocket.Conn) {
	player := r.GetPlayer(playerID)

	r.connMu.Lock()
	defer r.connMu.Unlock()

	pc := NewPlayerConnection(conn, player, r)
	r.Connections[playerID] = pc

	go pc.writePump()
	go pc.readPump()
}

// Удалить WebSocket соединение
func (r *Room) RemoveConnection(playerID string) {
	r.connMu.Lock()
	defer r.connMu.Unlock()

	if pc, exists := r.Connections[playerID]; exists {
		close(pc.send)
		delete(r.Connections, playerID)
	}
}

// Broadcast сообщение всем в комнате
func (r *Room) Broadcast(msg WSMessage) {
	r.sendMessageToAll(msg)
}

// Отправить сообщение конкретному игроку
func (r *Room) SendToPlayer(playerID string, msg WSMessage) {
	msg.Timestamp = time.Now().Unix()

	r.dataMu.Lock()
	r.Messages = append(r.Messages, msg)
	r.dataMu.Unlock()

	r.connMu.RLock()
	defer r.connMu.RUnlock()

	if pc, exists := r.Connections[playerID]; exists {
		select {
		case pc.send <- msg:
		default:
			log.Printf("Channel full for player %s", playerID)
		}
	}
}

// Получить игровое состояние для конкретного игрока
func (r *Room) GetGameStateForPlayer(playerID string) GameState {
	r.dataMu.RLock()
	defer r.dataMu.RUnlock()

	userIndex := 0
	for i, player := range r.Players {
		if player.ID == playerID {
			userIndex = i
			break
		}
	}

	opponentIndex := (userIndex + 1) % len(r.Players)

	// Показываем персонажей всех КРОМЕ текущего игрока
	visibleCharacters := make(map[string]string)
	for pid, char := range r.Characters {
		if pid != playerID {
			visibleCharacters[pid] = char
		}
	}

	return GameState{
		Type:         "init",
		Players:      r.Players,
		Started:      r.Started,
		Characters:   visibleCharacters,
		OpponentName: r.Players[opponentIndex].Name,
	}
}

func handleWSMessage(room *Room, msg WSMessage) {
	switch msg.Type {
	case "chat":
		room.Broadcast(msg)
	case "question":
		room.Broadcast(msg)
	case "answer":
		room.Broadcast(msg)
	case "set_character":
		room.SetCharacter(msg)
	case "add_winner":
		room.AddWinner(msg)
	case "ping":
		room.SendToPlayer(msg.PlayerID, WSMessage{
			Type:      "pong",
			Timestamp: time.Now().Unix(),
		})
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
				for _, pc := range room.Connections {
					close(pc.send)
				}
				room.connMu.Unlock()

				delete(rooms, code)
			}
		}
		mu.Unlock()
	}
}
