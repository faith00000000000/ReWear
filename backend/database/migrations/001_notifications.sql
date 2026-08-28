-- ReWear notification module. Review/apply to MySQL before deploying with ddl-auto=validate.
-- Existing local ddl-auto=update also creates these tables; do not run this against a partial old schema.
CREATE TABLE IF NOT EXISTS notification_inbox_state (
 recipient_id BIGINT NOT NULL PRIMARY KEY,
 revision BIGINT NOT NULL DEFAULT 0,
 sequence BIGINT NOT NULL DEFAULT 0,
 unread_count BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS notifications (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 recipient_id BIGINT NOT NULL,
 inbox_sequence BIGINT NOT NULL,
 event_key VARCHAR(180) NOT NULL,
 type VARCHAR(50) NOT NULL,
 title VARCHAR(160) NOT NULL,
 message VARCHAR(1000) NOT NULL,
 href VARCHAR(400) NOT NULL,
 created_at DATETIME(6) NOT NULL,
 read_at DATETIME(6) NULL,
 CONSTRAINT uk_notification_event UNIQUE (recipient_id,event_key),
 INDEX idx_notification_inbox (recipient_id,inbox_sequence),
 INDEX idx_notification_unread (recipient_id,read_at)
);
CREATE TABLE IF NOT EXISTS notification_outbox (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 recipient_id BIGINT NOT NULL,
 revision BIGINT NOT NULL,
 unread_count BIGINT NOT NULL,
 watermark BIGINT NOT NULL,
 created_at DATETIME(6) NOT NULL,
 delivered_at DATETIME(6) NULL,
 INDEX idx_notification_delivery (delivered_at,id)
);
