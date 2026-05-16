CREATE TABLE devolucion (
    id_devolucion INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_usuario INT NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'SOLICITADA',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL,
    comentarios_admin TEXT,
    CONSTRAINT fk_devolucion_pedido FOREIGN KEY (id_pedido) REFERENCES pedido (id_pedido),
    CONSTRAINT fk_devolucion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE devolucion_item (
    id_devolucion_item INT AUTO_INCREMENT PRIMARY KEY,
    id_devolucion INT NOT NULL,
    id_detalle_pedido INT NOT NULL,
    cantidad INT NOT NULL,
    CONSTRAINT fk_devolucion_item_devolucion FOREIGN KEY (id_devolucion) REFERENCES devolucion (id_devolucion),
    CONSTRAINT fk_devolucion_item_detalle FOREIGN KEY (id_detalle_pedido) REFERENCES detalle_pedido (id_detalle)
);
