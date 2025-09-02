package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/Todari/basetie/internal/domain/listings"
	"github.com/Todari/basetie/internal/http/dtos"
	"github.com/Todari/basetie/internal/repo"
	"github.com/Todari/basetie/internal/services"
)

type ListingsHandler struct {
    repo *repo.ListingRepository
    svc  *services.ListingService
}

func NewListingsHandler(r *repo.ListingRepository, s *services.ListingService) *ListingsHandler {
    return &ListingsHandler{repo: r, svc: s}
}

func (h *ListingsHandler) Create(c *gin.Context) {
    uid := c.GetInt64("user_id")
    var req dtos.CreateListingRequest
    if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"}); return }
    l := &listings.Listing{
        SellerID:  uid,
        GameID:    req.GameID,
        TeamID:    req.TeamID,
        Section:   req.Section,
        Row:       req.Row,
        SeatLabel: req.SeatLabel,
        Price:     req.Price,
        Note:      req.Note,
    }
    if err := h.svc.Create(c.Request.Context(), l); err != nil {
        if err == services.ErrMonthlyLimitReached { c.JSON(http.StatusForbidden, gin.H{"error": "monthly limit"}); return }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed"}); return
    }
    c.JSON(http.StatusOK, gin.H{"listing": l})
}

func (h *ListingsHandler) Get(c *gin.Context) {
    var id int64
    if _, err := fmt.Sscanf(c.Param("id"), "%d", &id); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "bad id"}); return }
    l, err := h.repo.GetByID(c.Request.Context(), id)
    if err != nil { c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return }
    c.JSON(http.StatusOK, gin.H{"listing": l})
}

func (h *ListingsHandler) List(c *gin.Context) {
    var f repo.ListingFilter
    if v := c.Query("team_id"); v != "" { var n int64; if _, err := fmt.Sscanf(v, "%d", &n); err == nil { f.TeamID = &n } }
    if v := c.Query("game_id"); v != "" { var n int64; if _, err := fmt.Sscanf(v, "%d", &n); err == nil { f.GameID = &n } }
    if v := c.Query("seller_id"); v != "" { var n int64; if _, err := fmt.Sscanf(v, "%d", &n); err == nil { f.SellerID = &n } }
    if v := c.Query("status"); v != "" { s := listings.Status(v); f.Status = &s }
    if v := c.Query("date"); v != "" { if t, err := time.Parse("2006-01-02", v); err == nil { f.Date = &t } }
    rows, err := h.repo.List(c.Request.Context(), f, 50, 0)
    if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": "failed"}); return }
    c.JSON(http.StatusOK, gin.H{"listings": rows})
}

func (h *ListingsHandler) Cancel(c *gin.Context) {
    uid := c.GetInt64("user_id")
    var id int64
    if _, err := fmt.Sscanf(c.Param("id"), "%d", &id); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "bad id"}); return }
    l, err := h.repo.GetByID(c.Request.Context(), id)
    if err != nil || l.SellerID != uid { c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"}); return }
    if err := h.repo.UpdateStatus(c.Request.Context(), id, listings.ListingStatusCanceled); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": "failed"}); return }
    c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *ListingsHandler) MyListings(c *gin.Context) {
    uid := c.GetInt64("user_id")
    rows, err := h.repo.List(c.Request.Context(), repo.ListingFilter{SellerID: &uid}, 50, 0)
    if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": "failed"}); return }
    c.JSON(http.StatusOK, gin.H{"listings": rows})
}


