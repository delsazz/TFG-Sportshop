ALTER TABLE pago
ADD COLUMN stripe_session_id VARCHAR(255),
ADD COLUMN stripe_payment_intent_id VARCHAR(255),
ADD COLUMN stripe_checkout_url VARCHAR(1000),
ADD COLUMN stripe_event_id VARCHAR(255);

CREATE UNIQUE INDEX uk_pago_stripe_session ON pago (stripe_session_id);
CREATE INDEX idx_pago_stripe_event ON pago (stripe_event_id);
