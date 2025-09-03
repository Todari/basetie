package config

import (
	"fmt"
	"os"
)

type Config struct {
    Port        string
    DatabaseURL string
    JWTSecret   string
    AccessTokenTTLMinutes  int
    RefreshTokenTTLMinutes int
    GoogleClientID string
    AppleBundleID  string
    MonthlyListingLimit int
    KBOSyncEnabled bool
    KBOSyncEveryHours int
    KBOSyncSeason string
    KBOSyncMonthsAhead int
}

func Load() (*Config, error) {
    cfg := &Config{
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: os.Getenv("DATABASE_URL"),
        JWTSecret:   os.Getenv("JWT_SECRET"),
        AccessTokenTTLMinutes:  getEnvInt("ACCESS_TOKEN_TTL_MINUTES", 15),
        RefreshTokenTTLMinutes: getEnvInt("REFRESH_TOKEN_TTL_MINUTES", 43200), // 30 days
        GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
        AppleBundleID:  os.Getenv("APPLE_BUNDLE_ID"),
        MonthlyListingLimit: getEnvInt("MONTHLY_LISTING_LIMIT", 8),
        KBOSyncEnabled: getEnvBool("KBO_SYNC_ENABLED", false),
        KBOSyncEveryHours: getEnvInt("KBO_SYNC_EVERY_HOURS", 12),
        KBOSyncSeason: os.Getenv("KBO_SYNC_SEASON"),
        KBOSyncMonthsAhead: getEnvInt("KBO_SYNC_MONTHS_AHEAD", 0),
    }
    if cfg.DatabaseURL == "" {
        return nil, fmt.Errorf("DATABASE_URL is required")
    }
    if cfg.JWTSecret == "" {
        return nil, fmt.Errorf("JWT_SECRET is required")
    }
    return cfg, nil
}

func getEnv(key, def string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return def
}

func getEnvInt(key string, def int) int {
    if v := os.Getenv(key); v != "" {
        var n int
        _, err := fmt.Sscanf(v, "%d", &n)
        if err == nil {
            return n
        }
    }
    return def
}

func getEnvBool(key string, def bool) bool {
    if v := os.Getenv(key); v != "" {
        if v == "1" || v == "true" || v == "TRUE" || v == "yes" { return true }
        if v == "0" || v == "false" || v == "FALSE" || v == "no" { return false }
    }
    return def
}


