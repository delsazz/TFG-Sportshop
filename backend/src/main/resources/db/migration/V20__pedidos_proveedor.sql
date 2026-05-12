CREATE TABLE proveedor_pedido (
    id_pedido_proveedor SERIAL PRIMARY KEY,
    proveedor VARCHAR(150) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'BORRADOR',
    observaciones VARCHAR(500)
);

CREATE TABLE proveedor_pedido_linea (
    id_linea_proveedor SERIAL PRIMARY KEY,
    id_pedido_proveedor INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    id_talla INTEGER,
    referencia_proveedor VARCHAR(80),
    nombre_producto VARCHAR(150) NOT NULL,
    talla VARCHAR(20),
    cantidad INTEGER NOT NULL,
    stock_disponible INTEGER NOT NULL DEFAULT 0,
    pendiente_entrega INTEGER NOT NULL DEFAULT 0,
    stock_proyectado INTEGER NOT NULL DEFAULT 0,
    prioridad VARCHAR(50) NOT NULL,
    CONSTRAINT fk_proveedor_pedido_linea_pedido
        FOREIGN KEY (id_pedido_proveedor)
        REFERENCES proveedor_pedido (id_pedido_proveedor)
        ON DELETE CASCADE,
    CONSTRAINT fk_proveedor_pedido_linea_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    CONSTRAINT fk_proveedor_pedido_linea_talla
        FOREIGN KEY (id_talla)
        REFERENCES talla (id_talla),
    CONSTRAINT chk_proveedor_pedido_linea_cantidad
        CHECK (cantidad > 0)
);

CREATE INDEX idx_proveedor_pedido_fecha ON proveedor_pedido (fecha_creacion DESC);
CREATE INDEX idx_proveedor_pedido_proveedor ON proveedor_pedido (proveedor);
