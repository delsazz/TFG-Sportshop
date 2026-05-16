ALTER TABLE producto ADD COLUMN composicion VARCHAR(255);
ALTER TABLE producto ADD COLUMN normativa VARCHAR(255);
ALTER TABLE producto ADD COLUMN instrucciones_lavado VARCHAR(255);

CREATE TABLE producto_documento (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    url_documento VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'ficha_tecnica',
    CONSTRAINT fk_producto_documento_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
        ON DELETE CASCADE
);
