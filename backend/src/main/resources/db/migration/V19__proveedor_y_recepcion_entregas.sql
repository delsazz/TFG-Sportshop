ALTER TABLE producto
    ADD COLUMN IF NOT EXISTS proveedor VARCHAR(150),
    ADD COLUMN IF NOT EXISTS referencia_proveedor VARCHAR(80),
    ADD COLUMN IF NOT EXISTS stock_minimo INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS lote_compra INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS plazo_reposicion_dias INTEGER NOT NULL DEFAULT 7;

ALTER TABLE pedido_entrega
    ADD COLUMN IF NOT EXISTS comprobante_entrega_url TEXT,
    ADD COLUMN IF NOT EXISTS comprobante_entrega_nombre_archivo VARCHAR(255),
    ADD COLUMN IF NOT EXISTS firma_recepcion TEXT,
    ADD COLUMN IF NOT EXISTS nombre_recibe VARCHAR(150),
    ADD COLUMN IF NOT EXISTS documento_recibe VARCHAR(50),
    ADD COLUMN IF NOT EXISTS observaciones VARCHAR(500);

UPDATE producto
SET proveedor = 'Proveedor pendiente'
WHERE proveedor IS NULL OR proveedor = '';
