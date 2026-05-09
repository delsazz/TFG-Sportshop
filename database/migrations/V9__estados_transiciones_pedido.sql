-- Crear la tabla pedido_estado


CREATE TABLE pedido_estado (
    codigo VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    estado_final BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear la tabla pedido_estado_transicion


CREATE TABLE pedido_estado_transicion (
    estado_origen VARCHAR(50) NOT NULL,
    estado_destino VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    requiere_entrega BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (estado_origen, estado_destino),
    CONSTRAINT fk_pedido_estado_transicion_origen
        FOREIGN KEY (estado_origen)
        REFERENCES pedido_estado (codigo),
    CONSTRAINT fk_pedido_estado_transicion_destino
        FOREIGN KEY (estado_destino)
        REFERENCES pedido_estado (codigo),
    CONSTRAINT chk_pedido_estado_transicion_distinta
        CHECK (estado_origen <> estado_destino)
);

-- Insertar datos en la tabla pedido_estado


INSERT INTO pedido_estado (codigo, nombre, descripcion, estado_final, orden) VALUES
    ('PENDIENTE', 'Pendiente', 'Pedido registrado pendiente de pago o preparacion', FALSE, 10),
    ('PAGADO', 'Pagado', 'Pago confirmado y pedido listo para preparacion', FALSE, 20),
    ('EN_PREPARACION', 'En preparacion', 'Pedido en preparacion por administracion', FALSE, 30),
    ('ENVIADO', 'Enviado', 'Pedido enviado o disponible para entrega', FALSE, 40),
    ('ENTREGADO_PARCIAL', 'Entregado parcial', 'Pedido con parte de sus lineas entregadas', FALSE, 50),
    ('ENTREGADO_COMPLETO', 'Entregado completo', 'Pedido entregado completamente', TRUE, 60),
    ('CANCELADO', 'Cancelado', 'Pedido cancelado antes de completarse', TRUE, 70);

-- Insertar datos en la tabla pedido_estado_transicion


INSERT INTO pedido_estado_transicion (estado_origen, estado_destino, descripcion, requiere_entrega) VALUES
    ('PENDIENTE', 'PAGADO', 'Confirmacion del pago del pedido', FALSE),
    ('PENDIENTE', 'EN_PREPARACION', 'Preparacion iniciada antes de registrar el pago', FALSE),
    ('PENDIENTE', 'CANCELADO', 'Cancelacion de un pedido pendiente', FALSE),
    ('PAGADO', 'EN_PREPARACION', 'Inicio de preparacion tras pago', FALSE),
    ('PAGADO', 'ENVIADO', 'Envio de pedido pagado sin paso intermedio', FALSE),
    ('PAGADO', 'ENTREGADO_PARCIAL', 'Primera entrega parcial de pedido pagado', TRUE),
    ('PAGADO', 'ENTREGADO_COMPLETO', 'Entrega completa de pedido pagado', TRUE),
    ('PAGADO', 'CANCELADO', 'Cancelacion de un pedido pagado', FALSE),
    ('EN_PREPARACION', 'ENVIADO', 'Pedido preparado y enviado', FALSE),
    ('EN_PREPARACION', 'ENTREGADO_PARCIAL', 'Entrega parcial desde preparacion', TRUE),
    ('EN_PREPARACION', 'ENTREGADO_COMPLETO', 'Entrega completa desde preparacion', TRUE),
    ('EN_PREPARACION', 'CANCELADO', 'Cancelacion durante la preparacion', FALSE),
    ('ENVIADO', 'ENTREGADO_PARCIAL', 'Entrega parcial de pedido enviado', TRUE),
    ('ENVIADO', 'ENTREGADO_COMPLETO', 'Entrega completa de pedido enviado', TRUE),
    ('ENTREGADO_PARCIAL', 'ENTREGADO_COMPLETO', 'Entrega de las lineas pendientes', TRUE);

-- Actualizar el campo estado de la tabla pedido 


UPDATE pedido
SET estado = CASE
    WHEN LOWER(TRIM(estado)) = 'pendiente' THEN 'PENDIENTE'
    WHEN LOWER(TRIM(estado)) = 'pagado' THEN 'PAGADO'
    WHEN LOWER(TRIM(estado)) IN ('en_preparacion', 'en preparacion') THEN 'EN_PREPARACION'
    WHEN LOWER(TRIM(estado)) = 'enviado' THEN 'ENVIADO'
    WHEN LOWER(TRIM(estado)) IN ('entregado_parcial', 'entregado parcial') THEN 'ENTREGADO_PARCIAL'
    WHEN LOWER(TRIM(estado)) IN ('entregado_completo', 'entregado completo', 'entregado', 'completado') THEN 'ENTREGADO_COMPLETO'
    WHEN LOWER(TRIM(estado)) = 'cancelado' THEN 'CANCELADO'
    ELSE estado
END;

-- Actualizar la tabla pedido


ALTER TABLE pedido

    -- Actualizar la columna estado para establecer "PENDIENTE" como valor por defecto y agregar la restriccion de clave foranea

    
    ALTER COLUMN estado SET DEFAULT 'PENDIENTE',
    ADD CONSTRAINT fk_pedido_estado
        FOREIGN KEY (estado)
        REFERENCES pedido_estado (codigo);

CREATE INDEX idx_pedido_estado ON pedido (estado);
CREATE INDEX idx_pedido_estado_transicion_destino ON pedido_estado_transicion (estado_destino);
