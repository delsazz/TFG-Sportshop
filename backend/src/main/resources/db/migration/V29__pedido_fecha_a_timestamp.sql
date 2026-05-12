-- ============================================================
-- V29 — Forzar pedido.fecha a TIMESTAMP
-- ============================================================
-- La entidad Pedido.java declara LocalDateTime para "fecha", lo
-- que requiere un TIMESTAMP en BD. V9 ya intentó esta conversión,
-- pero en algunos entornos la columna sigue siendo DATE y Hibernate
-- aborta el arranque con:
--
--   wrong column type encountered in column [fecha] in table [pedido];
--   found [date (Types#DATE)], but expecting [timestamp(6) (Types#TIMESTAMP)]
--
-- Idempotente: USING fecha::timestamp es seguro tanto si la columna
-- ya es TIMESTAMP (no-op) como si es DATE (convierte la fecha a las
-- 00:00:00 de ese día).

ALTER TABLE pedido
    ALTER COLUMN fecha TYPE TIMESTAMP USING fecha::timestamp;
