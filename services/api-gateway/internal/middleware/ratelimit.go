package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iiy/api-gateway/internal/config"
	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var visitors = make(map[string]*visitor)
var mu sync.Mutex

func RateLimiter(cfg *config.Config) gin.HandlerFunc {
	requests, _ := strconv.Atoi(cfg.RateLimitRequests)
	window, _ := strconv.Atoi(cfg.RateLimitWindow)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		v, exists := visitors[ip]
		if !exists {
			limiter := rate.NewLimiter(rate.Limit(requests)/rate.Limit(window), requests)
			visitors[ip] = &visitor{limiter, time.Now()}
			v = visitors[ip]
		}
		v.lastSeen = time.Now()
		mu.Unlock()

		if !v.limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Too many requests",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func cleanupVisitors() {
	for {
		time.Sleep(time.Minute)

		mu.Lock()
		for ip, v := range visitors {
			if time.Since(v.lastSeen) > 3*time.Minute {
				delete(visitors, ip)
			}
		}
		mu.Unlock()
	}
}

func init() {
	go cleanupVisitors()
}
