CREATE TABLE IF NOT EXISTS kbo_games (
    id BIGSERIAL PRIMARY KEY,
    game_date DATE NOT NULL,
    game_id TEXT NOT NULL UNIQUE,
    home_team_name TEXT NOT NULL,
    away_team_name TEXT NOT NULL,
    start_time TIME,
    stadium TEXT,
    raw_html TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kbo_games_game_date ON kbo_games(game_date);


