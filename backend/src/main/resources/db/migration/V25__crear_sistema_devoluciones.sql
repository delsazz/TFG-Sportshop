CREATE TABLE devolucion (
    id_devolucion SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'SOLICITADA',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    comentarios_admin TEXT,
    CONSTRAINT fk_devolucion_pedido FOREIGN KEY (id_pedido) REFERENCES pedido (id_pedido),
    CONSTRAINT fk_devolucion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE devolucion_item (
    id_devolucion_item SERIAL PRIMARY KEY,
    id_devolucion INTEGER NOT NULL,
    id_detalle_pedido INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    CONSTRAINT fk_devolucion_item_devolucion FOREIGN KEY (id_devolucion) REFERENCES devolucion (id_devolucion),
    CONSTRAINT fk_devolucion_item_detalle FOREIGN KEY (id_detalle_pedido) REFERENCES detalle_pedido (id_detalle)
);
