-- Agregar columnas para rastrear backorders de clientes
ALTER TABLE detalle_pedido
    ADD COLUMN IF NOT EXISTS cantidad_satisfecha INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cantidad_pendiente INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS es_backorder BOOLEAN NOT NULL DEFAULT FALSE;

-- Crear tabla para rastrear histórico de backorders
CREATE TABLE IF NOT EXISTS backorder_pedido (
    id_backorder SERIAL PRIMARY KEY,
    id_detalle INTEGER NOT NULL,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    id_talla INTEGER,
    cantidad_faltante INTEGER NOT NULL,
    cantidad_recibida_parcial INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resuelto TIMESTAMP,
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

-- Actualizar detalle_pedido existentes:
-- cantidad_satisfecha = cantidad (si hay stock), cantidad_pendiente = 0 (si hay stock)
UPDATE detalle_pedido
SET cantidad_satisfecha = cantidad,
    cantidad_pendiente = 0,
    es_backorder = FALSE
WHERE es_backorder = FALSE;

CREATE INDEX idx_backorder_pedido ON backorder_pedido (id_pedido);
CREATE INDEX idx_backorder_producto ON backorder_pedido (id_producto);
CREATE INDEX idx_backorder_estado ON backorder_pedido (estado);
CREATE INDEX idx_backorder_fecha ON backorder_pedido (fecha_creacion DESC);

