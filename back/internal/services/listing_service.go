package services

import (
	"context"
	"time"

	"github.com/Todari/basetie/internal/config"
	"github.com/Todari/basetie/internal/domain/listings"
	"github.com/Todari/basetie/internal/repo"
)

type ListingService struct {
    cfg  *config.Config
    repo *repo.ListingRepository
}

func NewListingService(cfg *config.Config, r *repo.ListingRepository) *ListingService {
    return &ListingService{cfg: cfg, repo: r}
}

func (s *ListingService) Create(ctx context.Context, l *listings.Listing) error {
    // monthly limit check
    now := time.Now()
    monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
    monthEnd := monthStart.AddDate(0, 1, 0)
    cnt, err := s.repo.CountSellerListingsInMonth(ctx, l.SellerID, monthStart, monthEnd)
    if err != nil { return err }
    if int(cnt) >= s.cfg.MonthlyListingLimit {
        return ErrMonthlyLimitReached
    }
    l.Status = listings.ListingStatusListed
    return s.repo.Create(ctx, l)
}

var ErrMonthlyLimitReached = repo.ErrMonthlyLimitReached


