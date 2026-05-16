CREATE TABLE ciudad (
    id_ciudad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_provincia INT NOT NULL,
    FOREIGN KEY (id_provincia) REFERENCES provincia(id_provincia)
);
CREATE INDEX idx_ciudad_provincia ON ciudad(id_provincia);

INSERT INTO ciudad (nombre, id_provincia) VALUES

-- ANDALUCÍA (1-8)
('Almería',1),('El Ejido',1),('Roquetas de Mar',1),('Níjar',1),('Adra',1),('Huércal-Overa',1),('Vera',1),
('Cádiz',2),('Jerez de la Frontera',2),('Algeciras',2),('San Fernando',2),('El Puerto de Santa María',2),('Chiclana de la Frontera',2),('La Línea de la Concepción',2),
('Córdoba',3),('Lucena',3),('Puente Genil',3),('Montilla',3),('Priego de Córdoba',3),('Cabra',3),('Baena',3),
('Granada',4),('Motril',4),('Almuñécar',4),('Baza',4),('Guadix',4),('Loja',4),('Armilla',4),
('Huelva',5),('Lepe',5),('Moguer',5),('Almonte',5),('Isla Cristina',5),('Ayamonte',5),('Bollullos Par del Condado',5),
('Jaén',6),('Linares',6),('Úbeda',6),('Andújar',6),('Martos',6),('Alcalá la Real',6),('Baeza',6),
('Málaga',7),('Marbella',7),('Fuengirola',7),('Torremolinos',7),('Benalmádena',7),('Estepona',7),('Vélez-Málaga',7),
('Sevilla',8),('Dos Hermanas',8),('Alcalá de Guadaíra',8),('Utrera',8),('Mairena del Aljarafe',8),('Écija',8),('La Rinconada',8),

-- ARAGÓN (9-11)
('Huesca',9),('Monzón',9),('Barbastro',9),('Fraga',9),('Jaca',9),('Sabiñánigo',9),('Binéfar',9),
('Teruel',10),('Alcañiz',10),('Calamocha',10),('Andorra',10),('Utrillas',10),('Mora de Rubielos',10),('Alcorisa',10),
('Zaragoza',11),('Calatayud',11),('Ejea de los Caballeros',11),('Utebo',11),('Tarazona',11),('Cuarte de Huerva',11),('La Almunia de Doña Godina',11),

-- ASTURIAS (12)
('Oviedo',12),('Gijón',12),('Avilés',12),('Mieres',12),('Langreo',12),('Siero',12),('Cangas del Narcea',12),

-- BALEARES (13)
('Palma',13),('Ibiza',13),('Manacor',13),('Inca',13),('Calvià',13),('Maó',13),('Llucmajor',13),

-- CANARIAS (14-15)
('Las Palmas de Gran Canaria',14),('Telde',14),('Arrecife',14),('Santa Lucía de Tirajana',14),('San Bartolomé de Tirajana',14),('Arucas',14),('Ingenio',14),
('Santa Cruz de Tenerife',15),('La Laguna',15),('Arona',15),('Adeje',15),('La Orotava',15),('Los Realejos',15),('Puerto de la Cruz',15),

-- CANTABRIA (16)
('Santander',16),('Torrelavega',16),('Castro Urdiales',16),('Camargo',16),('Piélagos',16),('Laredo',16),('Santoña',16),

-- CASTILLA Y LEÓN (17-25)
('Ávila',17),('Arenas de San Pedro',17),('Arévalo',17),('Navas del Marqués',17),('Candeleda',17),('El Tiemblo',17),('Cebreros',17),
('Burgos',18),('Miranda de Ebro',18),('Aranda de Duero',18),('Briviesca',18),('Medina de Pomar',18),('Lerma',18),('Villarcayo',18),
('León',19),('Ponferrada',19),('San Andrés del Rabanedo',19),('Villaquilambre',19),('Astorga',19),('La Bañeza',19),('Villablino',19),
('Palencia',20),('Aguilar de Campoo',20),('Venta de Baños',20),('Guardo',20),('Saldaña',20),('Dueñas',20),('Cervera de Pisuerga',20),
('Salamanca',21),('Ciudad Rodrigo',21),('Béjar',21),('Santa Marta de Tormes',21),('Guijuelo',21),('Peñaranda de Bracamonte',21),('Vitigudino',21),
('Segovia',22),('Cuéllar',22),('El Espinar',22),('Cantalejo',22),('Nava de la Asunción',22),('Sepúlveda',22),('San Ildefonso',22),
('Soria',23),('Almazán',23),('Burgo de Osma',23),('Ólvega',23),('San Esteban de Gormaz',23),('Arcos de Jalón',23),('Golmayo',23),
('Valladolid',24),('Medina del Campo',24),('Laguna de Duero',24),('Tordesillas',24),('Cistérniga',24),('Íscar',24),('Peñafiel',24),
('Zamora',25),('Benavente',25),('Toro',25),('Morales del Vino',25),('Puebla de Sanabria',25),('Villalpando',25),('Fuentesaúco',25),

