package handlers

import (
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

// GET /ws/:code/:playerId
func WebSocketHandler(c echo.Context) error {
	roomCode := c.Param("code")
	playerID := c.Param("playerId")

	// Проверяем существование комнаты
	room, exists := models.GetRoom(roomCode)
	if !exists {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Room not found",
		})
	}

	// Проверяем что игрок в комнате
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

	// Upgrade connection
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

	room.Broadcast(models.WSMessage{
		Type:       "join",
		PlayerID:   playerID,
		PlayerName: playerName,
		Text:       "",
	})


	// Слушаем сообщения от клиента
	for {
		var msg models.WSMessage
		err := ws.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			
			// Уведомляем о выходе
			room.Broadcast(models.WSMessage{
				Type:       "leave",
				PlayerID:   playerID,
				PlayerName: playerName,
				Text:       "",
			})
			break
		}

		// Устанавливаем ID отправителя
		msg.PlayerID = playerID
		msg.PlayerName = playerName

		// Обрабатываем разные типы сообщений
		switch msg.Type {
		case "ping":
			room.SendToPlayer(playerID, models.WSMessage{
				Type: "pong",
			})

		case "set_character":
			room.SetCharacter(msg)

		case "add_winner":
			room.AddWinner(msg)

		case "chat":
			// Просто транслируем чат всем
			room.Broadcast(msg)

		case "guess":
			// Игрок пытается угадать своего персонажа
			correctCharacter := room.Characters[playerID]
			isCorrect := msg.Character == correctCharacter
			
			// Отправляем результат угадывания всем
			room.Broadcast(models.WSMessage{
				Type:       "guess_result",
				PlayerID:   playerID,
				PlayerName: playerName,
				Character:  msg.Character,
				Correct:    &isCorrect,
				Text:       playerName + " попытался угадать: " + msg.Character,
			})

		case "question":
			// Игрок задает вопрос (да/нет)
			room.Broadcast(models.WSMessage{
				Type:       "question",
				PlayerID:   playerID,
				PlayerName: playerName,
				Text:       msg.Text,
			})

		case "answer":
			// Кто-то отвечает на вопрос
			room.Broadcast(models.WSMessage{
				Type:       "answer",
				PlayerID:   playerID,
				PlayerName: playerName,
				Text:       msg.Text,
			})
		case "remove_player":
			room.RemovePlayerWithNotification(msg.RemovedID)

		default:
			log.Printf("Unknown message type: %s", msg.Type)
		}
	}

	return nil
}
