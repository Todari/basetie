-- Add start_time to kbo_games (time-of-day)
ALTER TABLE kbo_games ADD COLUMN IF NOT EXISTS start_time TIME;


