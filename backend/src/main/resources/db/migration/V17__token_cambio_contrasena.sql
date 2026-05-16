CREATE TABLE token_cambio_contrasena (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    codigo_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_uso TIMESTAMP NULL,
    CONSTRAINT fk_token_cambio_contrasena_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE
);

CREATE INDEX idx_token_cambio_contrasena_usuario
    ON token_cambio_contrasena (id_usuario);
CREATE INDEX idx_token_cambio_contrasena_expiracion
    ON token_cambio_contrasena (fecha_expiracion);
