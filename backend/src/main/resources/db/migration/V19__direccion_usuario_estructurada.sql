ALTER TABLE usuario
    ADD COLUMN direccion_calle VARCHAR(150),
    ADD COLUMN direccion_numero VARCHAR(30),
    ADD COLUMN direccion_piso VARCHAR(50),
    ADD COLUMN direccion_ciudad VARCHAR(100),
    ADD COLUMN direccion_provincia VARCHAR(100),
    ADD COLUMN codigo_postal VARCHAR(10);
