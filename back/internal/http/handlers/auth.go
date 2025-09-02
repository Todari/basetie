package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Todari/basetie/internal/http/dtos"
	"github.com/Todari/basetie/internal/services"
)

type AuthHandler struct {
    oauth *services.OAuthService
    auth  *services.AuthService
}

func NewAuthHandler(oauth *services.OAuthService, auth *services.AuthService) *AuthHandler {
    return &AuthHandler{oauth: oauth, auth: auth}
}

func (h *AuthHandler) OAuthGoogle(c *gin.Context) {
    var req dtos.OAuthRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    tokens, user, err := h.oauth.LoginWithIDToken(c.Request.Context(), services.OAuthLoginInput{Provider: "google", IDToken: req.IDToken})
    if err != nil { c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()}); return }
    c.JSON(http.StatusOK, gin.H{"access": tokens.AccessToken, "refresh": tokens.RefreshToken, "user_id": user.ID})
}

func (h *AuthHandler) OAuthApple(c *gin.Context) {
    var req dtos.OAuthRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    tokens, user, err := h.oauth.LoginWithIDToken(c.Request.Context(), services.OAuthLoginInput{Provider: "apple", IDToken: req.IDToken})
    if err != nil { c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()}); return }
    c.JSON(http.StatusOK, gin.H{"access": tokens.AccessToken, "refresh": tokens.RefreshToken, "user_id": user.ID})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
    var req dtos.RefreshRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    tokens, err := h.auth.Refresh(c.Request.Context(), req.Refresh)
    if err != nil { c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()}); return }
    c.JSON(http.StatusOK, gin.H{"access": tokens.AccessToken, "refresh": tokens.RefreshToken})
}


