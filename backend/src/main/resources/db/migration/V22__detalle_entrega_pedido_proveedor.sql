ALTER TABLE proveedor_pedido
    ADD COLUMN direccion_entrega VARCHAR(255),
    ADD COLUMN contacto_entrega VARCHAR(150),
    ADD COLUMN telefono_entrega VARCHAR(30),
    ADD COLUMN fecha_prevista_entrega DATE,
    ADD COLUMN fecha_recepcion TIMESTAMP NULL;
