---
id: sql6
curso: sql
clase: 6
title: El modelo relacional, llaves primarias y foráneas
subtitle: Por qué las tablas se vinculan entre sí, cómo se identifica cada registro (PK) y cómo se conectan las tablas (FK).
date: 17 nov 2026
icon: map
summary: El modelo relacional, la llave primaria (simple y compuesta), la llave foránea, la integridad referencial y el orden correcto para insertar y borrar.
---

## El pilar: las bases de datos son relacionales

Hasta ahora trabajaste con **una tabla a la vez**. Pero el pilar de usar SQL y bases de datos es que son **relacionales**: **existen vínculos entre las tablas**.

> [!regla] Una tabla sin vínculo con ninguna otra no usa bien el modelo relacional
> Si tu base de datos es un montón de tablas **sueltas**, no estás haciendo el uso correcto de una base de datos. La gracia está en que cada tabla guarda **un tipo de cosa** y **se conecta** con las demás.

Imagina una librería. Podrías guardar **todo** en una sola tabla:

| id | libro | precio | autor | pais_del_autor |
|---|---|---|---|---|
| 1 | Cien años de soledad | 45 | García Márquez | Colombia |
| 2 | El amor en los tiempos del cólera | 39 | García Márquez | Colombia |
| 3 | La ciudad y los perros | 41 | Vargas Llosa | Perú |

¿Ves el problema? **“García Márquez / Colombia” está repetido**. Si el nombre cambia o se escribió mal, hay que corregirlo en **cada fila**, y es fácil que queden versiones distintas.

La solución del modelo relacional: **dos tablas**, y un **vínculo** entre ellas.

**`Autor`**

| id | nombre | pais |
|---|---|---|
| 1 | García Márquez | Colombia |
| 2 | Vargas Llosa | Perú |

**`Libro`**

| id | titulo | precio | autor_id |
|---|---|---|---|
| 1 | Cien años de soledad | 45 | **1** |
| 2 | El amor en los tiempos del cólera | 39 | **1** |
| 3 | La ciudad y los perros | 41 | **2** |

El dato del autor se guarda **una sola vez**, y cada libro **apunta** a su autor con `autor_id`. Para ese vínculo necesitamos dos tipos de **llaves** (*keys*): **primary** y **foreign**.

## La llave primaria (*Primary Key*, PK)

> [!regla] Definición
> Una **llave primaria** es la columna (o columnas) que **identifica a un registro** de la tabla. Puede ser un **código**, un **texto** o la columna que tú elijas. Debe ser **única**: **no se puede repetir**, y **no puede ser `NULL`**.

Es el **DNI** de la fila: dos personas no pueden tener el mismo.

```sql
CREATE TABLE Autor (
  id     INT          NOT NULL,
  nombre VARCHAR(40)  NOT NULL,
  pais   VARCHAR(20)  NOT NULL,
  CONSTRAINT PK_Autor PRIMARY KEY (id)
);

INSERT INTO Autor (id, nombre, pais) VALUES
(1, 'Garcia Marquez', 'Colombia'),
(2, 'Vargas Llosa',  'Peru');

SELECT * FROM Autor;
```

### Qué pasa si repites la llave

Es **imprescindible** que la llave sea única: si no, SQL Server **rechaza** el registro con el error **2627** (*Violation of PRIMARY KEY constraint… Cannot insert duplicate key*):

```sql
-- @error
CREATE TABLE Autor (
  id     INT          NOT NULL,
  nombre VARCHAR(40)  NOT NULL,
  CONSTRAINT PK_Autor PRIMARY KEY (id)
);

INSERT INTO Autor (id, nombre) VALUES (1, 'Garcia Marquez');
INSERT INTO Autor (id, nombre) VALUES (1, 'Vargas Llosa');    -- ¡mismo id!

SELECT * FROM Autor;
```

Fíjate en el final: la tabla **solo tiene el primer registro**. El segundo **no entró**.

Y una llave primaria **no puede ser `NULL`** (error **515**).

### ¿Qué columna elijo como llave?

Cualquiera que **identifique a la fila sin repetirse**:

| Opción | Ejemplo | Comentario |
|---|---|---|
| Un **código** que ya existe | `dni`, `codigo_producto` | “natural”, pero cuidado si puede cambiar |
| Un **número autogenerado** | `id INT IDENTITY(1,1)` | muy cómodo: la llave nunca se repite |
| Un **texto** | `placa` de un auto | válido si es único |

