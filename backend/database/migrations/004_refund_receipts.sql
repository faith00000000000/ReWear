-- Apply once if Hibernate development schema updates have not already created the table.
CREATE TABLE refund_receipts (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 item_id BIGINT NOT NULL, admin_id BIGINT NOT NULL, amount DECIMAL(14,2) NOT NULL,
 gateway VARCHAR(16) NOT NULL, provider_reference VARCHAR(120) NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL,
 UNIQUE KEY uq_refund_item(item_id), UNIQUE KEY uq_refund_reference(gateway,provider_reference)
);
