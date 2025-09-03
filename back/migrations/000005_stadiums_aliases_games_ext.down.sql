DROP INDEX IF EXISTS idx_games_start_time;
ALTER TABLE games DROP CONSTRAINT IF EXISTS uq_games_unique_match;
ALTER TABLE games DROP COLUMN IF EXISTS stadium_id;
DROP TABLE IF EXISTS team_aliases;
DROP TABLE IF EXISTS stadiums;


