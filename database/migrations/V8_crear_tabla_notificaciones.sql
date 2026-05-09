-- Crear tabla de notificaciones


CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_pedido INTEGER,
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),    
    CONSTRAINT fk_notificaciones_pedido  FOREIGN KEY (id_pedido)  REFERENCES pedido (id_pedido)     
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones (id_usuario);
CREATE INDEX idx_notificaciones_pedido ON notificaciones (id_pedido);
CREATE INDEX idx_notificaciones_fecha ON notificaciones (fecha_envio);