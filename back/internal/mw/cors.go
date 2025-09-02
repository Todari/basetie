package mw

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORS enables simple CORS for development (Expo/localhost).
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.GetHeader("Origin")
        if origin == "" {
            origin = "*"
        }
        c.Header("Access-Control-Allow-Origin", origin)
        c.Header("Vary", "Origin")
        c.Header("Access-Control-Allow-Credentials", "true")
        c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        if c.Request.Method == http.MethodOptions {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    }
}


