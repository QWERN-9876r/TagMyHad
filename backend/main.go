package main

import (
	"tagmyhead/handlers"
	"tagmyhead/models"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Запуск очистки старых комнат
	go models.CleanupOldRooms()

	// Echo instance
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.GET("/ping", handlers.Ping)
	
	e.GET("/ws/:code/:playerId", handlers.WebSocketHandler)
	
	api := e.Group("/api")
	{
		room := api.Group("/room")
		{
			room.POST("/create", handlers.CreateRoom)
			room.GET("/:code", handlers.GetRoom)
			room.POST("/:code/join", handlers.JoinRoom)
			room.POST("/:code/start", handlers.StartGame)
		}
	}

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}