```sql
CREATE TABLE Autor (
  id     INT          NOT NULL IDENTITY(1,1),
  nombre VARCHAR(40)  NOT NULL,
  CONSTRAINT PK_Autor PRIMARY KEY (id)
);

INSERT INTO Autor (nombre) VALUES ('Garcia Marquez'), ('Vargas Llosa');

SELECT * FROM Autor;
```

### La llave primaria compuesta

A veces **una sola columna no basta** para identificar una fila, y **varias columnas juntas** forman la llave. Es una **llave primaria compuesta**: lo que **no puede repetirse** es la **combinación**.

Ejemplo: las notas de los alumnos por curso. Un alumno tiene **muchas** notas (una por curso) y un curso tiene muchas notas (una por alumno). Pero **la pareja (alumno, curso)** es única:

```sql
CREATE TABLE Nota (
  alumno_id INT NOT NULL,
  curso_id  INT NOT NULL,
  nota      INT NOT NULL,
  CONSTRAINT PK_Nota PRIMARY KEY (alumno_id, curso_id)
);

INSERT INTO Nota (alumno_id, curso_id, nota) VALUES
(1, 1, 15),    -- alumno 1 en curso 1
(1, 2, 18),    -- alumno 1 en curso 2: ¡el alumno se repite y está bien!
(2, 1, 12);    -- alumno 2 en curso 1: ¡el curso se repite y está bien!

SELECT * FROM Nota;
```

Lo que **no** se permite es repetir **la pareja completa**:

```sql
-- @error
CREATE TABLE Nota (
  alumno_id INT NOT NULL,
  curso_id  INT NOT NULL,
  nota      INT NOT NULL,
  CONSTRAINT PK_Nota PRIMARY KEY (alumno_id, curso_id)
);

INSERT INTO Nota VALUES (1, 1, 15);
INSERT INTO Nota VALUES (1, 1, 20);    -- ya existe la pareja (1, 1)

SELECT * FROM Nota;
```

```quiz
En `PRIMARY KEY (alumno_id, curso_id)`, ¿qué **no** se puede repetir?
- el `alumno_id`
- el `curso_id`
- la **combinación** `alumno_id` + `curso_id` *
> En una llave compuesta, cada columna puede repetirse por separado; lo único que debe ser único es la **pareja completa**.
```

> [!tip] Cuántas llaves primarias tiene una tabla
> **Una sola** por tabla (que puede ser simple o compuesta). Pero esa única llave puede tener **varias columnas**.

## La llave foránea (*Foreign Key*, FK)

> [!regla] Definición
> Una **llave foránea** es una columna que **indica la llave primaria de otra tabla**: hace la **referencia directa a su identificador** y así **relaciona los registros** de una tabla con los de otra.

En el ejemplo, `Libro.autor_id` es una **FK** que apunta a `Autor.id` (una **PK**):

```sql
CREATE TABLE Autor (
  id     INT          NOT NULL,
  nombre VARCHAR(40)  NOT NULL,
  CONSTRAINT PK_Autor PRIMARY KEY (id)
);

CREATE TABLE Libro (
  id        INT          NOT NULL,
  titulo    VARCHAR(50)  NOT NULL,
  precio    DECIMAL(8,2) NOT NULL,
  autor_id  INT          NOT NULL,
  CONSTRAINT PK_Libro PRIMARY KEY (id),
  CONSTRAINT FK_Libro_Autor FOREIGN KEY (autor_id) REFERENCES Autor (id)
);

INSERT INTO Autor VALUES (1, 'Garcia Marquez'), (2, 'Vargas Llosa');

INSERT INTO Libro VALUES
(1, 'Cien anos de soledad', 45.00, 1),
(2, 'El amor en los tiempos del colera', 39.00, 1),
(3, 'La ciudad y los perros', 41.00, 2);

SELECT * FROM Libro;
```

Lee la restricción: **`FOREIGN KEY (autor_id) REFERENCES Autor (id)`** = *“la columna `autor_id` de esta tabla **referencia** la columna `id` de `Autor`”*.

### Lo que garantiza una llave foránea (integridad referencial)

La FK **no te deja** guardar un valor que **no exista** en la tabla referenciada. Es la **integridad referencial**: ningún libro puede apuntar a un autor **que no existe**.

