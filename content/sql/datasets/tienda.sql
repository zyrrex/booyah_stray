CREATE TABLE Producto (
  id        INT           NOT NULL,
  nombre    VARCHAR(30)   NOT NULL,
  categoria VARCHAR(20)   NOT NULL,
  precio    DECIMAL(10,2) NOT NULL,
  stock     INT           NOT NULL,
  CONSTRAINT PK_Producto PRIMARY KEY (id)
);

INSERT INTO Producto (id, nombre, categoria, precio, stock) VALUES
(1,  'Arroz 5kg',    'Abarrotes', 22.50, 40),
(2,  'Aceite 1L',    'Abarrotes',  9.90, 25),
(3,  'Leche 1L',     'Lacteos',    4.80, 60),
(4,  'Yogurt 500ml', 'Lacteos',    6.20,  0),
(5,  'Queso 250g',   'Lacteos',   11.00, 12),
(6,  'Gaseosa 2L',   'Bebidas',    7.50, 80),
(7,  'Agua 625ml',   'Bebidas',    1.50, 150),
(8,  'Jugo 1L',      'Bebidas',    5.90, 30),
(9,  'Galletas',     'Snacks',     2.20, 100),
(10, 'Papas fritas', 'Snacks',     3.50, 45),
(11, 'Chocolate',    'Snacks',     4.00,  0),
(12, 'Detergente',   'Limpieza',  14.90, 18);
