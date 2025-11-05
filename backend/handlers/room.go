package handlers

import (
	"net/http"
	"tagmyhead/models"

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

// GET /api/room/:code
func GetRoom(c echo.Context) error {
	code := c.Param("code")
	room, exists := models.GetRoom(code)

	if !exists {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Room not found",
		})
	}

	return c.JSON(http.StatusOK, models.Room{
		Code: room.Code,
		Players: room.Players,
		Started: room.Started,
		Characters: room.Characters,
	})
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

	if room.Started {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Game already started",
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
