ALTER TABLE producto ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE producto ADD COLUMN IF NOT EXISTS composicion VARCHAR(255);
ALTER TABLE producto ADD COLUMN IF NOT EXISTS normativa VARCHAR(255);
ALTER TABLE producto ADD COLUMN IF NOT EXISTS instrucciones_lavado VARCHAR(255);

CREATE TABLE IF NOT EXISTS producto_documento (
    id_documento SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    url_documento VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'ficha_tecnica'
);

UPDATE producto
SET descripcion = CASE id_producto
    WHEN 1 THEN 'Chaqueta operativa de alta visibilidad para intervenciones de Proteccion Civil, con tejido resistente y refuerzos en zonas de desgaste.'
    WHEN 2 THEN 'Camiseta tecnica transpirable para turnos de operativa y apoyo logistico.'
    WHEN 3 THEN 'Pantalon multibolsillo para intervenciones y tareas de campo.'
    WHEN 4 THEN 'Bota de seguridad antideslizante con puntera reforzada.'
    WHEN 5 THEN 'Chaqueta tecnica para personal de emergencias sanitarias con alta visibilidad.'
    WHEN 6 THEN 'Camiseta comoda y transpirable para guardias y transporte sanitario.'
    WHEN 7 THEN 'Pantalon tecnico de emergencias con patron ergonomico.'
    WHEN 8 THEN 'Calzado de seguridad S3 para intervencion y traslado.'
    WHEN 9 THEN 'Casaca sanitaria ligera para entorno clinico y practicas.'
    WHEN 10 THEN 'Pantalon sanitario de corte recto y tejido facil de mantener.'
    WHEN 11 THEN 'Calzado sanitario ligero, comodo y facil de limpiar.'
    ELSE 'Uniforme tecnico para uso academico y profesional.'
END
WHERE descripcion IS NULL;

UPDATE producto
SET composicion = '65% poliester, 35% algodon'
WHERE composicion IS NULL;

UPDATE producto
SET normativa = 'EN ISO 13688'
WHERE normativa IS NULL;

UPDATE producto
SET instrucciones_lavado = 'Lavar a 30C, no usar lejia, planchado suave'
WHERE instrucciones_lavado IS NULL;

INSERT INTO producto_documento (id_producto, nombre, url_documento, tipo)
SELECT p.id_producto, 'Ficha tecnica ' || p.nombre, 'https://example.com/documentos/producto-' || p.id_producto || '.pdf', 'ficha_tecnica'
FROM producto p
WHERE NOT EXISTS (
    SELECT 1 FROM producto_documento pd WHERE pd.id_producto = p.id_producto
)
ON CONFLICT DO NOTHING;
