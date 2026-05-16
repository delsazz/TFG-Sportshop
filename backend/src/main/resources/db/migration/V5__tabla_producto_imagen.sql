CREATE TABLE producto_imagen (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    orden INT DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_producto_imagen_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
        ON DELETE CASCADE
);

INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal)
SELECT p.id_producto, p.imagen, CONCAT(p.nombre, ' vista principal'), 0, TRUE
FROM producto p
WHERE p.imagen IS NOT NULL;
