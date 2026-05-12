UPDATE usuario
SET password = '$2a$10$UAbyjhefgY2NfQR6iGso/.Xb8ozB823eNoTWuBwg5.hMqftYvBLSy'
WHERE email IN (
    'juan@dotex.com',
    'ana@dotex.com',
    'carlos@dotex.com',
    'maria@dotex.com'
)
AND password = '1234';
