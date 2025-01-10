package routes

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type Event struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Sport       Sport     `json:"sport"`
	Location    Location  `json:"location"`
	DateTime    string    `json:"datetime"`
	MaxPlayers  int       `json:"maxPlayers"`
	Players     []User    `json:"players"`
	Status      string    `json:"status"`
}

type Location struct {
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
	Address string  `json:"address"`
}

func SetupEventRoutes(router *gin.RouterGroup) {
	events := router.Group("/events")
	{
		events.GET("", listEventsHandler)
		events.POST("", createEventHandler)
		events.GET("/:id", getEventHandler)
		events.PUT("/:id", updateEventHandler)
		events.DELETE("/:id", deleteEventHandler)
		events.POST("/:id/join", joinEventHandler)
		events.POST("/:id/leave", leaveEventHandler)
	}
}

func listEventsHandler(c *gin.Context) {
	// Query events from Supabase
	events := []Event{} // This will be populated from Supabase
	c.JSON(http.StatusOK, events)
}

func createEventHandler(c *gin.Context) {
	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create event in Supabase
	c.JSON(http.StatusCreated, event)
}

func getEventHandler(c *gin.Context) {
	id := c.Param("id")
	// Get event from Supabase
	event := Event{ID: id}
	c.JSON(http.StatusOK, event)
}

func updateEventHandler(c *gin.Context) {
	id := c.Param("id")
	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update event in Supabase
	event.ID = id
	c.JSON(http.StatusOK, event)
}

func deleteEventHandler(c *gin.Context) {
	id := c.Param("id")
	_ = id
	// Delete event from Supabase
	c.JSON(http.StatusOK, gin.H{"message": "Event deleted"})
}

func joinEventHandler(c *gin.Context) {
	id := c.Param("id")
	_ = id
	// Add user to event in Supabase
	c.JSON(http.StatusOK, gin.H{"message": "Joined event"})
}

func leaveEventHandler(c *gin.Context) {
	id := c.Param("id")
	_ = id
	// Remove user from event in Supabase
	c.JSON(http.StatusOK, gin.H{"message": "Left event"})
}