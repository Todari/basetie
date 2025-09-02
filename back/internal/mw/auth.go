package mw

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/Todari/basetie/internal/config"
)

func RequireAuth(cfg *config.Config) gin.HandlerFunc {
    return func(c *gin.Context) {
        authz := c.GetHeader("Authorization")
        if authz == "" || !strings.HasPrefix(authz, "Bearer ") {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer"}); return
        }
        tokenStr := strings.TrimPrefix(authz, "Bearer ")
        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) { return []byte(cfg.JWTSecret), nil })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"}); return
        }
        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok || claims["type"] != "access" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token type"}); return
        }
        c.Set("user_id", int64(claims["sub"].(float64)))
        c.Next()
    }
}


