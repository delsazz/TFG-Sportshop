UPDATE usuario
SET password = '$2a$10$UAbyjhefgY2NfQR6iGso/.Xb8ozB823eNoTWuBwg5.hMqftYvBLSy'
WHERE email IN (
    'juan@sportshop.com',
    'ana@sportshop.com',
    'admin@sportshop.com',
    'lucia@sportshop.com',
    'pedro@sportshop.com'
)
AND password = '1234';
