package models

// ============ БАЗОВЫЕ СТРУКТУРЫ ============

type WSMessageBase struct {
	Type string `json:"type"`
}

// ============ ВХОДЯЩИЕ СООБЩЕНИЯ (от клиента) ============

type WSChatMessage struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId,omitempty"`
	PlayerName string `json:"playerName,omitempty"`
	Text       string `json:"text"`
}

type WSQuestionMessage struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId,omitempty"`
	PlayerName string `json:"playerName,omitempty"`
	Text       string `json:"text"`
}

type WSSetCharacterMessage struct {
	Type      string `json:"type"`
	PlayerID  string `json:"playerId,omitempty"`
	Character string `json:"character"`
}

type WSAddWinnerMessage struct {
	Type     string `json:"type"`
	WinnerID string `json:"winnerId"`
}

type WSRemovePlayerMessage struct {
	Type      string `json:"type"`
	RemovedID string `json:"removedId"`
}

type WSPingMessage struct {
	Type string `json:"type"`
}

type WSGuessMessage struct {
	Type      string `json:"type"`
	Character string `json:"character"`
}

type WSMovePlayerMessage struct {
	Type       string `json:"type"`
	PlayerName string `json:"playerName"`
	Index      int    `json:"index"`
}

// ============ ИСХОДЯЩИЕ СООБЩЕНИЯ (к клиенту) ============

type WSJoinResponse struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Timestamp  int64  `json:"timestamp"`
}

type WSLeaveResponse struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Timestamp  int64  `json:"timestamp"`
}

type WSChatResponse struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Text       string `json:"text"`
	Timestamp  int64  `json:"timestamp"`
}

type WSQuestionResponse struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Text       string `json:"text"`
	Timestamp  int64  `json:"timestamp"`
}

type WSAnswerResponse struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Text       string `json:"text"`
	Timestamp  int64  `json:"timestamp"`
}

type WSSetCharacterResponse struct {
	Type      string `json:"type"`
	PlayerID  string `json:"playerId"`
	Character string `json:"character"` // "?" для владельца персонажа
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type WSAddWinnerResponse struct {
	Type      string `json:"type"`
	WinnerID  string `json:"winnerId"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type WSPlayerRemovedResponse struct {
	Type       string `json:"type"`
	RemovedID  string `json:"removedId"`
	PlayerName string `json:"playerName"`
	Text       string `json:"text"`
	Timestamp  int64  `json:"timestamp"`
}

type WSGameStartedResponse struct {
	Type      string `json:"type"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type WSPongResponse struct {
	Type      string `json:"type"`
}

type WSGuessResultResponse struct {
	Type       string `json:"type"`
	PlayerID   string `json:"playerId"`
	PlayerName string `json:"playerName"`
	Character  string `json:"character"`
	Correct    bool   `json:"correct"`
	Text       string `json:"text"`
	Timestamp  int64  `json:"timestamp"`
}

type WSErrorResponse struct {
	Type      string `json:"type"`
	Error     string `json:"error"`
	Timestamp int64  `json:"timestamp"`
}
