package handlers

import (
	"bytes"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/iiy/api-gateway/internal/config"
)

func ProxyToUserService(cfg *config.Config, path string) gin.HandlerFunc {
	return proxyRequest(cfg.UserServiceURL, path)
}

func ProxyToContentService(cfg *config.Config, path string) gin.HandlerFunc {
	return proxyRequest(cfg.ContentServiceURL, path)
}

func ProxyToRecommendationService(cfg *config.Config, path string) gin.HandlerFunc {
	return proxyRequest(cfg.RecommendationServiceURL, path)
}

func proxyRequest(targetURL, path string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Build target URL
		url := targetURL + replacePath(path, c)

		// Read request body
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// Create new request
		req, err := http.NewRequest(c.Request.Method, url, bytes.NewBuffer(bodyBytes))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to create request",
			})
			return
		}

		// Copy headers
		for key, values := range c.Request.Header {
			for _, value := range values {
				req.Header.Add(key, value)
			}
		}

		// Send request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{
				"success": false,
				"message": "Service unavailable",
			})
			return
		}
		defer resp.Body.Close()

		// Copy response headers
		for key, values := range resp.Header {
			for _, value := range values {
				c.Writer.Header().Add(key, value)
			}
		}

		// Copy response body
		c.Status(resp.StatusCode)
		io.Copy(c.Writer, resp.Body)
	}
}

func replacePath(path string, c *gin.Context) string {
	result := path
	for _, param := range c.Params {
		result = strings.Replace(result, ":"+param.Key, param.Value, 1)
	}
	if c.Request.URL.RawQuery != "" {
		result += "?" + c.Request.URL.RawQuery
	}
	return result
}
