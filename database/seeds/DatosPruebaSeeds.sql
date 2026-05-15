-- =========================
-- DATOS DE PRUEBA
-- =========================

INSERT INTO roles(nombre_rol) VALUES
                                  ('admin'),
                                  ('cliente');

INSERT INTO usuario(nombre,apellidos,email,password,telefono,direccion) VALUES
                                                                            ('Juan','Perez','juan@dotex.com','1234','600111111','Madrid'),
                                                                            ('Ana','Gomez','ana@dotex.com','1234','600222222','Barcelona'),
                                                                            ('Carlos','Lopez','carlos@dotex.com','1234','600333333','Valencia'),
                                                                            ('Maria','Sanchez','maria@dotex.com','1234','600444444','Sevilla');

INSERT INTO roles_usuario(id_usuario,id_rol) VALUES
                                                 (1,2),
                                                 (2,1),
                                                 (3,2),
                                                 (4,2);

INSERT INTO categoria(categoria) VALUES
                                    ('Ropa deportiva'),
                                    ('Calzado'),
                                    ('Accesorios'),
                                    ('Equipamiento'),
                                    ('Suplementos');

INSERT INTO talla(nombre) VALUES
                              ('S'),('M'),('L'),('XL'),
                              ('36'),('37'),('38'),('39'),('40'),
                              ('41'),('42'),('43'),('44'),('45');

INSERT INTO producto(nombre,tipo_prenda,color,precio,stock,id_categoria) VALUES
                                                                             ('Chaqueta Protección Civil','Chaqueta','Rojo',50,100,1),
                                                                             ('Camiseta Protección Civil','Camiseta','Azul',20,120,1),
                                                                             ('Pantalón Protección Civil','Pantalón','Azul',30,90,1),
                                                                             ('Botas Protección Civil','Calzado','Negro',65,50,1),
                                                                             ('Chaqueta Técnicos Emergencias','Chaqueta','Naranja',55,100,2),
                                                                             ('Camiseta Técnicos Emergencias','Camiseta','Verde',22,110,2),
                                                                             ('Pantalón Técnicos Emergencias','Pantalón','Verde',32,95,2),
                                                                             ('Botas Técnicos Emergencias','Calzado','Negro',70,50,2),
                                                                             ('Parte Superior Laboratorio','Parte Superior','Blanco',28,100,3),
                                                                             ('Pantalón Laboratorio','Pantalón','Blanco',25,100,3),
                                                                             ('Crocs Laboratorio','Calzado','Blanco',35,60,3);

INSERT INTO producto_talla VALUES
                               (1,1,20),(1,2,20),(1,3,20),(1,4,20),
                               (2,1,25),(2,2,25),(2,3,25),(2,4,25),
                               (3,1,20),(3,2,20),(3,3,20),(3,4,20),
                               (9,1,25),(9,2,25),(9,3,25),(9,4,25);

INSERT INTO pedido(fecha,total,estado,id_usuario) VALUES
                                                      ('2026-03-01',70,'Enviado',1),
                                                      ('2026-03-02',55,'Pendiente',3),
                                                      ('2026-03-03',35,'Completado',4);

INSERT INTO detalle_pedido(cantidad,precio_unitario,id_pedido,id_producto) VALUES
                                                                               (1,50,1,1),
                                                                               (1,20,1,2),
                                                                               (1,55,2,5),
                                                                               (1,35,3,11);

INSERT INTO pago(metodo_pago,fecha_pago,monto,estado,id_pedido) VALUES
                                                                    ('Tarjeta','2026-03-01',70,'Completado',1),
                                                                    ('Paypal','2026-03-02',55,'Pendiente',2),
                                                                    ('Tarjeta','2026-03-03',35,'Completado',3);



