package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"tagmyhead/models"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // В продакшене настроить правильно!
	},
}

func WebSocketHandler(c echo.Context) error {
	roomCode := c.Param("code")
	playerID := c.Param("playerId")

	room, exists := models.GetRoom(roomCode)
	if !exists {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Room not found",
		})
	}

	playerExists := false
	var playerName string
	for _, p := range room.Players {
		if p.ID == playerID {
			playerExists = true
			playerName = p.Name
			break
		}
	}

	if !playerExists {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "Player not in room",
		})
	}

	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return err
	}
	defer ws.Close()

	room.AddConnection(playerID, ws)
	defer room.RemoveConnection(playerID)

	time.Sleep(50 * time.Millisecond)

	gameState := room.GetGameStateForPlayer(playerID)
	room.SendGameStateToPlayer(playerID, gameState)

	// Отправляем сообщение о присоединении
	room.Broadcast(models.WSJoinResponse{
		Type:       "join",
		PlayerID:   playerID,
		PlayerName: playerName,
	})

	// Слушаем сообщения от клиента
	for {
		_, msgBytes, err := ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			
			room.Broadcast(models.WSLeaveResponse{
				Type:       "leave",
				PlayerID:   playerID,
				PlayerName: playerName,
			})
			break
		}

		// Сначала читаем только тип сообщения
		var baseMsg models.WSMessageBase
		if err := json.Unmarshal(msgBytes, &baseMsg); err != nil {
			log.Printf("Error parsing message type: %v", err)
			continue
		}

		// Обрабатываем в зависимости от типа
		switch baseMsg.Type {
		case "ping":
			room.SendToPlayer(playerID, models.WSPongResponse{
				Type: "pong",
			})

		case "set_character":
			var msg models.WSSetCharacterMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing set_character: %v", err)
				continue
			}
			room.SetCharacter(msg)

		case "chat":
			var msg models.WSChatMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing chat: %v", err)
				continue
			}
			msg.PlayerID = playerID
			msg.PlayerName = playerName
			room.Broadcast(msg)

		case "guess":
			var msg models.WSGuessMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing guess: %v", err)
				continue
			}
			
			correctCharacter := room.Characters[playerID]
			isCorrect := msg.Character == correctCharacter
			
			room.Broadcast(models.WSGuessResultResponse{
				Type:       "guess_result",
				PlayerID:   playerID,
				PlayerName: playerName,
				Character:  msg.Character,
				Correct:    isCorrect,
			})

		case "question":
			var msg models.WSQuestionMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing question: %v", err)
				continue
			}
			msg.PlayerID = playerID
			msg.PlayerName = playerName
			room.Broadcast(msg)

		case "answer":
			var msg models.WSQuestionMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing answer: %v", err)
				continue
			}
			msg.Type = "answer"
			msg.PlayerID = playerID
			msg.PlayerName = playerName
			room.Broadcast(msg)

		case "move_player":
			var msg models.WSMovePlayerMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing move_player: %v", err)
				continue
			}
			room.MovePlayer(msg.PlayerName, 0)

		case "remove_player":
			var msg models.WSRemovePlayerMessage
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("Error parsing remove_player: %v", err)
				continue
			}
			room.RemovePlayerWithNotification(msg.RemovedID)

		default:
			log.Printf("Unknown message type: %s", baseMsg.Type)
		}
	}

	return nil
}
