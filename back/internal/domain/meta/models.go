package meta

import "time"

type Team struct {
    ID        int64  `gorm:"primaryKey"`
    Name      string `gorm:"not null"`
    ShortCode string `gorm:"not null"`
}

type Game struct {
    ID         int64     `gorm:"primaryKey"`
    HomeTeamID int64     `gorm:"not null"`
    AwayTeamID int64     `gorm:"not null"`
    StartTime  time.Time `gorm:"not null"`
    Stadium    string    `gorm:"not null"`
    CreatedAt  time.Time `gorm:"autoCreateTime"`
}


