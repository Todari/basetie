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

// Stadium represents the stadiums master table.
// Table name is explicitly set to avoid any irregular pluralization.
type Stadium struct {
    ID        int64     `gorm:"primaryKey"`
    Name      string    `gorm:"not null;uniqueIndex"`
    City      string
    // AliasJSON stores an array of alias strings as JSONB
    AliasJSON []byte    `gorm:"type:jsonb;not null;default:'[]'"`
    CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (Stadium) TableName() string { return "stadiums" }

// TeamAlias maps various source aliases to a team id.
type TeamAlias struct {
    ID     int64  `gorm:"primaryKey"`
    TeamID int64  `gorm:"not null;index"`
    Alias  string `gorm:"not null;uniqueIndex"`
}

func (TeamAlias) TableName() string { return "team_aliases" }


