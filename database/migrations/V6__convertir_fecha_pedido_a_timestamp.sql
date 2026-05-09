-- V6__convertir_fecha_pedido_a_timestamp.sql

-- Actualizar la tabla pedido


ALTER TABLE pedido

-- Actualizar la columna fecha a tipo TIMESTAMP con valor por defecto de la hora actual


ALTER COLUMN fecha TYPE TIMESTAMP DEFAULT CURRENT_TIMESTAMP;