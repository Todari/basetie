-- Split games datetime into game_date (DATE) and start_time_local (TIME)
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_date DATE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS start_time_local TIME;

-- Backfill from existing start_time if present
UPDATE games SET game_date = DATE(start_time) WHERE game_date IS NULL;
UPDATE games SET start_time_local = CAST(start_time AT TIME ZONE 'Asia/Seoul' AS TIME) WHERE start_time_local IS NULL;

-- Ensure not null going forward
ALTER TABLE games ALTER COLUMN game_date SET NOT NULL;
ALTER TABLE games ALTER COLUMN start_time_local SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_games_game_date ON games(game_date);

