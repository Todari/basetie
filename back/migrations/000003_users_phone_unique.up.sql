CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone ON users(phone) WHERE phone IS NOT NULL AND phone <> '';


