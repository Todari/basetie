package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/Todari/basetie/internal/repo"
)

type MetaHandler struct { repo *repo.MetaRepository }

func NewMetaHandler(r *repo.MetaRepository) *MetaHandler { return &MetaHandler{repo: r} }

func (h *MetaHandler) Teams(c *gin.Context) {
    teams, err := h.repo.ListTeams(c.Request.Context())
    if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": "failed"}); return }
    c.JSON(http.StatusOK, gin.H{"teams": teams})
}

func (h *MetaHandler) Games(c *gin.Context) {
    var teamIDPtr *int64
    if v := c.Query("team_id"); v != "" {
        var tid int64
        _, err := fmt.Sscanf(v, "%d", &tid)
        if err == nil { teamIDPtr = &tid }
    }
    var datePtr *time.Time
    if ds := c.Query("date"); ds != "" {
        if t, err := time.Parse("2006-01-02", ds); err == nil { datePtr = &t }
    }
    games, err := h.repo.ListGames(c.Request.Context(), teamIDPtr, datePtr)
    if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": "failed"}); return }
    c.JSON(http.StatusOK, gin.H{"games": games})
}


