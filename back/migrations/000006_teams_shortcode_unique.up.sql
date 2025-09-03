-- Ensure teams.short_code has a unique index for upserts
CREATE UNIQUE INDEX IF NOT EXISTS uq_teams_short_code ON teams(short_code);


