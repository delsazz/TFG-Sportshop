CREATE TABLE configuracion_sitio (
    id_configuracion SERIAL PRIMARY KEY,
    logo_header_url VARCHAR(500) NOT NULL DEFAULT '/img/campusfp.png',
    logo_footer_url VARCHAR(500) NOT NULL DEFAULT '/img/campusfp.png',
    logo_login_url VARCHAR(500) NOT NULL DEFAULT '/img/campusfp.png',
    logo_home_url VARCHAR(500) NOT NULL DEFAULT '/img/campusfp.png',
    logo_admin_url VARCHAR(500) NOT NULL DEFAULT '/img/campusfp.png',
    bizum_telefono VARCHAR(50) NOT NULL DEFAULT '+34 600 000 000',
    bizum_banco_url VARCHAR(500) NOT NULL DEFAULT 'https://www.bizum.es/bancos-bizum/',
    transferencia_titular VARCHAR(150) NOT NULL DEFAULT 'Campus FP Uniformes',
    transferencia_iban VARCHAR(50) NOT NULL DEFAULT 'ES00 0000 0000 0000 0000 0000',
    transferencia_concepto VARCHAR(255) NOT NULL DEFAULT 'Pedido {pedidoId} - Campus FP Uniformes',
    transferencia_notas VARCHAR(500) NOT NULL DEFAULT 'Envia el justificante desde la pantalla de confirmacion del pedido.',
    tarjeta_habilitada BOOLEAN NOT NULL DEFAULT false,
    bizum_habilitado BOOLEAN NOT NULL DEFAULT true,
    transferencia_habilitada BOOLEAN NOT NULL DEFAULT true,
    mostrador_habilitado BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO configuracion_sitio (
    logo_header_url,
    logo_footer_url,
    logo_login_url,
    logo_home_url,
    logo_admin_url,
    bizum_telefono,
    bizum_banco_url,
    transferencia_titular,
    transferencia_iban,
    transferencia_concepto,
    transferencia_notas,
    tarjeta_habilitada,
    bizum_habilitado,
    transferencia_habilitada,
    mostrador_habilitado
)
SELECT
    '/img/campusfp.png',
    '/img/campusfp.png',
    '/img/campusfp.png',
    '/img/campusfp.png',
    '/img/campusfp.png',
    '+34 600 000 000',
    'https://www.bizum.es/bancos-bizum/',
    'Campus FP Uniformes',
    'ES00 0000 0000 0000 0000 0000',
    'Pedido {pedidoId} - Campus FP Uniformes',
    'Envia el justificante desde la pantalla de confirmacion del pedido.',
    false,
    true,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM configuracion_sitio
);

