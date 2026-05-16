CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    role VARCHAR(50) DEFAULT 'cliente'
);

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE talla (
    id_talla INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE foto (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_foto VARCHAR(100)
);

CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo_prenda VARCHAR(50),
    color VARCHAR(50),
    precio DECIMAL(10, 2) NOT NULL,
    stock INT,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria)
);

CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(38, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_usuario INT,
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
);

CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    CONSTRAINT fk_detalle_pedido_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido),
    CONSTRAINT fk_detalle_pedido_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

CREATE TABLE detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_producto INT,
    precio INT,
    unidades INT,
    CONSTRAINT fk_detalle_pedido_legacy
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido),
    CONSTRAINT fk_detalle_producto_legacy
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

CREATE TABLE pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(38, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_pedido INT,
    CONSTRAINT fk_pago_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
);

CREATE TABLE producto_talla (
    id_producto INT NOT NULL,
    id_talla INT NOT NULL,
    stock INT,
    PRIMARY KEY (id_producto, id_talla),
    CONSTRAINT fk_producto_talla_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    CONSTRAINT fk_producto_talla_talla
        FOREIGN KEY (id_talla)
        REFERENCES talla (id_talla)
);

CREATE TABLE roles_usuario (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_roles_usuario_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario),
    CONSTRAINT fk_roles_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles (id_rol)
);

CREATE INDEX idx_producto_categoria ON producto (id_categoria);
CREATE INDEX idx_pedido_usuario ON pedido (id_usuario);
CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido (id_pedido);
CREATE INDEX idx_detalle_pedido_producto ON detalle_pedido (id_producto);
CREATE INDEX idx_pago_pedido ON pago (id_pedido);
CREATE INDEX idx_producto_talla_talla ON producto_talla (id_talla);
