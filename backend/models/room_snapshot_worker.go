package models

import (
	"log"
	"time"
)

func (r *Room) snapshotWorker() {
	for req := range r.snapshotRequests {
		r.dataMu.RLock()
		
		// Получаем видимые персонажи для игрока
		visibleCharacters := make(map[string]string)
		for pid, char := range r.Characters {
			if pid != req.playerID {
				visibleCharacters[pid] = char
			} else if char != "" {
				visibleCharacters[pid] = "?"
			}
		}

		// Фильтруем сообщения
		messages := make([]interface{}, 0, len(r.Messages))
		for _, message := range r.Messages {
			switch msg := message.(type) {
			case WSSetCharacterResponse:
				if msg.PlayerID == req.playerID && msg.Character != "?" {
					continue
				}
			}
			messages = append(messages, message)
		}

		// Копируем players
		playersCopy := make([]Player, len(r.Players))
		copy(playersCopy, r.Players)

		snapshot := RoomSnapshot{
			Code:       r.Code,
			Players:    playersCopy,
			Started:    r.Started,
			Characters: visibleCharacters,
			Messages:   messages,
		}
		
		r.dataMu.RUnlock()

		// Отправляем результат
		select {
		case req.responseCh <- snapshot:
		case <-time.After(1 * time.Second):
			log.Printf("Timeout sending snapshot to player %s", req.playerID)
		}
		close(req.responseCh)
	}
}

// GetSnapshotForPlayer запрашивает снимок комнаты для игрока
func (r *Room) GetSnapshotForPlayer(playerID string) <-chan RoomSnapshot {
	responseCh := make(chan RoomSnapshot, 1)
	
	req := snapshotRequest{
		playerID:   playerID,
		responseCh: responseCh,
	}
	
	select {
	case r.snapshotRequests <- req:
		return responseCh
	case <-time.After(2 * time.Second):
		// Если не удалось отправить запрос, возвращаем закрытый канал
		close(responseCh)
		return responseCh
	}
}
