ALTER TABLE categoria
ADD COLUMN IF NOT EXISTS slug VARCHAR(120),
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS orden_visualizacion INTEGER NOT NULL DEFAULT 0;

UPDATE categoria
SET slug = CASE
    WHEN lower(nombre_categoria) = 'proteccion civil' THEN 'proteccion-civil'
    WHEN lower(nombre_categoria) = 'tecnicos emergencias' THEN 'tecnicos-emergencias'
    WHEN lower(nombre_categoria) = 'sanidad' THEN 'sanidad'
    ELSE lower(regexp_replace(nombre_categoria, '[^a-zA-Z0-9]+', '-', 'g'))
END
WHERE slug IS NULL OR trim(slug) = '';

ALTER TABLE categoria
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE categoria
ADD CONSTRAINT uk_categoria_slug UNIQUE (slug);
