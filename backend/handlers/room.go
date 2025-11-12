package handlers

import (
	"net/http"
	"tagmyhead/models"
	"time"

	"github.com/labstack/echo/v4"
)

type CreateRoomResponse struct {
	Code string `json:"code"`
}

// POST /api/room/create
func CreateRoom(c echo.Context) error {
	room := models.CreateRoom()
	return c.JSON(http.StatusCreated, CreateRoomResponse{
		Code: room.Code,
	})
}

type RoomResponse struct {
	Code       string                 `json:"code"`
	Players    []models.Player         `json:"players"`
	Started    bool                   `json:"started"`
	Characters map[string]string      `json:"characters"`
	Messages   []interface{}          `json:"messages"`
}

// GET /api/room/:code
func GetRoom(c echo.Context) error {
	code := c.Param("code")
	query := c.QueryParams()
	playerId := query.Get("playerId")
	
	room, exists := models.GetRoom(code)
	if !exists {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Room not found",
		})
	}

	player := room.GetPlayer(playerId)
	if player == nil {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "Player not in room",
		})
	}

	snapshotChan := room.GetSnapshotForPlayer(playerId)

	ctx := c.Request().Context()
	
	select {
	case snapshot, ok := <-snapshotChan:
		if !ok {
			return c.JSON(http.StatusServiceUnavailable, map[string]string{
				"error": "Failed to get room snapshot",
			})
		}
		
		response := RoomResponse{
			Code:       snapshot.Code,
			Players:    snapshot.Players,
			Started:    snapshot.Started,
			Characters: snapshot.Characters,
			Messages:   snapshot.Messages,
		}
		return c.JSON(http.StatusOK, response)
		
	case <-ctx.Done():
		return c.JSON(http.StatusRequestTimeout, map[string]string{
			"error": "Request cancelled or timeout",
		})
		
	case <-time.After(5 * time.Second):
		return c.JSON(http.StatusRequestTimeout, map[string]string{
			"error": "Request timeout",
		})
	}
}


type JoinRoomRequest struct {
	Name string `json:"name"`
}

// POST /api/room/:code/join
func JoinRoom(c echo.Context) error {
	code := c.Param("code")
	room, exists := models.GetRoom(code)

	if !exists {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Room not found",
		})
	}

	var req JoinRoomRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request",
		})
	}

	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Name is required",
		})
	}

	player := room.AddPlayer(req.Name)

	if player == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "There is already a user named " + req.Name,
		})
	}

	return c.JSON(http.StatusOK, player)
}

// POST /api/room/:code/start
func StartGame(c echo.Context) error {
	code := c.Param("code")
	room, exists := models.GetRoom(code)

	if !exists {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Room not found",
		})
	}

	if room.Started {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Game already started",
		})
	}

	if len(room.Players) < 2 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Need at least 2 players",
		})
	}

	room.StartGame()
	return c.JSON(http.StatusOK, map[string]string{
		"status": "Game started",
	})
}

// GET /ping
func Ping(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "pong",
	})
}
