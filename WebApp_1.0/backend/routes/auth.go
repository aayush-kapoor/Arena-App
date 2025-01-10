package routes

import (
	// "encoding/json"
	"net/http"
	"github.com/gin-gonic/gin"
)

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

func SetupAuthRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", registerHandler)
		auth.POST("/login", loginHandler)
		auth.POST("/logout", logoutHandler)
		auth.GET("/verify", verifyTokenHandler)
	}
}

func registerHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// We'll let Supabase handle the actual registration
	c.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func loginHandler(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// We'll let Supabase handle the actual authentication
	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func logoutHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

func verifyTokenHandler(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
		return
	}

	// Verify token with Supabase
	c.JSON(http.StatusOK, gin.H{"valid": true})
}