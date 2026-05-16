SET SQL_SAFE_UPDATES = 0;
UPDATE categoria
SET imagen_url = CASE
    WHEN slug = 'ropa-deportiva' THEN '/img/categorias/ropa_deportiva.jpg'
    WHEN slug = 'calzado' THEN '/img/categorias/calzado_deportivo.jpg'
    WHEN slug = 'accesorios' THEN '/img/categorias/accesorios_deportivos.jpg'
    WHEN slug = 'equipamiento' THEN '/img/categorias/equipamiento_deportivo.jpg'
    WHEN slug = 'suplementos' THEN '/img/categorias/suplementos_deportivos.jpg'
    ELSE imagen_url
END
WHERE slug IN ('ropa-deportiva', 'calzado', 'accesorios', 'equipamiento', 'suplementos');
SET SQL_SAFE_UPDATES = 1;
