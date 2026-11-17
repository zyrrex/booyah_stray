CREATE TABLE Alumno (
  id     INT         NOT NULL,
  nombre VARCHAR(30) NOT NULL,
  edad   INT         NOT NULL,
  grado  VARCHAR(10) NOT NULL,
  nota   INT         NULL,
  correo VARCHAR(40) NULL,
  CONSTRAINT PK_Alumno PRIMARY KEY (id)
);

INSERT INTO Alumno (id, nombre, edad, grado, nota, correo) VALUES
(1,  'Ana Torres',   15, '3ro', 17, 'ana@colegio.pe'),
(2,  'Luis Rojas',   16, '4to', 12, NULL),
(3,  'Rosa Quispe',  15, '3ro', 19, 'rosa@colegio.pe'),
(4,  'Pedro Salas',  17, '5to',  8, 'pedro@colegio.pe'),
(5,  'Eva Lima',     16, '4to', NULL, NULL),
(6,  'Carlos Vega',  15, '3ro', 14, 'carlos@colegio.pe'),
(7,  'Marta Ruiz',   17, '5to', 16, NULL),
(8,  'Diego Paz',    16, '4to', 12, 'diego@colegio.pe'),
(9,  'Lucia Mora',   15, '3ro', NULL, 'lucia@colegio.pe'),
(10, 'Jose Cruz',    17, '5to', 11, 'jose@colegio.pe');
