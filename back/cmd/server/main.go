package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/subosito/gotenv"

	"github.com/Todari/basetie/internal/config"
	"github.com/Todari/basetie/internal/db"
	"github.com/Todari/basetie/internal/http/handlers"
	"github.com/Todari/basetie/internal/logger"
	"github.com/Todari/basetie/internal/mw"
	"github.com/Todari/basetie/internal/repo"
	"github.com/Todari/basetie/internal/services"
)

func main() {
    _ = gotenv.Load()

    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("config load error: %v", err)
    }

    logg, err := logger.New()
    if err != nil {
        log.Fatalf("logger init error: %v", err)
    }
    defer logg.Sync()

    gormDB, sqlDB, err := db.Connect(cfg.DatabaseURL)
    if err != nil {
        logg.Fatal("db connect failed", logger.Error(err))
    }
    defer sqlDB.Close()

    router := gin.New()
    router.Use(gin.Recovery())
    router.Use(mw.CORS())

    healthHandler := handlers.NewHealthHandler(sqlDB)
    router.GET("/healthz", healthHandler.Healthz)
    router.GET("/readyz", healthHandler.Readyz)

    userRepo := repo.NewUserRepository(gormDB)
    authSvc := services.NewAuthService(cfg, userRepo)
    oauthSvc := services.NewOAuthService(cfg, userRepo)
    authHandler := handlers.NewAuthHandler(oauthSvc, authSvc)
    profileHandler := handlers.NewProfileHandler(userRepo)
    metaRepo := repo.NewMetaRepository(gormDB)
    metaHandler := handlers.NewMetaHandler(metaRepo)

    v1 := router.Group("/v1")
    {
        v1.POST("/auth/oauth/google", authHandler.OAuthGoogle)
        v1.POST("/auth/oauth/apple", authHandler.OAuthApple)
        v1.POST("/auth/refresh", authHandler.Refresh)

        v1.GET("/me", mw.RequireAuth(cfg), profileHandler.Me)
        v1.PATCH("/profile", mw.RequireAuth(cfg), profileHandler.Patch)
        v1.POST("/profile/phone", mw.RequireAuth(cfg), profileHandler.SetPhone)

        v1.GET("/teams", metaHandler.Teams)
        v1.GET("/games", metaHandler.Games)
    }

    srv := &http.Server{
        Addr:              ":" + cfg.Port,
        Handler:           router,
        ReadHeaderTimeout: 10 * time.Second,
        ReadTimeout:       30 * time.Second,
        WriteTimeout:      30 * time.Second,
        IdleTimeout:       60 * time.Second,
    }

    go func() {
        logg.Info("server starting", logger.String("addr", srv.Addr))
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logg.Fatal("server failed", logger.Error(err))
        }
    }()

    // graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        logg.Error("server shutdown error", logger.Error(err))
    }

    _ = gormDB // keep reference for future use
}


