-- Stadiums master
CREATE TABLE IF NOT EXISTS stadiums (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    city TEXT,
    alias_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team aliases for mapping source names to teams.id
CREATE TABLE IF NOT EXISTS team_aliases (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    alias TEXT NOT NULL UNIQUE
);

-- games table extension
ALTER TABLE games ADD COLUMN IF NOT EXISTS stadium_id BIGINT REFERENCES stadiums(id);

-- Unique constraint to prevent duplicates
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_games_unique_match'
    ) THEN
        ALTER TABLE games ADD CONSTRAINT uq_games_unique_match UNIQUE (home_team_id, away_team_id, start_time);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_games_start_time ON games(start_time);


