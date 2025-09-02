package users

import "time"

type User struct {
    ID           int64     `gorm:"primaryKey"`
    Email        string    `gorm:"uniqueIndex;not null"`
    PasswordHash string    `gorm:"not null"`
    Phone        *string
    Status       string    `gorm:"not null;default:active"`
    CreatedAt    time.Time `gorm:"autoCreateTime"`
}

type Profile struct {
    UserID         int64   `gorm:"primaryKey"`
    Nickname       *string
    FavoriteTeamID *int64
    Bio            *string
    RatingAvg      float64 `gorm:"type:numeric(3,2);default:0"`
    RatingsCount   int     `gorm:"default:0"`
}


