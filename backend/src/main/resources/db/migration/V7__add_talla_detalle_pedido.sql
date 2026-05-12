-- Añadir columna id_talla a detalle_pedido
-- Necesaria para saber qué talla pidió el alumno en cada línea del pedido
ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS id_talla INTEGER;

-- Foreign key a la tabla talla
ALTER TABLE detalle_pedido
    ADD CONSTRAINT fk_detalle_talla
    FOREIGN KEY (id_talla) REFERENCES talla(id_talla)
    ON DELETE SET NULL;
