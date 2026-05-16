ALTER TABLE producto ADD COLUMN imagen VARCHAR(255);

UPDATE producto
SET imagen = CASE nombre
    WHEN 'Camiseta Nike' THEN '/img/productos/camiseta_nike.jpg'
    WHEN 'Zapatillas Adidas' THEN '/img/productos/zapatillas_adidas.jpg'
    WHEN 'Mochila Puma' THEN '/img/productos/mochila_puma.jpg'
    WHEN 'Pesas 10kg' THEN '/img/productos/pesas_10kg.jpg'
    WHEN 'Proteina Whey' THEN '/img/productos/proteina_whey.jpg'
    ELSE imagen
END
WHERE imagen IS NULL;
