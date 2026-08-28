-- Apply once to existing MySQL deployments (backup first). Hibernate ddl-auto=update also creates these in development.
ALTER TABLE order_items ADD COLUMN rental_state VARCHAR(255) NULL,
 ADD COLUMN rental_closed_at TIMESTAMP(6) NULL,
 ADD COLUMN cancellation_fee_npr DECIMAL(14,2) NULL,
 ADD COLUMN refund_due_npr DECIMAL(14,2) NULL,
 ADD COLUMN refund_state VARCHAR(255) NULL;
CREATE TABLE seller_withdrawals (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, seller_id BIGINT NOT NULL,
 request_key VARCHAR(64) NOT NULL, amount DECIMAL(14,2) NOT NULL,
 gateway VARCHAR(255) NOT NULL, account VARCHAR(255) NOT NULL,
 status VARCHAR(255) NOT NULL, created_at TIMESTAMP(6) NOT NULL,
 UNIQUE KEY uq_seller_withdrawal_request(seller_id,request_key)
);
