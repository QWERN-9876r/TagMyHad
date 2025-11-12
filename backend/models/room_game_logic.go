package models

import "time"

func (r *Room) swapPlayers(index1 int, index2 int) {
	player1 := r.Players[index1]
	r.Players[index1] = r.Players[index2]
	r.Players[index2] = player1
}

func (r *Room) calcWhoMakeFor() {
	for i, player := range r.Players {
		if i+1 == len(r.Players) {
			r.WhoMakeFor[player.ID] = r.Players[0]
			continue
		}
		r.WhoMakeFor[player.ID] = r.Players[i+1]
	}
}

func (r *Room) StartGame() {
	r.dataMu.Lock()

	if r.Started {
		r.dataMu.Unlock()
		return
	}

	r.calcWhoMakeFor()
	r.Started = true
	r.dataMu.Unlock()

	r.Messages = make([]interface{}, 0)

	r.sendMessageToAll(WSGameStartedResponse{
		Type:      "game_started",
		Text:      "Game has started!",
		Timestamp: time.Now().Unix(),
	})
}
