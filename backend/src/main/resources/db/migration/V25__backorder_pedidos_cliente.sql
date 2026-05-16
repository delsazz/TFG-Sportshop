ALTER TABLE detalle_pedido
    ADD COLUMN cantidad_satisfecha INT NOT NULL DEFAULT 0,
    ADD COLUMN cantidad_pendiente INT NOT NULL DEFAULT 0,
    ADD COLUMN es_backorder BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE backorder_pedido (
    id_backorder INT AUTO_INCREMENT PRIMARY KEY,
    id_detalle INT NOT NULL,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    id_talla INT,
    cantidad_faltante INT NOT NULL,
    cantidad_recibida_parcial INT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resuelto TIMESTAMP NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    observaciones VARCHAR(500),
    CONSTRAINT fk_backorder_detalle
        FOREIGN KEY (id_detalle)
        REFERENCES detalle_pedido (id_detalle)
        ON DELETE CASCADE,
    CONSTRAINT fk_backorder_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
        ON DELETE CASCADE,
    CONSTRAINT fk_backorder_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    CONSTRAINT fk_backorder_talla
        FOREIGN KEY (id_talla)
        REFERENCES talla (id_talla),
    CONSTRAINT chk_backorder_cantidad_faltante
        CHECK (cantidad_faltante > 0)
);

UPDATE detalle_pedido
SET cantidad_satisfecha = cantidad,
    cantidad_pendiente = 0,
    es_backorder = FALSE
WHERE es_backorder = FALSE;

CREATE INDEX idx_backorder_pedido ON backorder_pedido (id_pedido);
CREATE INDEX idx_backorder_producto ON backorder_pedido (id_producto);
CREATE INDEX idx_backorder_estado ON backorder_pedido (estado);
CREATE INDEX idx_backorder_fecha ON backorder_pedido (fecha_creacion);
