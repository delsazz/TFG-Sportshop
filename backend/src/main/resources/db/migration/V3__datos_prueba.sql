INSERT INTO roles (nombre_rol) VALUES
    ('admin'),
    ('cliente');

INSERT INTO usuario (nombre, apellidos, email, password, telefono, direccion) VALUES
    ('Juan', 'Perez', 'juan@sportshop.com', '$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', '600111222', 'Calle A 1, Madrid'),
    ('Ana', 'Lopez', 'ana@sportshop.com', '$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', '600222333', 'Calle B 2, Barcelona'),
    ('Carlos', 'Gomez', 'admin@sportshop.com', '$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', '600333444', 'Calle C 3, Valencia'),
    ('Lucia', 'Martin', 'lucia@sportshop.com', '$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', '600444555', 'Calle D 4, Sevilla'),
    ('Pedro', 'Sanchez', 'pedro@sportshop.com', '$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', '600555666', 'Calle E 5, Bilbao');

INSERT INTO roles_usuario (id_usuario, id_rol) VALUES
    (1, 2),
    (2, 2),
    (3, 1),
    (4, 2),
    (5, 2);

INSERT INTO categoria (categoria) VALUES
    ('Ropa deportiva'),
    ('Calzado'),
    ('Accesorios'),
    ('Equipamiento'),
    ('Suplementos');

INSERT INTO talla (nombre) VALUES
    ('S'), ('M'), ('L'), ('XL'),
    ('36'), ('37'), ('38'), ('39'), ('40'), ('41'), ('42'), ('43'), ('44'), ('45');

INSERT INTO producto (nombre, tipo_prenda, color, precio, stock, id_categoria) VALUES
    ('Camiseta Nike', 'Camiseta', 'Negro', 25.00, 50, 1),
    ('Zapatillas Adidas', 'Calzado', 'Blanco', 80.00, 30, 2),
    ('Mochila Puma', 'Mochila', 'Negro', 40.00, 20, 3),
    ('Pesas 10kg', 'Pesas', 'Gris', 60.00, 15, 4),
    ('Proteina Whey', 'Suplemento', 'Vainilla', 45.00, 25, 5);

INSERT INTO producto_talla (id_producto, id_talla, stock) VALUES
    (1, 1, 12), (1, 2, 14), (1, 3, 14), (1, 4, 10),
    (2, 7, 5), (2, 8, 5), (2, 9, 6), (2, 10, 6), (2, 11, 5), (2, 12, 3);

INSERT INTO pedido (fecha, total, estado, id_usuario) VALUES
    ('2026-02-01', 90.00, 'PENDIENTE', 1),
    ('2026-02-02', 80.00, 'PAGADO', 2),
    ('2026-02-03', 90.00, 'ENTREGADO_COMPLETO', 4);

INSERT INTO detalle_pedido (cantidad, precio_unitario, id_pedido, id_producto) VALUES
    (2, 25.00, 1, 1),
    (1, 40.00, 1, 3),
    (1, 80.00, 2, 2),
    (2, 45.00, 3, 5);

INSERT INTO pago (metodo_pago, fecha_pago, monto, estado, id_pedido) VALUES
    ('Tarjeta', '2026-02-02', 80.00, 'Completado', 2),
    ('Transferencia', '2026-02-03', 90.00, 'Completado', 3);
