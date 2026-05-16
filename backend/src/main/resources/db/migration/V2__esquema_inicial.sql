CREATE TABLE pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    stripe_session_id VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    monto INT NOT NULL,
    fecha_pago DATETIME,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

CREATE TABLE password_reset_token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (correo_electronico) REFERENCES usuario(email)
);

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    precio INT NULL,
    unidades INT NULL,
    CONSTRAINT fk_detalle_pedido_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido),
    CONSTRAINT fk_detalle_pedido_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

CREATE TABLE talla (
    id_talla INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
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
