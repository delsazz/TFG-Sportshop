-- Crear la tabla token_cambio_contrasena


CREATE TABLE token_cambio_contrasena (
    id_token SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    codigo_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_uso TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_token_cambio_contrasena_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE
);

CREATE INDEX idx_token_cambio_contrasena_usuario
    ON token_cambio_contrasena (id_usuario);
CREATE INDEX idx_token_cambio_contrasena_expiracion
    ON token_cambio_contrasena (fecha_expiracion);
