-- Actualizar la tabla pago

ALTER TABLE pago

-- Añadir la columna stripe_session_id para almacenar el ID de la sesión de Stripe


ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),

-- Añadir la columna stripe_payment_intent_id para almacenar el ID del intento de pago de Stripe


ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),

-- Añadir la columna stripe_checkout_url para almacenar la URL de checkout de Stripe


 ADD COLUMN IF NOT EXISTS stripe_checkout_url VARCHAR(1000),

 -- Añadir la columna stripe_event_id para almacenar el ID del evento de Stripe


ADD COLUMN IF NOT EXISTS stripe_event_id VARCHAR(255);

-- Crear índice único para stripe_session_id para mejorar la búsqueda y garantizar la unicidad


CREATE UNIQUE INDEX IF NOT EXISTS uk_pago_stripe_session
    ON pago (stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;

-- Crear índice para idento de pago de Stripe para mejorar la búsqueda


CREATE INDEX IF NOT EXISTS idx_pago_stripe_event
    ON pago (stripe_event_id)
    WHERE stripe_event_id IS NOT NULL;
