package models

import (
	"log"
	"time"
)

// Close закрывает комнату и все её ресурсы
func (r *Room) Close() {
	// Закрываем все соединения
	r.connMu.Lock()
	for _, pc := range r.Connections {
		close(pc.send)
	}
	r.Connections = make(map[string]*PlayerConnection)
	r.connMu.Unlock()
	
	close(r.snapshotRequests)
}

// CleanupOldRooms очищает старые комнаты
func CleanupOldRooms() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		mu.Lock()
		now := time.Now()
		for code, room := range rooms {
			if now.Sub(room.CreatedAt) > 2*time.Hour {
				log.Printf("Cleaning up room %s", code)
				
				// Закрываем комнату (все соединения и каналы)
				room.Close()
				
				// Удаляем из глобального хранилища
				delete(rooms, code)
			}
		}
		mu.Unlock()
	}
}

// DeleteRoom удаляет комнату (можно вызывать вручную)
func DeleteRoom(code string) bool {
	mu.Lock()
	defer mu.Unlock()
	
	room, exists := rooms[code]
	if !exists {
		return false
	}
	
	room.Close()
	delete(rooms, code)
	return true
}
