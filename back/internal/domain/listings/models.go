package listings

import "time"

type Status string

const (
    ListingStatusListed    Status = "listed"
    ListingStatusReserved  Status = "reserved"
    ListingStatusCompleted Status = "completed"
    ListingStatusCanceled  Status = "canceled"
)

type Listing struct {
    ID        int64     `gorm:"primaryKey"`
    SellerID  int64     `gorm:"not null"`
    GameID    int64     `gorm:"not null"`
    TeamID    int64     `gorm:"not null"`
    Section   string    `gorm:"not null"`
    Row       string    `gorm:"not null"`
    SeatLabel string    `gorm:"not null"`
    Price     float64   `gorm:"type:numeric(12,2);not null"`
    Note      *string
    Status    Status    `gorm:"not null;default:listed"`
    CreatedAt time.Time `gorm:"autoCreateTime"`
    UpdatedAt time.Time `gorm:"autoUpdateTime"`
}


