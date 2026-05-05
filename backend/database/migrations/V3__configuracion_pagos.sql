USE sportshop;

ALTER TABLE pedido
ADD COLUMN metodo_pago VARCHAR(50);

CREATE TABLE configuracion_pago (
    id INT PRIMARY KEY,
    telefono_bizum VARCHAR(20),
    url_banco_bizum VARCHAR(255),
    titular_transferencia VARCHAR(100),
    iban_transferencia VARCHAR(34),
    concepto_transferencia VARCHAR(100),
    stripe_public_key VARCHAR(255),
    stripe_secret_key VARCHAR(255)
);

INSERT INTO configuracion_pago
(id, telefono_bizum, url_banco_bizum, titular_transferencia, iban_transferencia, concepto_transferencia, stripe_public_key, stripe_secret_key)
VALUES
(1, '600123456', 'https://www.caixabank.es/particular/home/particulares_es.html', 'SportShop', 'ES7620770024003102575766', 'Pedido SportShop', '', '');
