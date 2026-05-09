-- V7__agregar_datos_ficha_producto.sql

DELETE FROM producto_imagen WHERE id_producto BETWEEN 1 AND 11;

INSERT INTO producto_imagen (id_producto, url_imagen, alt_text, orden, es_principal) VALUES
(1, '/img/productos/chaqueta-pc.jpg', 'Chaqueta Proteccion Civil', 1, true),
(1, '/img/productos/CEÑIDOR-pc.jpg', 'Cenidor Proteccion Civil', 2, false),
(2, '/img/productos/camiseta-pc.jpg', 'Camiseta Proteccion Civil', 1, true),
(3, '/img/productos/pantalon-pc.jpg', 'Pantalon Proteccion Civil', 1, true),
(4, '/img/productos/botas-pc.jpg', 'Botas Proteccion Civil', 1, true),
(5, '/img/productos/chaqueta-te.jpg', 'Chaqueta Tecnico Emergencias', 1, true),
(5, '/img/productos/F._T_CHAQUETA-te.jpg', 'Ficha talla chaqueta', 2, false),
(5, '/img/productos/TABLA_TALLA_CHAQUETA_C-2931-te.jpg', 'Tabla talla chaqueta', 3, false),
(5, '/img/productos/CASCO AMARILLO-te.jpg', 'Casco Tecnico Emergencias', 4, false),
(5, '/img/productos/GAFAS.jpg', 'Gafas proteccion', 5, false),
(5, '/img/productos/mochila-te.jpg', 'Mochila Tecnico Emergencias', 6, false),
(6, '/img/productos/camiseta-te.jpg', 'Camiseta Tecnico Emergencias', 1, true),
(6, '/img/productos/CAMISETA NEGRA-te.jpg', 'Camiseta negra Tecnico Emergencias', 2, false),
(7, '/img/productos/pantalon-te.jpg', 'Pantalon Tecnico Emergencias', 1, true),
(7, '/img/productos/F._T_PANTALON-te.jpg', 'Ficha talla pantalon', 2, false),
(8, '/img/productos/botas-te.jpg', 'Botas Tecnico Emergencias', 1, true),
(9, '/img/productos/parte-superior-sanidad.jpg', 'Parte superior Sanidad', 1, true),
(10, '/img/productos/pantalon-sanidad.jpg', 'Pantalon Sanidad', 1, true),
(11, '/img/productos/crocs-sanidad.jpg', 'Crocs Sanidad', 1, true);

UPDATE producto SET
  descripcion = 'Chaqueta de alta visibilidad para Proteccion Civil. Tejido reflectante con bandas 3M.',
  composicion = 'Poliester 100%, membrana impermeable',
  normativa = 'EN ISO 20471 Clase 2',
  instrucciones_lavado = 'Lavar a maquina 40C. No usar lejia.'
WHERE id_producto = 1;
