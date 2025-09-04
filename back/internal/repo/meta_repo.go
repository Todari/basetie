package repo

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/Todari/basetie/internal/domain/meta"
)

type MetaRepository struct { db *gorm.DB }

func NewMetaRepository(db *gorm.DB) *MetaRepository { return &MetaRepository{db: db} }

func (r *MetaRepository) ListTeams(ctx context.Context) ([]meta.Team, error) {
    var teams []meta.Team
    err := r.db.WithContext(ctx).Order("id").Find(&teams).Error
    return teams, err
}

func (r *MetaRepository) ListGames(ctx context.Context, teamID *int64, date *time.Time) ([]meta.Game, error) {
    q := r.db.WithContext(ctx).Model(&meta.Game{})
    if teamID != nil {
        q = q.Where("home_team_id = ? OR away_team_id = ?", *teamID, *teamID)
    }
    if date != nil {
        // prefer game_date if present; fall back to start_time day range
        start := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
        q = q.Where("game_date = ?", start)
    }
    var games []meta.Game
    err := q.Order("game_date asc, id asc").Find(&games).Error
    return games, err
}

// GameRow is an enriched projection for API consumers
type GameRow struct {
    ID             int64     `gorm:"column:id" json:"id"`
    GameDate       time.Time `gorm:"column:game_date" json:"game_date"`
    StartTimeLocal *string   `gorm:"column:start_time_local" json:"start_time_local"`
    Stadium        string    `gorm:"column:stadium" json:"stadium"`
    HomeTeamID     int64     `gorm:"column:home_team_id" json:"home_team_id"`
    AwayTeamID     int64     `gorm:"column:away_team_id" json:"away_team_id"`
    HomeTeamName   string    `gorm:"column:home_team_name" json:"home_team_name"`
    AwayTeamName   string    `gorm:"column:away_team_name" json:"away_team_name"`
}

func (r *MetaRepository) ListGamesEnriched(ctx context.Context, teamID *int64, date *time.Time) ([]GameRow, error) {
    sql := `
        SELECT g.id,
               g.game_date,
               COALESCE(to_char(g.start_time_local, 'HH24:MI:SS'), to_char(g.start_time, 'HH24:MI:SS')) AS start_time_local,
               g.stadium,
               g.home_team_id,
               g.away_team_id,
               th.name AS home_team_name,
               ta.name AS away_team_name
        FROM games g
        JOIN teams th ON th.id = g.home_team_id
        JOIN teams ta ON ta.id = g.away_team_id
        WHERE 1=1`
    args := []any{}
    if teamID != nil {
        sql += " AND (g.home_team_id = ? OR g.away_team_id = ?)"
        args = append(args, *teamID, *teamID)
    }
    if date != nil {
        d := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
        sql += " AND g.game_date = ?"
        args = append(args, d)
    }
    sql += " ORDER BY g.game_date ASC, start_time_local ASC, g.id ASC"
    var rows []GameRow
    if err := r.db.WithContext(ctx).Raw(sql, args...).Scan(&rows).Error; err != nil { return nil, err }
    return rows, nil
}


