ALTER TABLE producto ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);

UPDATE producto
SET imagen = CASE id_producto
    WHEN 1 THEN '/img/productos/chaqueta-pc.jpg'
    WHEN 2 THEN '/img/productos/camiseta-pc.jpg'
    WHEN 3 THEN '/img/productos/pantalon-pc.jpg'
    WHEN 4 THEN '/img/productos/botas-pc.jpg'
    WHEN 5 THEN '/img/productos/chaqueta-te.jpg'
    WHEN 6 THEN '/img/productos/camiseta-te.jpg'
    WHEN 7 THEN '/img/productos/pantalon-te.jpg'
    WHEN 8 THEN '/img/productos/botas-te.jpg'
    WHEN 9 THEN '/img/productos/parte-superior-sanidad.jpg'
    WHEN 10 THEN '/img/productos/pantalon-sanidad.jpg'
    WHEN 11 THEN '/img/productos/crocs-sanidad.jpg'
    ELSE imagen
END
WHERE imagen IS NULL;
