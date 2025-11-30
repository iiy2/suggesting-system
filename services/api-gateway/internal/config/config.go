package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                      string
	Environment               string
	JWTSecret                 string
	UserServiceURL            string
	ContentServiceURL         string
	RecommendationServiceURL  string
	RedisURL                  string
	RateLimitRequests         string
	RateLimitWindow           string
}

func LoadConfig() *Config {
	// Load .env file if it exists
	godotenv.Load()

	return &Config{
		Port:                     getEnv("PORT", "8080"),
		Environment:              getEnv("GO_ENV", "development"),
		JWTSecret:                getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		UserServiceURL:           getEnv("USER_SERVICE_URL", "http://user-service:3001"),
		ContentServiceURL:        getEnv("CONTENT_SERVICE_URL", "http://content-service:3002"),
		RecommendationServiceURL: getEnv("RECOMMENDATION_SERVICE_URL", "http://recommendation-engine:8081"),
		RedisURL:                 getEnv("REDIS_URL", "redis://redis:6379"),
		RateLimitRequests:        getEnv("RATE_LIMIT_REQUESTS", "100"),
		RateLimitWindow:          getEnv("RATE_LIMIT_WINDOW", "60"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
