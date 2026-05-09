-- Crear la tabla producto_imagen


CREATE TABLE producto_imagen (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE
);