-- CASTILLA-LA MANCHA (26-30)
('Albacete',26),('Hellín',26),('Villarrobledo',26),('Almansa',26),('La Roda',26),('Caudete',26),('Tobarra',26),
('Ciudad Real',27),('Puertollano',27),('Tomelloso',27),('Valdepeñas',27),('Alcázar de San Juan',27),('Miguelturra',27),('Manzanares',27),
('Cuenca',28),('Tarancón',28),('Motilla del Palancar',28),('San Clemente',28),('Quintanar del Rey',28),('Mota del Cuervo',28),('Iniesta',28),
('Guadalajara',29),('Azuqueca de Henares',29),('Alovera',29),('Marchamalo',29),('Cabanillas del Campo',29),('Sigüenza',29),('El Casar',29),
('Toledo',30),('Talavera de la Reina',30),('Illescas',30),('Seseña',30),('Ocaña',30),('Torrijos',30),('Yuncos',30),

-- CATALUÑA (31-34)
('Barcelona',31),('Badalona',31),('Hospitalet de Llobregat',31),('Sabadell',31),('Terrassa',31),('Mataró',31),('Granollers',31),
('Girona',32),('Figueres',32),('Blanes',32),('Lloret de Mar',32),('Olot',32),('Salt',32),('Palafrugell',32),
('Lleida',33),('Tàrrega',33),('Balaguer',33),('Mollerussa',33),('Cervera',33),('La Seu d’Urgell',33),('Solsona',33),
('Tarragona',34),('Reus',34),('Tortosa',34),('Cambrils',34),('Salou',34),('Valls',34),('El Vendrell',34),

-- COMUNIDAD VALENCIANA (35-37)
('Alicante',35),('Elche',35),('Benidorm',35),('Torrevieja',35),('Elda',35),('Orihuela',35),('Alcoy',35),
('Castellón de la Plana',36),('Vila-real',36),('Burriana',36),('Vinaròs',36),('La Vall d’Uixó',36),('Onda',36),('Benicarló',36),
('Valencia',37),('Gandía',37),('Torrent',37),('Paterna',37),('Sagunto',37),('Alzira',37),('Xàtiva',37),

-- EXTREMADURA (38-39)
('Badajoz',38),('Mérida',38),('Don Benito',38),('Almendralejo',38),('Zafra',38),('Villanueva de la Serena',38),('Olivenza',38),
('Cáceres',39),('Plasencia',39),('Navalmoral de la Mata',39),('Trujillo',39),('Coria',39),('Miajadas',39),('Talayuela',39),

-- GALICIA (40-43)
('A Coruña',40),('Santiago de Compostela',40),('Ferrol',40),('Narón',40),('Oleiros',40),('Arteixo',40),('Carballo',40),
('Lugo',41),('Monforte de Lemos',41),('Viveiro',41),('Sarria',41),('Vilalba',41),('Ribadeo',41),('Foz',41),
('Ourense',42),('O Barco de Valdeorras',42),('Verín',42),('Xinzo de Limia',42),('Carballiño',42),('Allariz',42),('Barbadás',42),
('Pontevedra',43),('Vigo',43),('Vilagarcía de Arousa',43),('Marín',43),('Ponteareas',43),('Redondela',43),('Tui',43),

-- MADRID (44)
('Madrid',44),('Móstoles',44),('Alcalá de Henares',44),('Fuenlabrada',44),('Leganés',44),('Getafe',44),('Alcorcón',44),

-- MURCIA (45)
('Murcia',45),('Cartagena',45),('Lorca',45),('Molina de Segura',45),('Alcantarilla',45),('Yecla',45),('San Javier',45),

-- NAVARRA (46)
('Pamplona',46),('Tudela',46),('Barañáin',46),('Estella',46),('Burlada',46),('Zizur Mayor',46),('Tafalla',46),

-- PAÍS VASCO (47-49)
('Vitoria-Gasteiz',47),('Llodio',47),('Amurrio',47),('Salvatierra',47),('Oyón',47),('Agurain',47),('Zigoitia',47),
('San Sebastián',48),('Irun',48),('Eibar',48),('Errenteria',48),('Zarautz',48),('Hernani',48),('Tolosa',48),
('Bilbao',49),('Barakaldo',49),('Getxo',49),('Portugalete',49),('Santurtzi',49),('Basauri',49),('Durango',49),

-- LA RIOJA (50)
('Logroño',50),('Calahorra',50),('Arnedo',50),('Alfaro',50),('Har o',50),('Nájera',50),('Lardero',50);