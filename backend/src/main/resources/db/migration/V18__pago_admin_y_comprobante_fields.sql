ALTER TABLE pago
    ADD COLUMN comprobante_url VARCHAR(500),
    ADD COLUMN comprobante_nombre_archivo VARCHAR(255),
    ADD COLUMN fecha_confirmacion DATE,
    ADD COLUMN notas_admin VARCHAR(500);
