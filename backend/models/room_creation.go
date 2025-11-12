package models

import (
	"crypto/rand"
	"math/big"
	"sync"
	"time"
)

var (
	rooms = make(map[string]*Room)
	mu    sync.RWMutex
)

func GenerateRoomCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 6)
	for i := range code {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		code[i] = charset[n.Int64()]
	}
	return string(code)
}

func CreateRoom() *Room {
	mu.Lock()
	defer mu.Unlock()

	code := GenerateRoomCode()
	for {
		if _, exists := rooms[code]; !exists {
			break
		}
		code = GenerateRoomCode()
	}

	room := &Room{
		Code:        code,
		Players:     []Player{},
		Started:     false,
		WhoMakeFor:  make(map[string]Player),
		Characters:  make(map[string]string),
		Connections: make(map[string]*PlayerConnection),
		CreatedAt:   time.Now(),
		snapshotRequests: make(chan snapshotRequest, 10),
	}

	go room.snapshotWorker()

	rooms[code] = room
	return room
}

func GetRoom(code string) (*Room, bool) {
	mu.RLock()
	defer mu.RUnlock()
	room, exists := rooms[code]
	return room, exists
}
