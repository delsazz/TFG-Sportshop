USE sportshop;

ALTER TABLE producto
ADD COLUMN tallas VARCHAR(100);

ALTER TABLE categoria
ADD COLUMN nombre_foto VARCHAR(100);

UPDATE producto SET tallas = 'S, M, L, XL' WHERE nombre = 'Camiseta Nike';
UPDATE producto SET tallas = '39, 40, 41, 42, 43' WHERE nombre = 'Zapatillas Adidas';
UPDATE producto SET tallas = 'Unica' WHERE nombre = 'Mochila Puma';
UPDATE producto SET tallas = '10 kg' WHERE nombre = 'Pesas 10kg';
UPDATE producto SET tallas = '1 kg' WHERE nombre = 'Proteina Whey';
