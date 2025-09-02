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
        start := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
        end := start.Add(24 * time.Hour)
        q = q.Where("start_time >= ? AND start_time < ?", start, end)
    }
    var games []meta.Game
    err := q.Order("start_time asc").Find(&games).Error
    return games, err
}


