package models

import (
	"log"
	"time"
)

func (r *Room) RemovePlayer(playerID string) bool {
	r.dataMu.Lock()
	defer r.dataMu.Unlock()

	playerIndex := r.findPlayerById(playerID)
	if playerIndex == -1 {
		log.Printf("⚠️ Player %s not found in room %s", playerID, r.Code)
		return false
	}

	r.Players = append(r.Players[:playerIndex], r.Players[playerIndex+1:]...)
	delete(r.Characters, playerID)
	delete(r.WhoMakeFor, playerID)

	for pid, targetPlayer := range r.WhoMakeFor {
		if targetPlayer.ID == playerID {
			delete(r.WhoMakeFor, pid)
		}
	}

	return true
}

func (r *Room) RemovePlayerWithNotification(playerID string) bool {
	player := r.GetPlayer(playerID)
	if player == nil {
		return false
	}
	playerName := player.Name

	if !r.RemovePlayer(playerID) {
		return false
	}

	r.sendMessageToAll(WSPlayerRemovedResponse{
		Type:       "player_removed",
		RemovedID:  playerID,
		PlayerName: playerName,
		Text:       playerName + " was removed from the game",
		Timestamp:  time.Now().Unix(),
	})

	r.RemoveConnection(playerID)
	return true
}

func (r *Room) SetCharacter(msg WSSetCharacterMessage) {
	r.dataMu.Lock()
	characterFor := r.WhoMakeFor[msg.PlayerID]
	r.Characters[characterFor.ID] = msg.Character
	r.dataMu.Unlock()

	// Сообщение для всех кроме владельца персонажа
	msgForOthers := WSSetCharacterResponse{
		Type:      "set_character",
		PlayerID:  characterFor.ID,
		Character: msg.Character,
		Text:      characterFor.Name + " is a " + msg.Character,
		Timestamp: time.Now().Unix(),
	}

	r.sendMessageToAllWithExceptions(msgForOthers, []string{characterFor.ID})

	// Сообщение для владельца персонажа (скрытый персонаж)
	msgForOwner := WSSetCharacterResponse{
		Type:      "set_character",
		PlayerID:  characterFor.ID,
		Character: "?",
		Text:      "",
		Timestamp: time.Now().Unix(),
	}

	r.SendToPlayer(characterFor.ID, msgForOwner)
}

func (r *Room) AddWinner(msg WSAddWinnerMessage) {
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

	r.sendMessageToAll(WSAddWinnerResponse{
		Type:      "winner_added",
		WinnerID:  msg.WinnerID,
		Text:      winnerName + " won the game!",
		Timestamp: time.Now().Unix(),
	})
}
