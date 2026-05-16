ALTER TABLE categoria
ADD COLUMN slug VARCHAR(120),
ADD COLUMN descripcion TEXT,
ADD COLUMN imagen_url TEXT,
ADD COLUMN orden_visualizacion INT NOT NULL DEFAULT 0;

UPDATE categoria
SET slug = CASE
    WHEN LOWER(categoria) = 'ropa deportiva' THEN 'ropa-deportiva'
    WHEN LOWER(categoria) = 'calzado' THEN 'calzado'
    WHEN LOWER(categoria) = 'accesorios' THEN 'accesorios'
    WHEN LOWER(categoria) = 'equipamiento' THEN 'equipamiento'
    WHEN LOWER(categoria) = 'suplementos' THEN 'suplementos'
    ELSE LOWER(REPLACE(TRIM(categoria), ' ', '-'))
END
WHERE slug IS NULL OR TRIM(slug) = '';

UPDATE categoria
SET imagen_url = CASE
    WHEN slug = 'ropa-deportiva' THEN '/img/categorias/ropa_deportiva.jpg'
    WHEN slug = 'calzado' THEN '/img/categorias/calzado_deportivo.jpg'
    WHEN slug = 'accesorios' THEN '/img/categorias/accesorios_deportivos.jpg'
    WHEN slug = 'equipamiento' THEN '/img/categorias/equipamiento_deportivo.jpg'
    WHEN slug = 'suplementos' THEN '/img/categorias/suplementos_deportivos.jpg'
    ELSE imagen_url
END
WHERE imagen_url IS NULL OR TRIM(imagen_url) = '';

ALTER TABLE categoria
MODIFY COLUMN slug VARCHAR(120) NOT NULL;

ALTER TABLE categoria
ADD CONSTRAINT uk_categoria_slug UNIQUE (slug);
