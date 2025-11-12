package models

import (
	"encoding/json"
	"fmt"
	"time"
)

func handleWSMessage(room *Room, msgBytes []byte, playerID, playerName string) error {
	var baseMsg WSMessageBase
	if err := json.Unmarshal(msgBytes, &baseMsg); err != nil {
		return fmt.Errorf("error parsing message type: %w", err)
	}

	timestamp := time.Now().Unix()

	switch baseMsg.Type {
	case "chat":
		var msg WSChatMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing chat: %w", err)
		}
		room.Broadcast(WSChatResponse{
			Type:       "chat",
			PlayerID:   playerID,
			PlayerName: playerName,
			Text:       msg.Text,
			Timestamp:  timestamp,
		})

	case "question":
		var msg WSQuestionMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing question: %w", err)
		}
		room.Broadcast(WSQuestionResponse{
			Type:       "question",
			PlayerID:   playerID,
			PlayerName: playerName,
			Text:       msg.Text,
			Timestamp:  timestamp,
		})

	case "answer":
		var msg WSQuestionMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing answer: %w", err)
		}
		room.Broadcast(WSAnswerResponse{
			Type:       "answer",
			PlayerID:   playerID,
			PlayerName: playerName,
			Text:       msg.Text,
			Timestamp:  timestamp,
		})

	case "set_character":
		var msg WSSetCharacterMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing set_character: %w", err)
		}
		msg.PlayerID = playerID
		room.SetCharacter(msg)

	case "add_winner":
		var msg WSAddWinnerMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing add_winner: %w", err)
		}
		room.AddWinner(msg)

	case "remove_player":
		var msg WSRemovePlayerMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing remove_player: %w", err)
		}
		room.RemovePlayerWithNotification(msg.RemovedID)

	case "move_player":
		var msg WSMovePlayerMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing move_player: %w", err)
		}
		room.MovePlayer(msg.PlayerName, msg.Index)

	case "ping":
		room.SendToPlayer(playerID, WSPongResponse{
			Type:      "pong",
		})

	case "guess":
		var msg WSGuessMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			return fmt.Errorf("error parsing guess: %w", err)
		}

		room.dataMu.RLock()
		correctCharacter := room.Characters[playerID]
		room.dataMu.RUnlock()

		isCorrect := msg.Character == correctCharacter

		room.Broadcast(WSGuessResultResponse{
			Type:       "guess_result",
			PlayerID:   playerID,
			PlayerName: playerName,
			Character:  msg.Character,
			Correct:    isCorrect,
			Text:       fmt.Sprintf("%s guessed: %s", playerName, msg.Character),
			Timestamp:  timestamp,
		})

	default:
		return fmt.Errorf("unknown message type: %s", baseMsg.Type)
	}

	return nil
}
