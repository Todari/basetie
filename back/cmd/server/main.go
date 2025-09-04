package main

import (
	"context"
	"encoding/json"
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
	"gorm.io/gorm"
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

    // Seed on boot (teams, stadiums, aliases) if enabled and empty
    if cfg.SeedOnBoot {
        if err := seedMetaIfEmpty(gormDB); err != nil {
            logg.Error("seed on boot failed", logger.Error(err))
        }
    }

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
    listingRepo := repo.NewListingRepository(gormDB)
    listingSvc := services.NewListingService(cfg, listingRepo)
    listingHandler := handlers.NewListingsHandler(listingRepo, listingSvc)

    kboSync := services.NewKBOSyncService(gormDB)
    kboETL := services.NewKBOETLService(gormDB)
    adminKBO := handlers.NewAdminKBOHandler(kboSync, kboETL)

    if cfg.KBOSyncEnabled {
        go func() {
            ticker := time.NewTicker(time.Duration(cfg.KBOSyncEveryHours) * time.Hour)
            defer ticker.Stop()
            season := cfg.KBOSyncSeason
            for {
                // 기본: 현재 월, 옵션: months ahead 반복
                now := time.Now()
                months := 1
                if cfg.KBOSyncMonthsAhead > 0 { months += cfg.KBOSyncMonthsAhead }
                for i := 0; i < months; i++ {
                    dt := now.AddDate(0, i, 0)
                    month := dt.Format("01")
                    if season == "" { season = dt.Format("2006") }
                    _ = kboSync.SyncMonth(context.Background(), season, month)
                    _ = kboETL.ETLMonth(context.Background(), dt.Year(), int(dt.Month()))
                }
                <-ticker.C
            }
        }()
    }

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

        v1.POST("/listings", mw.RequireAuth(cfg), listingHandler.Create)
        v1.GET("/listings", listingHandler.List)
        v1.GET("/listings/:id", listingHandler.Get)
        v1.PATCH("/listings/:id/cancel", mw.RequireAuth(cfg), listingHandler.Cancel)
        v1.GET("/my/listings", mw.RequireAuth(cfg), listingHandler.MyListings)

        admin := v1.Group("/admin")
        {
            admin.POST("/kbo/sync", adminKBO.Sync)
            admin.POST("/kbo/etl", adminKBO.ETL)
        }
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

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        logg.Error("server shutdown error", logger.Error(err))
    }

    _ = gormDB
}

// seedMetaIfEmpty seeds teams, stadiums and team_aliases when empty, using bundled JSON
func seedMetaIfEmpty(gormDB *gorm.DB) error {
    type jsonSeed struct {
        Teams []struct{ Name string `json:"name"`; ShortCode string `json:"short_code"` } `json:"teams"`
        Stadiums []struct{ Name string `json:"name"`; City string `json:"city"`; Aliases []string `json:"aliases"` } `json:"stadiums"`
        TeamAliases []struct{ TeamShortCode string `json:"team_short_code"`; Alias string `json:"alias"` } `json:"team_aliases"`
    }
    // Always attempt idempotent upsert on boot (ON CONFLICT DO NOTHING)
    // read bundled seed
    var b []byte
    // Prefer docker image path
    if data, e := os.ReadFile("/app/seed/kbo_seed.json"); e == nil {
        b = data
    } else if data, e2 := os.ReadFile("internal/tools/seed/kbo_seed.json"); e2 == nil {
        b = data
    } else {
        return e
    }
    var s jsonSeed
    if err := json.Unmarshal(b, &s); err != nil { return err }
    return gormDB.Transaction(func(tx *gorm.DB) error {
        // create teams
        for _, t := range s.Teams {
            if t.Name == "" || t.ShortCode == "" { continue }
            if err := tx.Exec("INSERT INTO teams(name, short_code) VALUES(?,?) ON CONFLICT DO NOTHING", t.Name, t.ShortCode).Error; err != nil { return err }
        }
        // create stadiums
        for _, st := range s.Stadiums {
            if st.Name == "" { continue }
            aliases, _ := json.Marshal(st.Aliases)
            if err := tx.Exec("INSERT INTO stadiums(name, city, alias_json) VALUES(?,?,?) ON CONFLICT DO NOTHING", st.Name, st.City, aliases).Error; err != nil { return err }
        }
        // create team_aliases
        type team struct{ ID int64; ShortCode string }
        var list []team
        if err := tx.Raw("SELECT id, short_code FROM teams").Scan(&list).Error; err != nil { return err }
        scToID := map[string]int64{}
        for _, t := range list { scToID[t.ShortCode] = t.ID }
        for _, a := range s.TeamAliases {
            id := scToID[a.TeamShortCode]
            if id == 0 || a.Alias == "" { continue }
            if err := tx.Exec("INSERT INTO team_aliases(team_id, alias) VALUES(?,?) ON CONFLICT DO NOTHING", id, a.Alias).Error; err != nil { return err }
        }
        return nil
    })
}


