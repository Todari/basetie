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

func (h *AuthHandler) OAuthGoogleURL(c *gin.Context) {
    // Google OAuth URL 생성
    googleURL := "https://accounts.google.com/oauth/authorize?" +
        "client_id=" + h.oauth.GetGoogleClientID() +
        "&redirect_uri=" + h.oauth.GetRedirectURI() +
        "&response_type=code" +
        "&scope=openid%20email%20profile" +
        "&access_type=offline"
    
    c.JSON(http.StatusOK, gin.H{"auth_url": googleURL})
}

func (h *AuthHandler) OAuthGoogleCallback(c *gin.Context) {
    code := c.Query("code")
    if code == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "authorization code is required"})
        return
    }
    
    tokens, user, err := h.oauth.HandleGoogleCallback(c.Request.Context(), code)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "access": tokens.AccessToken,
        "refresh": tokens.RefreshToken,
        "user_id": user.ID,
        "success": true,
    })
}

func (h *AuthHandler) OAuthApple(c *gin.Context) {
    var req dtos.OAuthRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    tokens, user, err := h.oauth.LoginWithIDToken(c.Request.Context(), services.OAuthLoginInput{Provider: "apple", IDToken: req.IDToken})
    if err != nil { c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()}); return }
    c.JSON(http.StatusOK, gin.H{"access": tokens.AccessToken, "refresh": tokens.RefreshToken, "user_id": user.ID})
}

func (h *AuthHandler) OAuthKakao(c *gin.Context) {
    var req dtos.OAuthRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    tokens, user, err := h.oauth.LoginWithIDToken(c.Request.Context(), services.OAuthLoginInput{Provider: "kakao", IDToken: req.IDToken})
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


