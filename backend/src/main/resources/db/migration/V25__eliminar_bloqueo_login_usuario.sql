ALTER TABLE usuario
    DROP COLUMN IF EXISTS login_intentos_fallidos,
    DROP COLUMN IF EXISTS login_bloqueado,
    DROP COLUMN IF EXISTS login_desbloqueo_token;
