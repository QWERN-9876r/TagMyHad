package models

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

func (r *Room) AddPlayer(name string) *Player {
	r.dataMu.Lock()
	defer r.dataMu.Unlock()

	for _, player := range r.Players {
		if player.Name == name {
			return nil
		}
	}

	player := Player{
		ID:       name,
		Name:     name,
		IsWinner: false,
	}

	r.Players = append(r.Players, player)
	return &player
}

func (r *Room) MovePlayer(playerName string, index int) {
	r.dataMu.Lock()
	defer r.dataMu.Unlock()

	playerIndex := r.findPlayerById(playerName)

	if playerIndex == index {
		return
	}

	for playerIndex != index {
		if playerIndex > index {
			r.swapPlayers(playerIndex, playerIndex-1)
			playerIndex--
		} else {
			r.swapPlayers(playerIndex, playerIndex+1)
			playerIndex++
		}
	}

	r.calcWhoMakeFor()
}
