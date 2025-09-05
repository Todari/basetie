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
    
    // 사용자 기본 정보 조회
    user, err := h.repo.GetByID(c.Request.Context(), uid)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }
    
    // 프로필 정보 조회 (없으면 기본값)
    profile, err := h.repo.GetProfile(c.Request.Context(), uid)
    if err != nil {
        // 프로필이 없으면 기본 프로필 생성
        profile = &users.Profile{
            UserID:         uid,
            Nickname:       nil,
            FavoriteTeamID: nil,
            Bio:            nil,
            RatingAvg:      0,
            RatingsCount:   0,
        }
    }
    
    c.JSON(http.StatusOK, gin.H{
        "id": user.ID,
        "email": user.Email,
        "phone": user.Phone,
        "status": user.Status,
        "created_at": user.CreatedAt,
        "updated_at": user.UpdatedAt,
        "nickname": profile.Nickname,
        "favorite_team_id": profile.FavoriteTeamID,
        "bio": profile.Bio,
        "rating_avg": profile.RatingAvg,
        "ratings_count": profile.RatingsCount,
    })
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


