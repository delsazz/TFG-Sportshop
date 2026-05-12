ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS direccion_calle VARCHAR(150),
    ADD COLUMN IF NOT EXISTS direccion_numero VARCHAR(30),
    ADD COLUMN IF NOT EXISTS direccion_piso VARCHAR(50),
    ADD COLUMN IF NOT EXISTS direccion_ciudad VARCHAR(100),
    ADD COLUMN IF NOT EXISTS direccion_provincia VARCHAR(100),
    ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10);
