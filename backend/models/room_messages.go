package models

import "log"

func (r *Room) sendMessageToAll(msg interface{}) {
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

func (r *Room) sendMessageToAllWithExceptions(msg interface{}, exceptions []string) {
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

func (r *Room) Broadcast(msg interface{}) {
	r.sendMessageToAll(msg)
}

func (r *Room) SendToPlayer(playerID string, msg interface{}) {
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
