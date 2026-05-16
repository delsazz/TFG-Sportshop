CREATE TABLE notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_pedido INT NOT NULL,
    canal VARCHAR(30) NOT NULL DEFAULT 'APP',
    titulo VARCHAR(150) NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    estado_pedido VARCHAR(50) NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email_destinatario VARCHAR(150),
    email_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_email TIMESTAMP NULL,
    error_email VARCHAR(500),
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_notificacion_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido)
        ON DELETE CASCADE
);

CREATE INDEX idx_notificacion_usuario_fecha ON notificacion (id_usuario, fecha_envio);
CREATE INDEX idx_notificacion_usuario_leida ON notificacion (id_usuario, leida);
CREATE INDEX idx_notificacion_pedido ON notificacion (id_pedido);
