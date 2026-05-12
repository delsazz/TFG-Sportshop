-- ============================================================
-- V27 — Sincroniza la tabla pago con la entidad Pago.java
-- ============================================================
-- La entidad declara cuatro columnas que ningún script previo
-- llegó a crear en BD. Sin esto, Hibernate aborta el arranque
-- con: "Schema-validation: missing column [comprobante_nombre_archivo]
-- in table [pago]".
--
-- Idempotente (IF NOT EXISTS) para que pueda aplicarse incluso si
-- alguna columna se hubiera añadido a mano en algún entorno.

ALTER TABLE pago
    ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS comprobante_nombre_archivo VARCHAR(255),
    ADD COLUMN IF NOT EXISTS fecha_confirmacion DATE,
    ADD COLUMN IF NOT EXISTS notas_admin VARCHAR(500);
