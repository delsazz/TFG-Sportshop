ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS login_intentos_fallidos INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS login_bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS login_desbloqueo_token VARCHAR(80);

ALTER TABLE pedido_entrega
    ADD COLUMN IF NOT EXISTS tipo_receptor VARCHAR(30),
    ADD COLUMN IF NOT EXISTS autorizante_nombre VARCHAR(180),
    ADD COLUMN IF NOT EXISTS autorizante_documento VARCHAR(30),
    ADD COLUMN IF NOT EXISTS texto_autorizacion VARCHAR(500);