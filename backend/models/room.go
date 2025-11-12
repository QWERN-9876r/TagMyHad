package models

import (
	"sync"
	"time"
)

type Room struct {
	Code       string            `json:"code"`
	Players    []Player          `json:"players"`
	Started    bool              `json:"started"`
	Characters map[string]string `json:"characters"`
	WhoMakeFor map[string]Player `json:"who_make_for"`
	CreatedAt  time.Time         `json:"created_at"`
	Messages   []interface{}     `json:"messages"`

	Connections map[string]*PlayerConnection `json:"-"`
	connMu      sync.RWMutex
	dataMu      sync.RWMutex
	
	// Канал для запросов снимков комнаты
	snapshotRequests chan snapshotRequest
}
