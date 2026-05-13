CREATE TABLE provincia (
    id_provincia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_comunidad INT NOT NULL,
    CONSTRAINT fk_provincia_comunidad
        FOREIGN KEY (id_comunidad)
        REFERENCES comunidad_autonoma(id_comunidad)
        ON DELETE CASCADE
);
CREATE INDEX idx_provincia_comunidad ON provincia(id_comunidad);

INSERT INTO provincia (nombre, id_comunidad) VALUES

-- Andalucía (1)
('Almería',1),('Cádiz',1),('Córdoba',1),('Granada',1),('Huelva',1),('Jaén',1),('Málaga',1),('Sevilla',1),

-- Aragón (2)
('Huesca',2),('Teruel',2),('Zaragoza',2),

-- Asturias (3)
('Asturias',3),

-- Baleares (4)
('Illes Balears',4),

-- Canarias (5)
('Las Palmas',5),('Santa Cruz de Tenerife',5),

-- Cantabria (6)
('Cantabria',6),

-- Castilla y León (7)
('Ávila',7),('Burgos',7),('León',7),('Palencia',7),('Salamanca',7),('Segovia',7),('Soria',7),('Valladolid',7),('Zamora',7),

-- Castilla-La Mancha (8)
('Albacete',8),('Ciudad Real',8),('Cuenca',8),('Guadalajara',8),('Toledo',8),

-- Cataluña (9)
('Barcelona',9),('Girona',9),('Lleida',9),('Tarragona',9),

-- Comunidad Valenciana (10)
('Alicante',10),('Castellón',10),('Valencia',10),

-- Extremadura (11)
('Badajoz',11),('Cáceres',11),

-- Galicia (12)
('A Coruña',12),('Lugo',12),('Ourense',12),('Pontevedra',12),

-- Madrid (13)
('Madrid',13),

-- Murcia (14)
('Murcia',14),

-- Navarra (15)
('Navarra',15),

-- País Vasco (16)
('Álava',16),('Gipuzkoa',16),('Bizkaia',16),

-- La Rioja (17)
('La Rioja',17);