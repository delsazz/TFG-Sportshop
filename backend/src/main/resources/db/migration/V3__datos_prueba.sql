INSERT INTO categoria (categoria) VALUES
('Ropa deportiva'),
('Calzado'),
('Accesorios'),
('Equipamiento'),
('Suplementos');

INSERT INTO usuario (nombre, apellidos, email, password, telefono, nif, ciudad, pais, direccion, rol) VALUES
('Juan', 'Perez', 'juan@sportshop.com', '1234', '600111222', '12345678A', 'Madrid', 'España', 'Calle A 1', 'cliente'),
('Ana', 'Lopez', 'ana@sportshop.com', '1234', '600222333', '23456789B', 'Barcelona', 'España', 'Calle B 2', 'cliente'),
('Carlos', 'Gomez', 'admin@sportshop.com', '1234', '600333444', '34567890C', 'Valencia', 'España', 'Calle C 3', 'admin'),
('Lucia', 'Martin', 'lucia@sportshop.com', '1234', '600444555', '45678901D', 'Sevilla', 'España', 'Calle D 4', 'cliente'),
('Pedro', 'Sanchez', 'pedro@sportshop.com', '1234', '600555666', '56789012E', 'Bilbao', 'España', 'Calle E 5', 'cliente');

INSERT INTO producto (nombre, id_categoria, precio, stock, descripcion) VALUES
('Camiseta Nike', 1, 25, 50, 'Camiseta deportiva Nike de manga corta, fabricada con tejido transpirable Dri-FIT que ayuda a mantener la piel seca y cómoda durante el entrenamiento. Ideal para running, gimnasio o uso diario.'),
('Zapatillas Adidas', 2, 80, 30, 'Zapatillas deportivas Adidas con suela de goma antideslizante y amortiguación avanzada. Diseñadas para ofrecer comodidad y estabilidad en entrenamientos y actividades deportivas intensas.'),
('Mochila Puma', 3, 40, 20, 'Mochila Puma resistente y ligera con múltiples compartimentos. Perfecta para llevar ropa deportiva, accesorios o material escolar. Incluye tirantes ajustables y acolchados.'),
('Pesas 10kg', 4, 60, 15, 'Juego de pesas de 10 kg ideales para entrenamiento de fuerza en casa o gimnasio. Fabricadas con materiales duraderos y agarre ergonómico para mayor seguridad durante el ejercicio.'),
('Proteina Whey', 5, 45, 25, 'Suplemento de proteína Whey de alta calidad, ideal para recuperación muscular después del entrenamiento. Contiene aminoácidos esenciales y es de rápida absorción.');

INSERT INTO pedido (id_usuario, fecha_pedido, fecha_entrega) VALUES
(1, '2026-02-01', '2026-02-05'),
(2, '2026-02-02', '2026-02-06'),
(3, '2026-02-03', '2026-02-07'),
(4, '2026-02-04', '2026-02-08'),
(5, '2026-02-05', '2026-02-09');

INSERT INTO roles (nombre_rol) VALUES ('admin'), ('cliente');

INSERT INTO roles_usuario (id_usuario, id_rol) VALUES
(1, 2), (2, 2), (3, 1), (4, 2), (5, 2);

INSERT INTO talla (nombre) VALUES
('S'), ('M'), ('L'), ('XL'),
('36'), ('37'), ('38'), ('39'), ('40'), ('41'), ('42'), ('43'), ('44'), ('45');

INSERT INTO producto_talla (id_producto, id_talla, stock) VALUES
(1, 1, 12), (1, 2, 14), (1, 3, 14), (1, 4, 10),
(2, 7, 5), (2, 8, 5), (2, 9, 6), (2, 10, 6), (2, 11, 5), (2, 12, 3);

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, precio, unidades) VALUES
(1, 1, 2, 25.00, 50, 2),
(1, 3, 1, 40.00, 40, 1),
(2, 2, 1, 80.00, 80, 1),
(3, 5, 2, 45.00, 90, 2);
