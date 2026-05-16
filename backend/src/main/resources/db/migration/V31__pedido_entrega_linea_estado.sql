ALTER TABLE pedido_entrega_linea
    ADD COLUMN estado_entrega VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE';
