CREATE TABLE carrito_item (
    id_carrito_item INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    talla VARCHAR(20) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrito_item_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_carrito_item_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    CONSTRAINT uq_carrito_item_usuario_producto_talla
        UNIQUE (id_usuario, id_producto, talla)
);

CREATE INDEX idx_carrito_item_usuario ON carrito_item (id_usuario);
