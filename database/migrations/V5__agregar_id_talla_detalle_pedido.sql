-- V5__agregar_id_talla_detalle_pedido.sql

-- Actualizar la tabla detalle_pedido


ALTER TABLE detalle_pedido

-- Añadir la columna id_talla


ADD COLUMN id_talla INTEGER;

-- Actualizar la tabla detalle_pedido


ALTER TABLE detalle_pedido

--Añadir una restricción de clave foránea para id_talla


ADD CONSTRAINT fk_detalle_pedido_talla FOREIGN KEY (id_talla) REFERENCES talla (id_talla);