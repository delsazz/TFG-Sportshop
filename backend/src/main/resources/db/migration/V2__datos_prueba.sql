INSERT INTO roles (nombre_rol) VALUES
    ('admin'),
    ('cliente')
ON CONFLICT (nombre_rol) DO NOTHING;

INSERT INTO usuario (nombre, apellidos, email, password, telefono, direccion) VALUES
    ('Juan', 'Perez', 'juan@dotex.com', '1234', '600111111', 'Madrid'),
    ('Ana', 'Gomez', 'ana@dotex.com', '1234', '600222222', 'Barcelona'),
    ('Carlos', 'Lopez', 'carlos@dotex.com', '1234', '600333333', 'Valencia'),
    ('Maria', 'Sanchez', 'maria@dotex.com', '1234', '600444444', 'Sevilla')
ON CONFLICT (email) DO NOTHING;

INSERT INTO roles_usuario (id_usuario, id_rol) VALUES
    (1, 2),
    (2, 1),
    (3, 2),
    (4, 2)
ON CONFLICT DO NOTHING;

INSERT INTO categoria (categoria) VALUES
    ('Ropa deportiva'),
    ('Calzado'),
    ('Accesorios'),
    ('Equipamiento'),
    ('Suplementos')
ON CONFLICT DO NOTHING;

INSERT INTO talla (nombre) VALUES
    ('S'),
    ('M'),
    ('L'),
    ('XL'),
    ('36'),
    ('37'),
    ('38'),
    ('39'),
    ('40'),
    ('41'),
    ('42'),
    ('43'),
    ('44'),
    ('45')
ON CONFLICT DO NOTHING;

INSERT INTO producto (nombre, tipo_prenda, color, precio, stock, id_categoria) VALUES
    ('Chaqueta Proteccion Civil', 'Chaqueta', 'Rojo', 50.00, 100, 1),
    ('Camiseta Proteccion Civil', 'Camiseta', 'Azul', 20.00, 120, 1),
    ('Pantalon Proteccion Civil', 'Pantalon', 'Azul', 30.00, 90, 1),
    ('Botas Proteccion Civil', 'Calzado', 'Negro', 65.00, 50, 1),
    ('Chaqueta Tecnico Emergencias', 'Chaqueta', 'Naranja', 55.00, 100, 2),
    ('Camiseta Tecnico Emergencias', 'Camiseta', 'Verde', 22.00, 110, 2),
    ('Pantalon Tecnico Emergencias', 'Pantalon', 'Verde', 32.00, 95, 2),
    ('Botas Tecnico Emergencias', 'Calzado', 'Negro', 70.00, 50, 2),
    ('Parte superior Sanidad', 'Parte superior', 'Blanco', 28.00, 100, 3),
    ('Pantalon Sanidad', 'Pantalon', 'Blanco', 25.00, 100, 3),
    ('Crocs Sanidad', 'Calzado', 'Blanco', 35.00, 60, 3)
ON CONFLICT DO NOTHING;

INSERT INTO producto_talla (id_producto, id_talla, stock) VALUES
    (1, 1, 20), (1, 2, 20), (1, 3, 20), (1, 4, 20),
    (2, 1, 25), (2, 2, 25), (2, 3, 25), (2, 4, 25),
    (3, 1, 20), (3, 2, 20), (3, 3, 20), (3, 4, 20),
    (9, 1, 25), (9, 2, 25), (9, 3, 25), (9, 4, 25)
ON CONFLICT DO NOTHING;

INSERT INTO pedido (fecha, total, estado, id_usuario) VALUES
    ('2026-03-01', 70.00, 'Enviado', 1),
    ('2026-03-02', 55.00, 'Pendiente', 3),
    ('2026-03-03', 35.00, 'Completado', 4)
ON CONFLICT DO NOTHING;

INSERT INTO detalle_pedido (cantidad, precio_unitario, id_pedido, id_producto) VALUES
    (1, 50.00, 1, 1),
    (1, 20.00, 1, 2),
    (1, 55.00, 2, 5),
    (1, 35.00, 3, 11)
ON CONFLICT DO NOTHING;

INSERT INTO pago (metodo_pago, fecha_pago, monto, estado, id_pedido) VALUES
    ('Tarjeta', '2026-03-01', 70.00, 'Completado', 1),
    ('Paypal', '2026-03-02', 55.00, 'Pendiente', 2),
    ('Tarjeta', '2026-03-03', 35.00, 'Completado', 3)
ON CONFLICT DO NOTHING;
