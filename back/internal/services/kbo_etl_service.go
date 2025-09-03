package services

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type KBOETLService struct {
    db *gorm.DB
}

func NewKBOETLService(db *gorm.DB) *KBOETLService { return &KBOETLService{db: db} }

// Map source team name to teams.id via team_aliases or teams.name
func (s *KBOETLService) mapTeamID(ctx context.Context, name string) (int64, error) {
    var id int64
    // team_aliases
    row := s.db.WithContext(ctx).Raw("SELECT team_id FROM team_aliases WHERE alias = ?", name).Row()
    if err := row.Scan(&id); err == nil && id != 0 { return id, nil }
    // teams.name
    row = s.db.WithContext(ctx).Raw("SELECT id FROM teams WHERE name = ?", name).Row()
    if err := row.Scan(&id); err == nil && id != 0 { return id, nil }
    return 0, fmt.Errorf("team not mapped: %s", name)
}

func (s *KBOETLService) ensureStadium(ctx context.Context, name string) (*int64, error) {
    if name == "" { return nil, nil }
    var id int64
    row := s.db.WithContext(ctx).Raw("SELECT id FROM stadiums WHERE name = ?", name).Row()
    if err := row.Scan(&id); err == nil && id != 0 { return &id, nil }
    // insert
    if err := s.db.WithContext(ctx).Exec("INSERT INTO stadiums(name) VALUES(?) ON CONFLICT (name) DO NOTHING", name).Error; err != nil { return nil, err }
    row = s.db.WithContext(ctx).Raw("SELECT id FROM stadiums WHERE name = ?", name).Row()
    if err := row.Scan(&id); err != nil { return nil, err }
    return &id, nil
}

// ETLMonth transforms kbo_games in given month into games
func (s *KBOETLService) ETLMonth(ctx context.Context, year int, month int) error {
    start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
    end := start.AddDate(0, 1, 0)
    type row struct{ GameDate time.Time; GameID string; HomeName string; AwayName string; Stadium *string }
    var rows []row
    if err := s.db.WithContext(ctx).Raw(
        `SELECT game_date, game_id, home_team_name, away_team_name, NULL::text as stadium FROM kbo_games WHERE game_date >= ? AND game_date < ?`, start, end,
    ).Scan(&rows).Error; err != nil { return err }
    for _, r := range rows {
        homeID, err := s.mapTeamID(ctx, r.HomeName)
        if err != nil { continue }
        awayID, err := s.mapTeamID(ctx, r.AwayName)
        if err != nil { continue }
        var stadiumID *int64
        if r.Stadium != nil { stadiumID, _ = s.ensureStadium(ctx, *r.Stadium) }
        startTime := time.Date(r.GameDate.Year(), r.GameDate.Month(), r.GameDate.Day(), 18, 30, 0, 0, time.UTC) // 기본 18:30 (실데이터 없을 때)
        if err := s.db.WithContext(ctx).Exec(
            `INSERT INTO games(home_team_id, away_team_id, start_time, stadium, created_at) 
             VALUES(?,?,?,?, NOW())
             ON CONFLICT (home_team_id, away_team_id, start_time) DO NOTHING`,
            homeID, awayID, startTime, "", // 기존 games에 stadium(text) 존재하므로 공란 유지
        ).Error; err != nil { return err }
        if stadiumID != nil {
            _ = s.db.WithContext(ctx).Exec(`UPDATE games SET stadium_id = ? WHERE home_team_id=? AND away_team_id=? AND start_time=?`, stadiumID, homeID, awayID, startTime).Error
        }
    }
    return nil
}


