CREATE TABLE pedido_historial (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
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
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

CREATE INDEX idx_pedido_historial_pedido ON pedido_historial (id_pedido, fecha_cambio);
CREATE INDEX idx_pedido_entrega_pedido ON pedido_entrega (id_pedido, fecha_entrega);
CREATE INDEX idx_pedido_entrega_linea_detalle ON pedido_entrega_linea (id_detalle);

INSERT INTO pedido_historial (id_pedido, fecha_cambio, tipo_evento, estado_nuevo, descripcion)
SELECT p.id_pedido, CAST(p.fecha AS DATETIME), 'PEDIDO_CREADO', p.estado, 'Pedido registrado en el sistema'
FROM pedido p;
