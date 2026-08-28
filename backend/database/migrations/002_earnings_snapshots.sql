-- Review before deployment. Existing local ddl-auto=update creates these nullable columns automatically.
-- Run only once against a database lacking these columns; no historical amounts are fabricated.
ALTER TABLE order_items
 ADD COLUMN fee_amount_npr DECIMAL(14,2) NULL,
 ADD COLUMN deposit_amount_npr DECIMAL(14,2) NULL,
 ADD COLUMN shipping_amount_npr DECIMAL(14,2) NULL,
 ADD COLUMN commission_rate DECIMAL(5,4) NULL,
 ADD COLUMN seller_id BIGINT NULL,
 ADD COLUMN seller_name VARCHAR(255) NULL;
