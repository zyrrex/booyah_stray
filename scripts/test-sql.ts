// Pruebas del simulador T-SQL:  npm run test:sql
// Cada caso compara contra el comportamiento conocido de SQL Server (resultados y numeros de error).

import { runSql } from '../src/sql/index.ts'

let fails = 0
let total = 0

function t(name: string, code: string, expect: string[], opts: { setup?: string; post?: string } = {}) {
  total++
  const r = runSql(code, opts)
  const got = r.lines
  if (JSON.stringify(got) !== JSON.stringify(expect)) {
    fails++
    console.error(`✖ ${name}\n   esperado: ${JSON.stringify(expect)}\n   obtenido: ${JSON.stringify(got)}`)
    for (const e of r.errors) console.error(`   error ${e.num}: ${e.text}`)
  }
}

const base = `
CREATE TABLE Cliente (
  id INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(20) NOT NULL,
  edad INT NULL,
  CONSTRAINT PK_Cliente PRIMARY KEY (id)
);
INSERT INTO Cliente (nombre, edad) VALUES ('Ana', 30), ('Luis', 25), ('Rosa', NULL);
`

t('identity + select', 'SELECT id, nombre FROM Cliente', ['id | nombre', '1 | Ana', '2 | Luis', '3 | Rosa'], { setup: base })
t('where CI', "SELECT nombre FROM Cliente WHERE nombre = 'ANA'", ['nombre', 'Ana'], { setup: base })
t('is null', 'SELECT nombre FROM Cliente WHERE edad IS NULL', ['nombre', 'Rosa'], { setup: base })
t('NULL no es = NULL', 'SELECT nombre FROM Cliente WHERE edad = NULL', ['nombre'], { setup: base })
t('not in con null', "SELECT nombre FROM Cliente WHERE edad NOT IN (30, NULL)", ['nombre'], { setup: base })
t('between', 'SELECT nombre FROM Cliente WHERE edad BETWEEN 25 AND 30 ORDER BY nombre', ['nombre', 'Ana', 'Luis'], { setup: base })
t('like', "SELECT nombre FROM Cliente WHERE nombre LIKE '_u%'", ['nombre', 'Luis'], { setup: base })
t('order desc + top', 'SELECT TOP 2 nombre FROM Cliente ORDER BY edad DESC', ['nombre', 'Ana', 'Luis'], { setup: base })
t('nulls primero asc', 'SELECT TOP 1 nombre FROM Cliente ORDER BY edad', ['nombre', 'Rosa'], { setup: base })
t('offset fetch', 'SELECT nombre FROM Cliente ORDER BY nombre OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY', ['nombre', 'Luis'], { setup: base })
t('count star y count col', 'SELECT COUNT(*) AS t, COUNT(edad) AS c FROM Cliente', ['t | c', '3 | 2'], { setup: base })
t('sum avg min max enteros', 'SELECT SUM(edad), AVG(edad), MIN(edad), MAX(edad) FROM Cliente', ['(No column name) | (No column name) | (No column name) | (No column name)', '55 | 27 | 25 | 30'], { setup: base })
t('group by', "SELECT edad, COUNT(*) AS n FROM Cliente GROUP BY edad ORDER BY edad", ['edad | n', 'NULL | 1', '25 | 1', '30 | 1'], { setup: base })
t('group by sin agregado = 8120', 'SELECT nombre, COUNT(*) FROM Cliente', ['Error 8120'], { setup: base })
t('aggregate where = 147', 'SELECT nombre FROM Cliente WHERE COUNT(*) > 1', ['Error 147'], { setup: base })
t('distinct', "SELECT DISTINCT estado FROM (SELECT 1) x", ['Error 0'], { setup: base })

t('pk duplicada 2627', "INSERT INTO Cliente (id, nombre) VALUES (1, 'X')", ['Error 544'], { setup: base })
t('pk dup', `CREATE TABLE P (codigo INT PRIMARY KEY, n VARCHAR(5)); INSERT INTO P VALUES (1,'a'); INSERT INTO P VALUES (1,'b'); SELECT * FROM P`, ['Error 2627', 'codigo | n', '1 | a'])
t('not null 515', "INSERT INTO Cliente (nombre) VALUES (NULL)", ['Error 515'], { setup: base })
t('truncation 8152', "INSERT INTO Cliente (nombre) VALUES ('Nombre demasiado largo para')", ['Error 8152'], { setup: base })
t('conversion 245', "INSERT INTO Cliente (nombre, edad) VALUES ('Z', 'abc')", ['Error 245'], { setup: base })
t('count mismatch 213', "INSERT INTO Cliente VALUES ('a', 1, 2)", ['Error 213'], { setup: base })
t('insert sin columnas omite identity', "INSERT INTO Cliente VALUES ('Eva', 40); SELECT COUNT(*) FROM Cliente", ['(No column name)', '4'], { setup: base })
t('identity tras delete sigue', "DELETE FROM Cliente; INSERT INTO Cliente (nombre) VALUES ('N'); SELECT id FROM Cliente", ['id', '4'], { setup: base })
t('identity tras truncate reinicia', "TRUNCATE TABLE Cliente; INSERT INTO Cliente (nombre) VALUES ('N'); SELECT id FROM Cliente", ['id', '1'], { setup: base })
t('identity se consume en insert fallido', "INSERT INTO Cliente (nombre) VALUES (NULL); INSERT INTO Cliente (nombre) VALUES ('N'); SELECT MAX(id) FROM Cliente", ['Error 515', '(No column name)', '5'], { setup: base })
t('update sin where', "UPDATE Cliente SET edad = 99; SELECT edad FROM Cliente", ['edad', '99', '99', '99'], { setup: base })
t('update con where', "UPDATE Cliente SET edad = edad + 1 WHERE nombre = 'Luis'; SELECT edad FROM Cliente WHERE id = 2", ['edad', '26'], { setup: base })
t('delete where', "DELETE FROM Cliente WHERE edad < 30; SELECT COUNT(*) FROM Cliente", ['(No column name)', '2'], { setup: base })

