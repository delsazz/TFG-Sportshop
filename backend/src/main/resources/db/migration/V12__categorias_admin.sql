ALTER TABLE categoria
ADD COLUMN IF NOT EXISTS slug VARCHAR(120),
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS orden_visualizacion INTEGER NOT NULL DEFAULT 0;

UPDATE categoria
SET slug = CASE
    WHEN lower(categoria) = 'ropa deportiva' THEN 'ropa-deportiva'
    WHEN lower(categoria) = 'calzado' THEN 'calzado'
    WHEN lower(categoria) = 'accesorios' THEN 'accesorios'
    WHEN lower(categoria) = 'equipamiento' THEN 'equipamiento'
    WHEN lower(categoria) = 'suplementos' THEN 'suplementos'
    ELSE lower(regexp_replace(categoria, '[^a-zA-Z0-9]+', '-', 'g'))
END
WHERE slug IS NULL OR trim(slug) = '';

UPDATE categoria
SET imagen_url = CASE
    WHEN slug = 'ropa-deportiva' THEN '/img/categorias/ropa_deportiva.jpg'
    WHEN slug = 'calzado' THEN '/img/categorias/calzado_deportivo.jpg'
    WHEN slug = 'accesorios' THEN '/img/categorias/accesorios_deportivos.jpg'
    WHEN slug = 'equipamiento' THEN '/img/categorias/equipamiento_deportivo.jpg'
    WHEN slug = 'suplementos' THEN '/img/categorias/suplementos_deportivos.jpg'
    ELSE imagen_url
END
WHERE imagen_url IS NULL OR trim(imagen_url) = '';

ALTER TABLE categoria
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE categoria
ADD CONSTRAINT uk_categoria_slug UNIQUE (slug);
