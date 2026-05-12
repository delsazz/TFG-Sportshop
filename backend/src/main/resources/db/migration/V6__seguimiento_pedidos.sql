CREATE TABLE pedido_historial (
    id_historial SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_evento VARCHAR(50) NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT fk_pedido_historial_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
        ON DELETE CASCADE
);

CREATE TABLE pedido_entrega (
    id_entrega SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_entrega_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
        ON DELETE CASCADE
);

CREATE TABLE pedido_entrega_linea (
    id_entrega_linea SERIAL PRIMARY KEY,
    id_entrega INTEGER NOT NULL,
    id_detalle INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
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

CREATE INDEX idx_pedido_historial_pedido ON pedido_historial (id_pedido, fecha_cambio DESC);
CREATE INDEX idx_pedido_entrega_pedido ON pedido_entrega (id_pedido, fecha_entrega DESC);
CREATE INDEX idx_pedido_entrega_linea_detalle ON pedido_entrega_linea (id_detalle);

INSERT INTO pedido_historial (id_pedido, fecha_cambio, tipo_evento, estado_nuevo, descripcion)
SELECT p.id_pedido, p.fecha::timestamp, 'PEDIDO_CREADO', p.estado, 'Pedido registrado en el sistema'
FROM pedido p
WHERE NOT EXISTS (
    SELECT 1
    FROM pedido_historial ph
    WHERE ph.id_pedido = p.id_pedido
)
ON CONFLICT DO NOTHING;
