package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iiy/api-gateway/pkg/logger"
)

func Logger(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Infow("request",
			"status", statusCode,
			"method", method,
			"path", path,
			"ip", clientIP,
			"latency", latency,
		)
	}
}
