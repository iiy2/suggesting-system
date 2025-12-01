package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"service": "recommendation-engine",
		})
	})

	// Get recommendations for a user
	router.GET("/api/recommendations/:userId", func(c *gin.Context) {
		userId := c.Param("userId")
		
		// TODO: Implement actual recommendation logic
		c.JSON(http.StatusOK, gin.H{
			"userId": userId,
			"recommendations": []interface{}{},
			"message": "Recommendation engine is running but not yet fully implemented",
		})
	})

	// Record user interaction
	router.POST("/api/recommendations/interactions", func(c *gin.Context) {
		var interaction map[string]interface{}
		if err := c.BindJSON(&interaction); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// TODO: Implement interaction recording logic
		c.JSON(http.StatusCreated, gin.H{
			"message": "Interaction recorded",
			"data": interaction,
		})
	})

	log.Printf("Recommendation Engine starting on port %s", port)
	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
