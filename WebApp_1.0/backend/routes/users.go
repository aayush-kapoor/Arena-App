package routes

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type User struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Email       string          `json:"email"`
	Avatar      string          `json:"avatar"`
	Location    Location        `json:"location"`
	Sports      []Sport         `json:"sports"`
	SkillLevels map[string]string `json:"skillLevels"`
}

type Sport struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func SetupUserRoutes(router *gin.RouterGroup) {
	users := router.Group("/users")
	{
		users.GET("/me", getCurrentUserHandler)
		users.PUT("/me", updateProfileHandler)
		users.GET("/:id", getUserProfileHandler)
		users.GET("/nearby", getNearbyUsersHandler)
	}
}

func getCurrentUserHandler(c *gin.Context) {
	// Get user from Supabase using JWT
	user := User{}
	c.JSON(http.StatusOK, user)
}

func updateProfileHandler(c *gin.Context) {
	var profile User
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update profile in Supabase
	c.JSON(http.StatusOK, profile)
}

func getUserProfileHandler(c *gin.Context) {
	id := c.Param("id")
	// Get user profile from Supabase
	user := User{ID: id}
	c.JSON(http.StatusOK, user)
}

func getNearbyUsersHandler(c *gin.Context) {
	lat := c.Query("lat")
	lng := c.Query("lng")
	// Get nearby users from Supabase using PostGIS
	_ = lat
	_ = lng
	users := []User{}
	c.JSON(http.StatusOK, users)
}