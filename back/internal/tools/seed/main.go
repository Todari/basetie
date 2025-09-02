package main

import (
	"time"

	"github.com/subosito/gotenv"

	"github.com/Todari/basetie/internal/config"
	"github.com/Todari/basetie/internal/db"
	"github.com/Todari/basetie/internal/domain/meta"
)

func main() {
    _ = gotenv.Load()
    cfg, err := config.Load()
    if err != nil { panic(err) }
    gormDB, sqlDB, err := db.Connect(cfg.DatabaseURL)
    if err != nil { panic(err) }
    defer sqlDB.Close()

    // Teams
    var count int64
    if err := gormDB.Model(&meta.Team{}).Count(&count).Error; err != nil { panic(err) }
    if count == 0 {
        teams := []meta.Team{
            {Name: "Doosan Bears", ShortCode: "DOO"},
            {Name: "LG Twins", ShortCode: "LGT"},
            {Name: "Samsung Lions", ShortCode: "SAM"},
            {Name: "KIA Tigers", ShortCode: "KIA"},
        }
        if err := gormDB.Create(&teams).Error; err != nil { panic(err) }
    }

    // Games (sample next 2 fixtures)
    if err := gormDB.Model(&meta.Game{}).Count(&count).Error; err != nil { panic(err) }
    if count == 0 {
        now := time.Now()
        g := []meta.Game{
            {HomeTeamID: 1, AwayTeamID: 2, StartTime: now.Add(24 * time.Hour), Stadium: "Jamsil"},
            {HomeTeamID: 3, AwayTeamID: 4, StartTime: now.Add(48 * time.Hour), Stadium: "Daegu"},
        }
        if err := gormDB.Create(&g).Error; err != nil { panic(err) }
    }
}


