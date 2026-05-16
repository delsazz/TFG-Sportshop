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

INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal) VALUES
(1, '/img/productos/camiseta_nike.jpg', 'Camiseta Nike vista principal', 0, TRUE),
(2, '/img/productos/zapatillas_adidas.jpg', 'Zapatillas Adidas vista principal', 0, TRUE),
(3, '/img/productos/mochila_puma.jpg', 'Mochila Puma vista principal', 0, TRUE),
(4, '/img/productos/pesas_10kg.jpg', 'Pesas 10kg vista principal', 0, TRUE),
(5, '/img/productos/proteina_whey.jpg', 'Proteina Whey vista principal', 0, TRUE);