```sql
-- @error
CREATE TABLE Autor (id INT NOT NULL PRIMARY KEY, nombre VARCHAR(40) NOT NULL);
CREATE TABLE Libro (
  id       INT NOT NULL PRIMARY KEY,
  titulo   VARCHAR(50) NOT NULL,
  autor_id INT NOT NULL,
  CONSTRAINT FK_Libro_Autor FOREIGN KEY (autor_id) REFERENCES Autor (id)
);

INSERT INTO Autor VALUES (1, 'Garcia Marquez');
INSERT INTO Libro VALUES (1, 'Libro huerfano', 99);     -- el autor 99 no existe
```

Error **547**: *The INSERT statement conflicted with the FOREIGN KEY constraint*. Es **bueno**: la base de datos te protege de datos incoherentes.

### El orden importa: primero el “padre”, luego el “hijo”

- La tabla **referenciada** (`Autor`) es la **tabla padre**.
- La tabla que **tiene la FK** (`Libro`) es la **tabla hija**.

Por eso:

| Operación | Orden correcto |
|---|---|
| **Crear** tablas | primero la **padre**, luego la **hija** |
| **Insertar** filas | primero el **padre** (el autor), luego el **hijo** (sus libros) |
| **Borrar** filas | primero los **hijos**, luego el padre |
| **Eliminar** tablas | primero la **hija**, luego la **padre** |

Si intentas borrar un **padre que todavía tiene hijos**, también te protege (error **547**, esta vez con la palabra *REFERENCE*):

```sql
-- @error
CREATE TABLE Autor (id INT NOT NULL PRIMARY KEY, nombre VARCHAR(40) NOT NULL);
CREATE TABLE Libro (
  id       INT NOT NULL PRIMARY KEY,
  titulo   VARCHAR(50) NOT NULL,
  autor_id INT NOT NULL REFERENCES Autor (id)
);

INSERT INTO Autor VALUES (1, 'Garcia Marquez');
INSERT INTO Libro VALUES (1, 'Cien anos de soledad', 1);

DELETE FROM Autor WHERE id = 1;     -- Garcia Marquez todavía tiene un libro
```

Y lo mismo con `DROP TABLE Autor` mientras `Libro` la referencia (error **3726**) y con `TRUNCATE TABLE Autor` (error **4712**).

> [!tip] Una FK también puede ser `NULL`
> Si la columna de la FK **admite `NULL`**, esa fila puede **no apuntar a nadie** (por ejemplo, un libro sin autor registrado). Si es `NOT NULL`, **siempre** debe apuntar a alguien.

### Dos formas de escribir una FK

```sql-static
-- 1) como restricción de la tabla (recomendada: puedes darle nombre)
CONSTRAINT FK_Libro_Autor FOREIGN KEY (autor_id) REFERENCES Autor (id)

-- 2) en la propia columna (más corta)
autor_id INT NOT NULL REFERENCES Autor (id)
```

También puedes agregarla **después**, con `ALTER TABLE`:

```sql
CREATE TABLE Autor (id INT NOT NULL PRIMARY KEY, nombre VARCHAR(40) NOT NULL);
CREATE TABLE Libro (id INT NOT NULL PRIMARY KEY, titulo VARCHAR(50) NOT NULL, autor_id INT NOT NULL);

ALTER TABLE Libro
ADD CONSTRAINT FK_Libro_Autor FOREIGN KEY (autor_id) REFERENCES Autor (id);

SELECT CONSTRAINT_NAME, TABLE_NAME, CONSTRAINT_TYPE
FROM   INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE  TABLE_NAME IN ('Autor', 'Libro')
ORDER BY TABLE_NAME, CONSTRAINT_NAME;
```

### Reglas de la FK

- La FK **debe tener el mismo tipo de dato** que la PK a la que apunta (`INT` con `INT`).
- Una FK **debe apuntar a una llave** (primaria o `UNIQUE`) de la otra tabla.
- Una tabla puede tener **varias** FK (apuntando a distintas tablas).

## Relaciones: uno a muchos y muchos a muchos

| Relación | Cómo se modela | Ejemplo |
|---|---|---|
| **Uno a muchos** (1 : N) | la tabla del lado “muchos” lleva una **FK** al lado “uno” | un autor tiene muchos libros → `Libro.autor_id` |
| **Muchos a muchos** (N : N) | una **tabla intermedia** con **dos FK**, cuya **PK compuesta** es la pareja | un alumno lleva muchos cursos y un curso tiene muchos alumnos → `Matricula (alumno_id, curso_id)` |

