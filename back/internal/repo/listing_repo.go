package repo

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/Todari/basetie/internal/domain/listings"
)

type ListingRepository struct { db *gorm.DB }

func NewListingRepository(db *gorm.DB) *ListingRepository { return &ListingRepository{db: db} }

func (r *ListingRepository) Create(ctx context.Context, l *listings.Listing) error {
    return r.db.WithContext(ctx).Create(l).Error
}

func (r *ListingRepository) GetByID(ctx context.Context, id int64) (*listings.Listing, error) {
    var l listings.Listing
    if err := r.db.WithContext(ctx).First(&l, id).Error; err != nil { return nil, err }
    return &l, nil
}

type ListingFilter struct {
    TeamID   *int64
    GameID   *int64
    SellerID *int64
    Status   *listings.Status
    Date     *time.Time
}

func (r *ListingRepository) List(ctx context.Context, f ListingFilter, limit, offset int) ([]listings.Listing, error) {
    q := r.db.WithContext(ctx).Model(&listings.Listing{})
    if f.TeamID != nil { q = q.Where("team_id = ?", *f.TeamID) }
    if f.GameID != nil { q = q.Where("game_id = ?", *f.GameID) }
    if f.SellerID != nil { q = q.Where("seller_id = ?", *f.SellerID) }
    if f.Status != nil { q = q.Where("status = ?", *f.Status) }
    if f.Date != nil {
        start := time.Date(f.Date.Year(), f.Date.Month(), f.Date.Day(), 0, 0, 0, 0, f.Date.Location())
        end := start.Add(24 * time.Hour)
        // join with games to filter by start_time day
        q = q.Joins("JOIN games ON games.id = listings.game_id").Where("games.start_time >= ? AND games.start_time < ?", start, end)
    }
    var rows []listings.Listing
    if limit <= 0 { limit = 50 }
    err := q.Order("id desc").Limit(limit).Offset(offset).Find(&rows).Error
    return rows, err
}

func (r *ListingRepository) UpdateStatus(ctx context.Context, id int64, status listings.Status) error {
    return r.db.WithContext(ctx).Model(&listings.Listing{}).Where("id = ?", id).Update("status", status).Error
}

func (r *ListingRepository) CountSellerListingsInMonth(ctx context.Context, sellerID int64, monthStart time.Time, monthEnd time.Time) (int64, error) {
    var cnt int64
    err := r.db.WithContext(ctx).Model(&listings.Listing{}).
        Where("seller_id = ? AND created_at >= ? AND created_at < ?", sellerID, monthStart, monthEnd).
        Count(&cnt).Error
    return cnt, err
}


