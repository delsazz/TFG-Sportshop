CREATE DATABASE IF NOT EXISTS sportshop;
USE sportshop;

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE usuario (
    correo_electronico VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(100),
    apellidos VARCHAR(100),
    telefono VARCHAR(100),
    pw VARCHAR(255),
    rol VARCHAR(100),
    nif VARCHAR(20),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    codigo_postal VARCHAR(100),
    direccion VARCHAR(100)
);

CREATE TABLE foto (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_foto VARCHAR(100)
);

CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    id_categoria INT,
    precio INT,
    stock INT,
    descripcion VARCHAR(100),
    id_foto INT,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY(id_foto) REFERENCES foto(id_foto)
);

CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    correo_electronico VARCHAR(100),
    fecha_pedido DATE,
    fecha_entrega DATE,
    FOREIGN KEY (correo_electronico) REFERENCES usuario(correo_electronico)
);

CREATE TABLE detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_producto INT,
    precio INT,
    unidades INT,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

INSERT INTO categoria (categoria) VALUES
('Ropa deportiva'),
('Calzado'),
('Accesorios'),
('Equipamiento'),
('Suplementos');

INSERT INTO usuario 
(correo_electronico, nombre, apellidos, telefono, pw, rol, nif, ciudad, pais, codigo_postal, direccion) VALUES
('juan@sportshop.com', 'Juan', 'Perez', '600111222', 
'$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', 
'cliente', '12345678A', 'Madrid', 'España', '28001', 'Calle A 1'),
('ana@sportshop.com', 'Ana', 'Lopez', '600222333', 
'$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', 
'cliente', '23456789B', 'Barcelona', 'España', '08001', 'Calle B 2'),
('admin@sportshop.com', 'Carlos', 'Gomez', '600333444', 
'$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', 
'admin', '34567890C', 'Valencia', 'España', '46001', 'Calle C 3'),
('lucia@sportshop.com', 'Lucia', 'Martin', '600444555', 
'$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', 
'cliente', '45678901D', 'Sevilla', 'España', '41001', 'Calle D 4'),
('pedro@sportshop.com', 'Pedro', 'Sanchez', '600555666', 
'$2a$10$lF6/TEVcza8fTHUq2atoCulPDDSYu68aWKQnrW4cG6EpJVEmwNv.S', 
'cliente', '56789012E', 'Bilbao', 'España', '48001', 'Calle E 5');

INSERT INTO foto (nombre_foto) VALUES
('camiseta_nike.jpg'),
('zapatillas_adidas.jpg'),
('mochila_puma.jpg'),
('pesas_10kg.jpg'),
('proteina_whey.jpg');

INSERT INTO producto (nombre, id_categoria, precio, stock, descripcion, id_foto) VALUES
('Camiseta Nike', 1, 25, 50, 'Camiseta deportiva de la marca Nike, ideal para entrenamientos', 1),
('Zapatillas Adidas', 2, 80, 30, 'Zapatillas deportivas Adidas, cómodas y resistentes', 2),
('Mochila Puma', 3, 40, 20, 'Mochila Puma con gran capacidad y diseño moderno', 3),
('Pesas 10kg', 4, 60, 15, 'Juego de pesas de 10kg para entrenamiento de fuerza', 4),
('Proteina Whey', 5, 45, 25, 'Proteína Whey de alta calidad para recuperación muscular', 5);

INSERT INTO pedido (correo_electronico, fecha_pedido, fecha_entrega) VALUES
('juan@sportshop.com', '2026-02-01', '2026-02-05'),
('ana@sportshop.com', '2026-02-02', '2026-02-06'),
('admin@sportshop.com', '2026-02-03', '2026-02-07'),
('lucia@sportshop.com', '2026-02-04', '2026-02-08'),
('pedro@sportshop.com', '2026-02-05', '2026-02-09');

INSERT INTO detalle (id_pedido, id_producto, precio, unidades) VALUES
(1, 1, 25, 2),
(1, 3, 40, 1),
(2, 2, 80, 1),
(3, 5, 45, 2),
(4, 4, 60, 1);
