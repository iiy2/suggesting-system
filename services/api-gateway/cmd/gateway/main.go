package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iiy/api-gateway/internal/config"
	"github.com/iiy/api-gateway/internal/handlers"
	"github.com/iiy/api-gateway/internal/middleware"
	"github.com/iiy/api-gateway/pkg/logger"
)

func main() {
	// Initialize logger
	log := logger.NewLogger()
	defer log.Sync()

	// Load configuration
	cfg := config.LoadConfig()

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.New()

	// Apply middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(log))
	router.Use(middleware.CORS())
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.RateLimiter(cfg))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "UP",
			"service":   "api-gateway",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// User service routes
		user := api.Group("/users")
		{
			user.POST("/register", handlers.ProxyToUserService(cfg, "/api/users/register"))
			user.POST("/login", handlers.ProxyToUserService(cfg, "/api/users/login"))

			// Protected routes
			authenticated := user.Group("")
			authenticated.Use(middleware.JWTAuth(cfg.JWTSecret))
			{
				authenticated.POST("/logout", handlers.ProxyToUserService(cfg, "/api/users/logout"))
				authenticated.GET("/profile", handlers.ProxyToUserService(cfg, "/api/users/profile"))
				authenticated.PUT("/profile", handlers.ProxyToUserService(cfg, "/api/users/profile"))
				authenticated.POST("/change-password", handlers.ProxyToUserService(cfg, "/api/users/change-password"))
			}
		}

		// Content service routes
		content := api.Group("/content")
		content.Use(middleware.JWTAuth(cfg.JWTSecret))
		{
			content.GET("", handlers.ProxyToContentService(cfg, "/api/content"))
			content.GET("/:id", handlers.ProxyToContentService(cfg, "/api/content/:id"))
			content.POST("", handlers.ProxyToContentService(cfg, "/api/content"))
			content.PUT("/:id", handlers.ProxyToContentService(cfg, "/api/content/:id"))
			content.DELETE("/:id", handlers.ProxyToContentService(cfg, "/api/content/:id"))
		}

		// Recommendation service routes
		recommendations := api.Group("/recommendations")
		recommendations.Use(middleware.JWTAuth(cfg.JWTSecret))
		{
			recommendations.GET("/:userId", handlers.ProxyToRecommendationService(cfg, "/api/recommendations/:userId"))
			recommendations.POST("/interactions", handlers.ProxyToRecommendationService(cfg, "/api/recommendations/interactions"))
		}
	}

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Resource not found",
		})
	})

	// Create HTTP server
	srv := &http.Server{
		Addr:           fmt.Sprintf(":%s", cfg.Port),
		Handler:        router,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Start server in goroutine
	go func() {
		log.Info(fmt.Sprintf("API Gateway starting on port %s", cfg.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(fmt.Sprintf("Failed to start server: %v", err))
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal(fmt.Sprintf("Server forced to shutdown: %v", err))
	}

	log.Info("Server stopped gracefully")
}