const rel = `
CREATE TABLE Categoria (id INT PRIMARY KEY, nombre VARCHAR(20) NOT NULL);
CREATE TABLE Producto (
  id INT PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria_id INT NOT NULL,
  CONSTRAINT FK_Producto_Categoria FOREIGN KEY (categoria_id) REFERENCES Categoria(id)
);
INSERT INTO Categoria VALUES (1,'Bebidas'),(2,'Snacks');
INSERT INTO Producto VALUES (1,'Cola',3.50,1),(2,'Papas',2.25,2),(3,'Agua',1.00,1);
`
t('fk insert 547', "INSERT INTO Producto VALUES (9,'X',1.00,99)", ['Error 547'], { setup: rel })
t('fk delete 547', 'DELETE FROM Categoria WHERE id = 1', ['Error 547'], { setup: rel })
t('fk delete ok', 'DELETE FROM Categoria WHERE id = 2; DELETE FROM Producto WHERE categoria_id = 2; DELETE FROM Categoria WHERE id = 2; SELECT COUNT(*) FROM Categoria', ['Error 547', '(No column name)', '1'], { setup: rel })
t('drop referenciada 3726', 'DROP TABLE Categoria', ['Error 3726'], { setup: rel })
t('truncate referenciada 4712', 'TRUNCATE TABLE Categoria', ['Error 4712'], { setup: rel })
t('decimal formato', 'SELECT precio FROM Producto ORDER BY id', ['precio', '3.50', '2.25', '1.00'], { setup: rel })
t('decimal * literal', 'SELECT precio * 2 AS doble, precio * 1.1 AS mas FROM Producto WHERE id = 1', ['doble | mas', '7.00 | 3.850'], { setup: rel })
t('sum decimal', 'SELECT SUM(precio) AS total FROM Producto', ['total', '6.75'], { setup: rel })
t('avg decimal 6 decimales', 'SELECT AVG(precio) AS media FROM Producto', ['media', '2.250000'], { setup: rel })
t('division entera', 'SELECT 7 / 2 AS a, 7 % 2 AS b, 7 / 2.0 AS c', ['a | b | c', '3 | 1 | 3.500000'])
t('div cero 8134', 'SELECT 1 / 0', ['Error 8134'])
t('concat con int 245', "SELECT 'Edad: ' + 30", ['Error 245'])
t('concat ok', "SELECT 'Edad: ' + CAST(30 AS VARCHAR(5)) AS x", ['x', 'Edad: 30'])
t('upper/len', "SELECT UPPER('hola') AS a, LEN('hola  ') AS b", ['a | b', 'HOLA | 4'])
t('isnull', "SELECT ISNULL(edad, 0) AS e FROM Cliente WHERE nombre = 'Rosa'", ['e', '0'], { setup: base })

t('sintaxis aborta el lote', "SELECT 1; SELEC 2", ['Error 102'])
t('keyword 156', 'SELECT FROM Cliente', ['Error 156'], { setup: base })
t('tabla inexistente 208', 'SELECT * FROM NoExiste', ['Error 208'])
t('columna inexistente 207', 'SELECT zzz FROM Cliente', ['Error 207'], { setup: base })
t('join aun no', 'SELECT * FROM Producto p INNER JOIN Categoria c ON p.categoria_id = c.id', ['Error 0'], { setup: rel })

