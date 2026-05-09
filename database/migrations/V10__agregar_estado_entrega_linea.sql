ALTER TABLE pedido_entrega_linea
    ADD COLUMN IF NOT EXISTS estado_entrega VARCHAR(30) NOT NULL DEFAULT 'ENTREGADA';

UPDATE pedido_entrega_linea
SET estado_entrega = 'ENTREGADA'
WHERE estado_entrega IS NULL;
