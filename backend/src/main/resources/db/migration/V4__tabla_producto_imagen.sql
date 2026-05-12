CREATE TABLE IF NOT EXISTS producto_imagen (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE
);

INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal)
SELECT p.id_producto, '/img/' || CASE
    WHEN p.id_categoria = 1 THEN 'proteccion-civil.jpg'
    WHEN p.id_categoria = 2 THEN 'sanidad.jpg'
    ELSE 'laboratorio.jpg'
END, p.nombre || ' vista principal', 0, TRUE
FROM producto p
WHERE NOT EXISTS (
    SELECT 1 FROM producto_imagen pi WHERE pi.id_producto = p.id_producto
)
ON CONFLICT DO NOTHING;

INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal)
SELECT p.id_producto, '/img/' || CASE
    WHEN p.id_categoria = 1 THEN 'proteccion-civil.jpg'
    WHEN p.id_categoria = 2 THEN 'sanidad.jpg'
    ELSE 'laboratorio.jpg'
END, p.nombre || ' detalle', 1, FALSE
FROM producto p
WHERE NOT EXISTS (
    SELECT 1 FROM producto_imagen pi WHERE pi.id_producto = p.id_producto AND pi.orden = 1
)
ON CONFLICT DO NOTHING;
