package db

import (
	"database/sql"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(databaseURL string) (*gorm.DB, *sql.DB, error) {
    gormDB, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
    if err != nil {
        return nil, nil, err
    }
    sqlDB, err := gormDB.DB()
    if err != nil {
        return nil, nil, err
    }
    if err := sqlDB.Ping(); err != nil {
        return nil, nil, err
    }
    return gormDB, sqlDB, nil
}


