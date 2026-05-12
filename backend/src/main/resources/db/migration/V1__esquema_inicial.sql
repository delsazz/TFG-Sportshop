CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    role VARCHAR(50) DEFAULT 'alumno'
);

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE talla (
    id_talla SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo_prenda VARCHAR(50),
    color VARCHAR(50),
    precio NUMERIC(10, 2) NOT NULL,
    stock INTEGER,
    id_categoria INTEGER NOT NULL,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria)
);

CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total NUMERIC(38, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_usuario INTEGER,
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
);

CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    CONSTRAINT fk_detalle_pedido_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido),
    CONSTRAINT fk_detalle_pedido_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_pago DATE NOT NULL,
    monto NUMERIC(38, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_pedido INTEGER,
    CONSTRAINT fk_pago_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
);

CREATE TABLE producto_talla (
    id_producto INTEGER NOT NULL,
    id_talla INTEGER NOT NULL,
    stock INTEGER,
    PRIMARY KEY (id_producto, id_talla),
    CONSTRAINT fk_producto_talla_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    CONSTRAINT fk_producto_talla_talla
        FOREIGN KEY (id_talla)
        REFERENCES talla (id_talla)
);

CREATE TABLE roles_usuario (
    id_usuario INTEGER NOT NULL,
    id_rol INTEGER NOT NULL,
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
