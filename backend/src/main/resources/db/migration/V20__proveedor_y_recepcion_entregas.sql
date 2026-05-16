ALTER TABLE producto
    ADD COLUMN proveedor VARCHAR(150),
    ADD COLUMN referencia_proveedor VARCHAR(80),
    ADD COLUMN stock_minimo INT NOT NULL DEFAULT 5,
    ADD COLUMN lote_compra INT NOT NULL DEFAULT 1,
    ADD COLUMN plazo_reposicion_dias INT NOT NULL DEFAULT 7;

ALTER TABLE pedido_entrega
    ADD COLUMN comprobante_entrega_url TEXT,
    ADD COLUMN comprobante_entrega_nombre_archivo VARCHAR(255),
    ADD COLUMN firma_recepcion TEXT,
    ADD COLUMN nombre_recibe VARCHAR(150),
    ADD COLUMN documento_recibe VARCHAR(50),
    ADD COLUMN observaciones VARCHAR(500);

UPDATE producto
SET proveedor = 'Proveedor pendiente'
WHERE proveedor IS NULL OR proveedor = '';
