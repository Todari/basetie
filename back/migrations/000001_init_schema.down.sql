DROP INDEX IF EXISTS uq_deals_listing_active;
DROP INDEX IF EXISTS idx_listings_status;
DROP INDEX IF EXISTS idx_listings_team_id;
DROP INDEX IF EXISTS idx_listings_game_id;
DROP INDEX IF EXISTS idx_listings_seller_id;
DROP INDEX IF EXISTS idx_reports_target_user_id;
DROP INDEX IF EXISTS idx_messages_deal_id;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS device_tokens;
DROP TABLE IF EXISTS penalties;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;


