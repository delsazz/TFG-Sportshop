ALTER TABLE proveedor_pedido
    ADD COLUMN IF NOT EXISTS direccion_entrega VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contacto_entrega VARCHAR(150),
    ADD COLUMN IF NOT EXISTS telefono_entrega VARCHAR(30),
    ADD COLUMN IF NOT EXISTS fecha_prevista_entrega DATE,
    ADD COLUMN IF NOT EXISTS fecha_recepcion TIMESTAMP;
