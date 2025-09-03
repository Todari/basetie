package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/Todari/basetie/internal/services"
)

type AdminKBOHandler struct {
    sync *services.KBOSyncService
    etl  *services.KBOETLService
}

func NewAdminKBOHandler(sync *services.KBOSyncService, etl *services.KBOETLService) *AdminKBOHandler {
    return &AdminKBOHandler{sync: sync, etl: etl}
}

func (h *AdminKBOHandler) Sync(c *gin.Context) {
    season := c.Query("season")
    month := c.Query("month")
    if season == "" || month == "" { c.JSON(http.StatusBadRequest, gin.H{"error": "season, month required"}); return }
    if err := h.sync.SyncMonth(c.Request.Context(), season, month); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
    c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *AdminKBOHandler) ETL(c *gin.Context) {
    y, _ := strconv.Atoi(c.Query("year"))
    m, _ := strconv.Atoi(c.Query("month"))
    if y == 0 || m == 0 { c.JSON(http.StatusBadRequest, gin.H{"error": "year, month required"}); return }
    if err := h.etl.ETLMonth(c.Request.Context(), y, m); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
    c.JSON(http.StatusOK, gin.H{"ok": true})
}


