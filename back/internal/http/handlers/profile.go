package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Todari/basetie/internal/domain/users"
	"github.com/Todari/basetie/internal/http/dtos"
	"github.com/Todari/basetie/internal/repo"
)

type ProfileHandler struct {
    repo *repo.UserRepository
}

func NewProfileHandler(repo *repo.UserRepository) *ProfileHandler { return &ProfileHandler{repo: repo} }

func (h *ProfileHandler) Me(c *gin.Context) {
    uid := c.GetInt64("user_id")
    u, err := h.repo.GetProfile(c.Request.Context(), uid)
    if err != nil { c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"}); return }
    c.JSON(http.StatusOK, gin.H{"user_id": uid, "profile": u})
}

func (h *ProfileHandler) Patch(c *gin.Context) {
    uid := c.GetInt64("user_id")
    var req dtos.ProfilePatch
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    p, err := h.repo.GetProfile(c.Request.Context(), uid)
    if err != nil { p = &users.Profile{UserID: uid} }
    if req.Nickname != nil { p.Nickname = req.Nickname }
    if req.FavoriteTeamID != nil { p.FavoriteTeamID = req.FavoriteTeamID }
    if req.Bio != nil { p.Bio = req.Bio }
    if err := h.repo.UpsertProfile(c.Request.Context(), p); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save"}); return }
    c.JSON(http.StatusOK, gin.H{"profile": p})
}

func (h *ProfileHandler) SetPhone(c *gin.Context) {
    uid := c.GetInt64("user_id")
    var req dtos.PhoneRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    if err := h.repo.SetUserPhone(c.Request.Context(), uid, req.Phone); err != nil { c.JSON(http.StatusConflict, gin.H{"error": "phone already used"}); return }
    c.JSON(http.StatusOK, gin.H{"ok": true})
}


