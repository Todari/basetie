-- Enhance kbo_games and games with status/stadium/source id
ALTER TABLE kbo_games ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE kbo_games ADD COLUMN IF NOT EXISTS stadium_name TEXT;

ALTER TABLE games ADD COLUMN IF NOT EXISTS game_source_id TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'scheduled';
ALTER TABLE games ADD COLUMN IF NOT EXISTS stadium_id BIGINT REFERENCES stadiums(id);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'uq_games_game_source_id'
    ) THEN
        CREATE UNIQUE INDEX uq_games_game_source_id ON games(game_source_id);
    END IF;
END $$;


