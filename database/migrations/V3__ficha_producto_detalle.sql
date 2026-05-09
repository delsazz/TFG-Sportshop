-- Modificar la tabla producto para añadir la columna imagen


ALTER TABLE producto ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);

-- Modificar la tabla producto para añadir la columna descripcion


ALTER TABLE producto ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Modificar la tabla producto para añadir la columna composición


ALTER TABLE producto ADD COLUMN IF NOT EXISTS composicion VARCHAR(255);

-- Modificar la tabla producto para añadir la columna normativa


ALTER TABLE producto ADD COLUMN IF NOT EXISTS normativa VARCHAR(255);

-- Modificar la tabla producto para añadir la columna instrucciones_lavado


ALTER TABLE producto ADD COLUMN IF NOT EXISTS instrucciones_lavado VARCHAR(255);

-- Crear la tabla producto_imagen


CREATE TABLE IF NOT EXISTS producto_imagen (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE
);

-- Crear la tabla producto_documento


CREATE TABLE IF NOT EXISTS producto_documento (
    id_documento SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    url_documento VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'ficha_tecnica'
);

-- Actualizar la tabla producto


UPDATE producto

-- Añadir rutas de imágenes a la columna imagen de la tabla producto (una imagen por producto en función de su id_producto)


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
    WHEN 11 THEN '  /img/productos/crocs-sanidad.jpg'
    ELSE imagen
END
WHERE imagen IS NULL;

-- Actualizar la tabla producto


UPDATE producto

-- Añadir descripciones a la columna descripcion de la tabla producto (una descripción por producto en función de su id_producto)
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

-- Actualizar la tabla producto para añadir composición


UPDATE producto SET composicion = '65% poliester, 35% algodon' WHERE composicion IS NULL;

-- Actualizar la tabla producto para añadir normativa


UPDATE producto SET normativa = 'EN ISO 13688' WHERE normativa IS NULL; 

-- Actualizar la tabla producto para añadir instrucciones de lavado


UPDATE producto SET instrucciones_lavado = 'Lavar a 30C, no usar lejia, planchado suave' WHERE instrucciones_lavado IS NULL;

-- Insertar datos de prueba en la tabla producto_imagen


INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal)
SELECT p.id_producto, '/img/' || CASE
    WHEN p.id_categoria = 1 THEN 'proteccion-civil.jpg'
    WHEN p.id_categoria = 2 THEN 'sanidad.jpg'
    ELSE 'laboratorio.jpg'
END, p.nombre || ' vista principal', 0, TRUE
FROM producto p
WHERE NOT EXISTS (
    SELECT 1 FROM producto_imagen pi WHERE pi.id_producto = p.id_producto
);

-- Insertar datos de prueba en la tabla producto_imagen 


INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal)
SELECT p.id_producto, '/img/' || CASE
    WHEN p.id_categoria = 1 THEN 'proteccion-civil.jpg'
    WHEN p.id_categoria = 2 THEN 'sanidad.jpg'
    ELSE 'laboratorio.jpg'
END, p.nombre || ' detalle', 1, FALSE
FROM producto p
WHERE NOT EXISTS (
    SELECT 1 FROM producto_imagen pi WHERE pi.id_producto = p.id_producto AND pi.orden = 1
);

-- Insertar datos de prueba en la tabla producto_documento


INSERT INTO producto_documento (id_producto, nombre, url_documento, tipo)
SELECT p.id_producto, 'Ficha tecnica ' || p.nombre, 'https://example.com/documentos/producto-' || p.id_producto || '.pdf', 'ficha_tecnica'
FROM producto p
WHERE NOT EXISTS (
    SELECT 1 FROM producto_documento pd WHERE pd.id_producto = p.id_producto
);