CREATE TABLE kit (
    id_kit INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    id_categoria INT,
    imagen VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE SET NULL
);

CREATE TABLE kit_producto (
    id_kit_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_kit INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_kit) REFERENCES kit(id_kit) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    UNIQUE(id_kit, id_producto)
);

ALTER TABLE carrito_item
ADD COLUMN id_kit INT;

ALTER TABLE carrito_item
ADD CONSTRAINT fk_carrito_item_kit
FOREIGN KEY (id_kit) REFERENCES kit(id_kit) ON DELETE SET NULL;

CREATE INDEX idx_kit_categoria ON kit(id_categoria);
CREATE INDEX idx_kit_activo ON kit(activo);
CREATE INDEX idx_kit_producto_kit ON kit_producto(id_kit);
CREATE INDEX idx_kit_producto_producto ON kit_producto(id_producto);
CREATE INDEX idx_carrito_item_kit ON carrito_item(id_kit);
