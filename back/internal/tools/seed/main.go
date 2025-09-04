package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/subosito/gotenv"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

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

    type jsonSeed struct {
        Teams []struct {
            Name      string `json:"name"`
            ShortCode string `json:"short_code"`
        } `json:"teams"`
        Stadiums []struct {
            Name    string   `json:"name"`
            City    string   `json:"city"`
            Aliases []string `json:"aliases"`
        } `json:"stadiums"`
        TeamAliases []struct {
            TeamShortCode string `json:"team_short_code"`
            Alias         string `json:"alias"`
        } `json:"team_aliases"`
    }

    seedPath := "internal/tools/seed/kbo_seed.json"
    if b, err := os.ReadFile(seedPath); err == nil {
        var s jsonSeed
        if err := json.Unmarshal(b, &s); err != nil {
            panic(fmt.Errorf("seed json parse error: %w", err))
        }

        // Replace data transactionally
        if err := gormDB.Transaction(func(tx *gorm.DB) error {
            // Truncate order: aliases -> stadiums -> teams (aliases depends on teams)
            if err := tx.Exec("TRUNCATE TABLE team_aliases RESTART IDENTITY CASCADE").Error; err != nil { return err }
            if err := tx.Exec("TRUNCATE TABLE stadiums RESTART IDENTITY CASCADE").Error; err != nil { return err }
            // teams referenced by other tables; safe because CASCADE above handles dependent rows
            if err := tx.Exec("TRUNCATE TABLE teams RESTART IDENTITY CASCADE").Error; err != nil { return err }

            // Insert teams
            if len(s.Teams) > 0 {
                toCreate := make([]meta.Team, 0, len(s.Teams))
                for _, t := range s.Teams {
                    if t.Name == "" || t.ShortCode == "" { continue }
                    toCreate = append(toCreate, meta.Team{Name: t.Name, ShortCode: t.ShortCode})
                }
                if len(toCreate) > 0 {
                    if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&toCreate).Error; err != nil {
                        return err
                    }
                }
            }

            // Insert stadiums
            if len(s.Stadiums) > 0 {
                toCreate := make([]meta.Stadium, 0, len(s.Stadiums))
                for _, st := range s.Stadiums {
                    if st.Name == "" { continue }
                    aliasBytes, _ := json.Marshal(st.Aliases)
                    toCreate = append(toCreate, meta.Stadium{Name: st.Name, City: st.City, AliasJSON: aliasBytes})
                }
                if len(toCreate) > 0 {
                    if err := tx.Create(&toCreate).Error; err != nil { return err }
                }
            }

            // Insert team_aliases
            if len(s.TeamAliases) > 0 {
                var teams []meta.Team
                if err := tx.Find(&teams).Error; err != nil { return err }
                scToID := map[string]int64{}
                for _, t := range teams { scToID[t.ShortCode] = t.ID }

                toCreate := make([]meta.TeamAlias, 0, len(s.TeamAliases))
                for _, a := range s.TeamAliases {
                    if a.Alias == "" { continue }
                    id := scToID[a.TeamShortCode]
                    if id == 0 { continue }
                    toCreate = append(toCreate, meta.TeamAlias{TeamID: id, Alias: a.Alias})
                }
                if len(toCreate) > 0 {
                    if err := tx.Create(&toCreate).Error; err != nil { return err }
                }
            }
            return nil
        }); err != nil {
            panic(err)
        }
    }

    // 샘플 게임 삽입은 스키마 변경 이후 제약과 충돌하므로 제거
}


