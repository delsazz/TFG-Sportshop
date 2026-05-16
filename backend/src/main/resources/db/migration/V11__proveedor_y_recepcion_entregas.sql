ALTER TABLE producto
    ADD COLUMN proveedor VARCHAR(150),
    ADD COLUMN referencia_proveedor VARCHAR(80),
    ADD COLUMN stock_minimo INT NOT NULL DEFAULT 5,
    ADD COLUMN lote_compra INT NOT NULL DEFAULT 1,
    ADD COLUMN plazo_reposicion_dias INT NOT NULL DEFAULT 7;

CREATE TABLE pedido_entrega (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comprobante_entrega_url TEXT,
    comprobante_entrega_nombre_archivo VARCHAR(255),
    firma_recepcion TEXT,
    nombre_recibe VARCHAR(150),
    documento_recibe VARCHAR(50),
    observaciones VARCHAR(500),
    CONSTRAINT fk_pedido_entrega_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
        ON DELETE CASCADE
);

CREATE TABLE pedido_entrega_linea (
    id_entrega_linea INT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    id_detalle INT NOT NULL,
    cantidad INT NOT NULL,
    estado_entrega VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_pedido_entrega_linea_entrega
        FOREIGN KEY (id_entrega)
        REFERENCES pedido_entrega (id_entrega)
        ON DELETE CASCADE,
    CONSTRAINT fk_pedido_entrega_linea_detalle
        FOREIGN KEY (id_detalle)
        REFERENCES detalle_pedido (id_detalle)
        ON DELETE CASCADE,
    CONSTRAINT chk_pedido_entrega_linea_cantidad
        CHECK (cantidad > 0)
);

CREATE INDEX idx_pedido_entrega_pedido ON pedido_entrega (id_pedido, fecha_entrega);
CREATE INDEX idx_pedido_entrega_linea_detalle ON pedido_entrega_linea (id_detalle);

SET SQL_SAFE_UPDATES = 0;
UPDATE producto
SET proveedor = 'Proveedor pendiente'
WHERE proveedor IS NULL OR proveedor = '';
SET SQL_SAFE_UPDATES = 1;
