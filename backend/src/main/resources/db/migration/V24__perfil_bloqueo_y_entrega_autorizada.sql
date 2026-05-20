ALTER TABLE usuario
    ADD COLUMN avatar_url VARCHAR(255),
    ADD COLUMN login_intentos_fallidos INT NOT NULL DEFAULT 0,
    ADD COLUMN login_bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN login_desbloqueo_token VARCHAR(80);

ALTER TABLE pedido_entrega
    ADD COLUMN tipo_receptor VARCHAR(30),
    ADD COLUMN autorizante_nombre VARCHAR(180),
    ADD COLUMN autorizante_documento VARCHAR(30),
    ADD COLUMN texto_autorizacion VARCHAR(500);