t('alter add not null con filas 4901', 'ALTER TABLE Cliente ADD dni CHAR(8) NOT NULL', ['Error 4901'], { setup: base })
t('alter add null', 'ALTER TABLE Cliente ADD dni CHAR(8) NULL; SELECT dni FROM Cliente WHERE id = 1', ['dni', 'NULL'], { setup: base })
t('alter add default', "ALTER TABLE Cliente ADD pais VARCHAR(10) NOT NULL DEFAULT 'Peru'; SELECT pais FROM Cliente WHERE id = 1", ['pais', 'Peru'], { setup: base })
t('alter column', "ALTER TABLE Cliente ALTER COLUMN nombre VARCHAR(50) NOT NULL; SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cliente' AND COLUMN_NAME = 'nombre'", ['CHARACTER_MAXIMUM_LENGTH', '50'], { setup: base })
t('alter column sin null vuelve nullable', "ALTER TABLE Cliente ALTER COLUMN nombre VARCHAR(50); SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cliente' AND COLUMN_NAME = 'nombre'", ['IS_NULLABLE', 'YES'], { setup: base })
t('drop column', 'ALTER TABLE Cliente DROP COLUMN edad; SELECT * FROM Cliente WHERE id = 1', ['id | nombre', '1 | Ana'], { setup: base })
t('drop column pk 5074', 'ALTER TABLE Cliente DROP COLUMN id', ['Error 5074'], { setup: base })
t('sp_rename tabla', "EXEC sp_rename 'Cliente', 'Persona'; SELECT COUNT(*) FROM Persona", ['(No column name)', '3'], { setup: base })
t('sp_rename columna', "EXEC sp_rename 'Cliente.nombre', 'nombres', 'COLUMN'; SELECT nombres FROM Cliente WHERE id = 1", ['nombres', 'Ana'], { setup: base })
t('drop table', 'DROP TABLE Cliente; SELECT * FROM Cliente', ['Error 208'], { setup: base })
t('create existente 2714', 'CREATE TABLE Cliente (a INT)', ['Error 2714'], { setup: base })
t('info schema constraints', "SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'Cliente'", ['CONSTRAINT_NAME | CONSTRAINT_TYPE', 'PK_Cliente | PRIMARY KEY'], { setup: base })
t('pk compuesta', `CREATE TABLE Nota (alumno INT, curso INT, nota INT, PRIMARY KEY (alumno, curso)); INSERT INTO Nota VALUES (1,1,15),(1,2,18); INSERT INTO Nota VALUES (1,1,10); SELECT COUNT(*) FROM Nota`, ['Error 2627', '(No column name)', '2'])
t('unique', `CREATE TABLE U (id INT PRIMARY KEY, mail VARCHAR(20) UNIQUE); INSERT INTO U VALUES (1,'a@x'); INSERT INTO U VALUES (2,'A@X');`, ['Error 2627'])
t('check', `CREATE TABLE C (id INT PRIMARY KEY, edad INT CHECK (edad >= 0)); INSERT INTO C VALUES (1,-5)`, ['Error 547'])
t('default', `CREATE TABLE D (id INT PRIMARY KEY, estado VARCHAR(10) DEFAULT 'nuevo'); INSERT INTO D (id) VALUES (1); SELECT estado FROM D`, ['estado', 'nuevo'])
t('orden fisico por pk', `CREATE TABLE O (id INT PRIMARY KEY, v CHAR(1)); INSERT INTO O VALUES (3,'c'),(1,'a'),(2,'b'); SELECT id FROM O`, ['id', '1', '2', '3'])
t('multi-insert atomico', `CREATE TABLE M (id INT PRIMARY KEY); INSERT INTO M VALUES (1),(2),(1); SELECT COUNT(*) FROM M`, ['Error 2627', '(No column name)', '0'])
t('go separa lotes', `CREATE TABLE G (a INT)\nGO\nINSERT INTO G VALUES (1)\nGO\nSELECT a FROM G`, ['a', '1'])
t('lote con error de sintaxis no afecta al siguiente', `SELEC 1\nGO\nSELECT 5 AS n`, ['Error 102', 'n', '5'])
t('having', 'SELECT categoria_id, COUNT(*) AS n FROM Producto GROUP BY categoria_id HAVING COUNT(*) > 1', ['categoria_id | n', '1 | 2'], { setup: rel })
t('alias en order by', 'SELECT nombre, precio * 2 AS doble FROM Producto ORDER BY doble DESC', ['nombre | doble', 'Cola | 7.00', 'Papas | 4.50', 'Agua | 2.00'], { setup: rel })
t('order by posicion', 'SELECT nombre, precio FROM Producto ORDER BY 2', ['nombre | precio', 'Agua | 1.00', 'Papas | 2.25', 'Cola | 3.50'], { setup: rel })
t('grant noop', 'GRANT SELECT, INSERT ON Cliente TO usuario1', [], { setup: base })
t('count distinct', 'SELECT COUNT(DISTINCT categoria_id) AS n FROM Producto', ['n', '2'], { setup: rel })
t('where compuesto', 'SELECT nombre FROM Producto WHERE precio > 1 AND (categoria_id = 1 OR nombre LIKE P%)', ['Error 102'], { setup: rel })

console.log(fails === 0 ? `✔ ${total} pruebas del simulador SQL` : `✖ ${fails}/${total} pruebas fallaron`)
process.exit(fails === 0 ? 0 : 1)
