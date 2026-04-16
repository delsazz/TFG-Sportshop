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

CREATE TABLE foto (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_foto VARCHAR(100)
);