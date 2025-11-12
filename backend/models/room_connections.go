package models

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type PlayerConnection struct {
	conn   *websocket.Conn
	send   chan interface{}
	player *Player
	room   *Room
}

func NewPlayerConnection(conn *websocket.Conn, player *Player, room *Room) *PlayerConnection {
	return &PlayerConnection{
		conn:   conn,
		send:   make(chan interface{}, 256),
		player: player,
		room:   room,
	}
}

func (pc *PlayerConnection) writePump() {
	defer func() {
		pc.conn.Close()
	}()

	for message := range pc.send {
		pc.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))

		if err := pc.conn.WriteJSON(message); err != nil {
			log.Printf("Error writing to %s: %v", pc.player.Name, err)
			return
		}
	}

	pc.conn.WriteMessage(websocket.CloseMessage, []byte{})
}

func (pc *PlayerConnection) readPump() {
	defer func() {
		pc.conn.Close()
	}()

	pc.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	pc.conn.SetPongHandler(func(string) error {
		pc.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, msgBytes, err := pc.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}

			// Отправляем уведомление о выходе
			pc.room.sendMessageToAll(WSLeaveResponse{
				Type:       "leave",
				PlayerID:   pc.player.ID,
				PlayerName: pc.player.Name,
				Timestamp:  time.Now().Unix(),
			})
			break
		}

		if err := handleWSMessage(pc.room, msgBytes, pc.player.ID, pc.player.Name); err != nil {
			log.Printf("Error handling message: %v", err)
			pc.room.SendToPlayer(pc.player.ID, WSErrorResponse{
				Type:      "error",
				Error:     err.Error(),
				Timestamp: time.Now().Unix(),
			})
		}
	}
}

func (r *Room) AddConnection(playerID string, conn *websocket.Conn) {
	player := r.GetPlayer(playerID)

	r.connMu.Lock()
	defer r.connMu.Unlock()

	pc := NewPlayerConnection(conn, player, r)
	r.Connections[playerID] = pc

	go pc.writePump()
	go pc.readPump()
}

func (r *Room) RemoveConnection(playerID string) {
	r.connMu.Lock()
	defer r.connMu.Unlock()

	if pc, exists := r.Connections[playerID]; exists {
		close(pc.send)
		delete(r.Connections, playerID)
	}
}
