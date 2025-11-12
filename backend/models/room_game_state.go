package models

import "log"

type GameState struct {
	Type         string            `json:"type"`
	Players      []Player          `json:"players"`
	Started      bool              `json:"started"`
	Characters   map[string]string `json:"characters"`
	OpponentName string            `json:"opponentName"`
}

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

	visibleCharacters := make(map[string]string)
	for pid, char := range r.Characters {
		if pid != playerID {
			visibleCharacters[pid] = char
		} else if char != "" {
			visibleCharacters[pid] = "?"
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

func (r *Room) SendGameStateToPlayer(playerID string, state GameState) {
	r.connMu.RLock()
	defer r.connMu.RUnlock()

	if pc, exists := r.Connections[playerID]; exists {
		select {
		case pc.send <- state:
		default:
			log.Printf("Channel full for player %s", playerID)
		}
	}
}
