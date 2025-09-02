package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
    sqlDB *sql.DB
}

func NewHealthHandler(sqlDB *sql.DB) *HealthHandler {
    return &HealthHandler{sqlDB: sqlDB}
}

func (h *HealthHandler) Healthz(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *HealthHandler) Readyz(c *gin.Context) {
    if err := h.sqlDB.Ping(); err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not_ready"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"status": "ready"})
}