```sql
CREATE TABLE Alumno (id INT NOT NULL PRIMARY KEY, nombre VARCHAR(30) NOT NULL);
CREATE TABLE Curso  (id INT NOT NULL PRIMARY KEY, nombre VARCHAR(30) NOT NULL);

CREATE TABLE Matricula (
  alumno_id INT NOT NULL,
  curso_id  INT NOT NULL,
  CONSTRAINT PK_Matricula PRIMARY KEY (alumno_id, curso_id),
  CONSTRAINT FK_Matricula_Alumno FOREIGN KEY (alumno_id) REFERENCES Alumno (id),
  CONSTRAINT FK_Matricula_Curso  FOREIGN KEY (curso_id)  REFERENCES Curso (id)
);

INSERT INTO Alumno VALUES (1, 'Ana'), (2, 'Luis');
INSERT INTO Curso  VALUES (10, 'Matematica'), (20, 'Historia');
INSERT INTO Matricula VALUES (1, 10), (1, 20), (2, 10);

SELECT * FROM Matricula;
```

Esa tabla `Matricula` **junta** las dos llaves primarias: **PK compuesta** y **dos FK** a la vez.

## ¿Y cómo uso la relación para consultar?

La herramienta para **unir** tablas en una sola consulta se llama `JOIN` y es el **siguiente paso**: **todavía no la usas**. Mientras tanto, puedes hacerlo con **dos consultas**: primero buscas el `id` en la tabla padre y luego usas ese valor en el `WHERE` de la hija:

```sql
CREATE TABLE Autor (id INT NOT NULL PRIMARY KEY, nombre VARCHAR(40) NOT NULL);
CREATE TABLE Libro (id INT NOT NULL PRIMARY KEY, titulo VARCHAR(50) NOT NULL, autor_id INT NOT NULL REFERENCES Autor (id));

INSERT INTO Autor VALUES (1, 'Garcia Marquez'), (2, 'Vargas Llosa');
INSERT INTO Libro VALUES (1, 'Cien anos de soledad', 1), (2, 'El coronel no tiene quien le escriba', 1), (3, 'La ciudad y los perros', 2);

SELECT id FROM Autor WHERE nombre = 'Garcia Marquez';       -- 1) ¿qué id tiene?
SELECT titulo FROM Libro WHERE autor_id = 1;                 -- 2) sus libros
```

> [!profundiza] Lo que viene después
> Hacer esas dos consultas “a mano” es justo el problema que resuelven los `JOIN`: unir las dos tablas **en una sola consulta**. Es el tema que sigue; por ahora, concéntrate en **diseñar bien las llaves**.

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| Error **2627** | repetiste una llave primaria (o la pareja de una PK compuesta) |
| Error **515** | dejaste en `NULL` una columna de la llave primaria |
| Error **547** al insertar | la FK apunta a un padre que **no existe**: inserta primero al padre |
| Error **547** al borrar | el padre tiene hijos: borra primero a los hijos |
| Error **3726** / **4712** | `DROP` / `TRUNCATE` de una tabla que otra referencia |
| Error **1778** al crear la FK | la FK y la PK **no son del mismo tipo de dato** |
| Error **1776** al crear la FK | la columna a la que apuntas **no es una llave** de la otra tabla |
| Error **1767** | la tabla padre todavía no existe: créala primero |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | Qué es el modelo relacional y la PK | 6.1 a 6.5 |
| 2 | PK compuesta | 6.6 a 6.9 |
| 3 | FK e integridad referencial | 6.10 a 6.15 |
| 4 | Diseño y orden de operaciones | 6.16 a 6.20 |

**Reglas del juego**

- **No** uses `JOIN`: todavía no se ve.
- Ponle **nombre a tus restricciones** (`PK_…`, `FK_Hija_Padre`).
- Antes de ejecutar, **predice** qué `INSERT` va a fallar y con qué error.
- Prueba **también en tu SSMS**.

## Resumen de la clase

- Una base de datos es **relacional**: sus tablas se **vinculan**. Una tabla sin vínculo no aprovecha el modelo.
- **PK:** identifica **a un registro**; es **única** y **no nula**; una por tabla; puede ser **compuesta** (la **combinación** no se repite). Repetirla da el error **2627**.
- **FK:** columna que **referencia la PK de otra tabla**; relaciona registros y garantiza la **integridad referencial** (error **547**).
- **Padre** = tabla referenciada; **hijo** = tabla con la FK. Se **crea** e **inserta** primero el padre; se **borra** primero el hijo.
- Uno a muchos = una FK; muchos a muchos = tabla intermedia con dos FK y PK compuesta.
- Las uniones (`JOIN`) llegan después.

Y ahora la **práctica**: diseñar llaves y vínculos.
