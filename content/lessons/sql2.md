---
id: sql2
curso: sql
clase: 2
title: DDL, construir y modificar la estructura
subtitle: CREATE, ALTER, DROP, TRUNCATE y RENAME para crear bases de datos y tablas, con IDENTITY, NOT NULL, DEFAULT y UNIQUE.
date: 15 nov 2026
icon: shield
summary: CREATE DATABASE y CREATE TABLE, tipos de dato, NULL y NOT NULL, DEFAULT, IDENTITY, ALTER TABLE, DROP, TRUNCATE y renombrar con sp_rename.
---

## El problema: antes de guardar datos hay que construir el lugar

No puedes guardar ropa si no tienes un armario. En una base de datos, **antes de insertar** cualquier dato necesitas **crear la tabla** que lo recibirá, con sus columnas y sus tipos.

Eso es **DDL** (*Data Definition Language*): el grupo de instrucciones que **crea diferentes entidades y objetos** de la base de datos. Hoy trabajarás con las **tablas**; más adelante aparecerán otros objetos (secuencias, procedimientos almacenados…).

| Instrucción | Qué hace | Analogía |
|---|---|---|
| `CREATE` | **crea** un objeto (base de datos, tabla…) | construir |
| `ALTER` | **modifica** la estructura de un objeto que ya existe | remodelar |
| `DROP` | **elimina** el objeto completo (estructura **y** datos) | demoler |
| `TRUNCATE` | **vacía** una tabla (borra todas las filas, deja la estructura) | vaciar la habitación |
| `RENAME` | **cambia el nombre** | cambiar la placa |

## `CREATE DATABASE` y `USE`

Una base de datos es el **contenedor** de tus tablas. Se crea con `CREATE DATABASE` y se **selecciona** con `USE` para que lo que escribas después ocurra **dentro de ella**:

```sql
CREATE DATABASE Tienda;
GO
USE Tienda;
GO
SELECT 'Estoy trabajando dentro de la base Tienda' AS mensaje;
```

> [!ojo] `GO` no es SQL
> `GO` es una orden de **SSMS** que separa lotes de instrucciones. Algunas instrucciones (como `USE`) deben ir en su propio lote. El simulador de la web también lo entiende.

> [!tip] En los ejercicios de esta web la base de datos **ya está seleccionada**
> No necesitas escribir `CREATE DATABASE` ni `USE` en los ejercicios: empiezas directamente con tus tablas.

## `CREATE TABLE`: crear una tabla

La estructura es siempre la misma:

```sql-static
CREATE TABLE NombreDeLaTabla (
  columna1  TIPO  [restricciones],
  columna2  TIPO  [restricciones],
  ...
);
```

Un ejemplo completo. Una tabla de clientes:

```sql
CREATE TABLE Cliente (
  id       INT           NOT NULL IDENTITY(1,1),
  nombre   VARCHAR(40)   NOT NULL,
  correo   VARCHAR(50)   NULL,
  ciudad   VARCHAR(20)   NOT NULL DEFAULT 'Lima',
  CONSTRAINT PK_Cliente PRIMARY KEY (id)
);

INSERT INTO Cliente (nombre, correo) VALUES ('Ana Torres', 'ana@mail.com');
INSERT INTO Cliente (nombre) VALUES ('Luis Rojas');

SELECT * FROM Cliente;
```

Cada columna lleva: **nombre**, **tipo** y, si hace falta, **restricciones**. Vamos una por una.

### `NOT NULL` y `NULL`

- **`NOT NULL`**: la columna **obligatoriamente** debe tener un dato.
- **`NULL`**: la columna **puede quedar sin dato**.

Si intentas insertar una fila **sin** un dato obligatorio, SQL Server **rechaza toda la fila** con el error **515**:

```sql
-- @error
CREATE TABLE Producto (
  id     INT          NOT NULL,
  nombre VARCHAR(30)  NOT NULL,
  precio DECIMAL(10,2) NULL
);

INSERT INTO Producto (id, precio) VALUES (1, 5.00);
```

Lee el mensaje: *Cannot insert the value NULL into column 'nombre'… column does not allow nulls.* Es decir: **“la columna nombre no admite nulos”**.

### `DEFAULT`: el valor por si no me das ninguno

`DEFAULT` define el valor que se guarda **cuando no escribes la columna** en el `INSERT`.

```sql
CREATE TABLE Pedido (
  id      INT         NOT NULL,
  estado  VARCHAR(15) NOT NULL DEFAULT 'pendiente',
  fecha   DATE        NOT NULL DEFAULT '2026-01-01'
);

INSERT INTO Pedido (id) VALUES (1);
INSERT INTO Pedido (id, estado) VALUES (2, 'enviado');

SELECT * FROM Pedido;
```

### `UNIQUE`: no repetir un valor

`UNIQUE` evita que **dos filas** tengan el **mismo valor** en esa columna (por ejemplo, un correo). Se parece a una llave primaria, pero una tabla puede tener **varias** columnas `UNIQUE` y la columna **puede** ser `NULL`.

```sql
-- @error
CREATE TABLE Usuario (
  id     INT         NOT NULL,
  correo VARCHAR(40) NOT NULL UNIQUE
);

INSERT INTO Usuario VALUES (1, 'ana@mail.com');
INSERT INTO Usuario VALUES (2, 'ANA@mail.com');
```

Se rechaza el segundo `INSERT` (error **2627**, *Violation of UNIQUE KEY constraint*). Fíjate: `'ana@mail.com'` y `'ANA@mail.com'` **se consideran iguales** porque SQL Server no distingue mayúsculas de minúsculas al comparar textos.

### `PRIMARY KEY`: el identificador de cada fila

Una **llave primaria** identifica **a un registro** de la tabla: es **única** y **no puede ser nula**. En esta clase solo la **declaras**; en la **clase 6** la estudiarás a fondo, junto con las llaves foráneas.

Hay dos formas de escribirla:

```sql-static
-- en la propia columna
id INT NOT NULL PRIMARY KEY

-- o nombrando la restricción (la forma recomendada)
CONSTRAINT PK_Cliente PRIMARY KEY (id)
```

> [!tip] Ponle **nombre** a tus restricciones
> `CONSTRAINT PK_Cliente PRIMARY KEY (id)`. Si no le pones nombre, SQL Server inventa uno raro como `PK__Cliente__3213E83F2A4C1F2E`, y entonces es difícil leer los errores o borrar la restricción después.

## `IDENTITY`: números que se generan solos

`IDENTITY(semilla, incremento)` hace que SQL Server **genere el número por ti**:

- **semilla**: el primer valor. 
- **incremento**: cuánto suma en cada fila nueva.

`IDENTITY(1,1)` → 1, 2, 3, 4… (empieza en 1 y sube de 1 en 1).

```sql
CREATE TABLE Ticket (
  numero  INT          NOT NULL IDENTITY(100,10),
  asunto  VARCHAR(30)  NOT NULL
);

INSERT INTO Ticket (asunto) VALUES ('Primero'), ('Segundo'), ('Tercero');

SELECT * FROM Ticket;
```

Con `IDENTITY(100,10)` los números son 100, 110, 120.

Reglas de `IDENTITY`:

> [!regla] Con IDENTITY, **no insertas** esa columna
> No escribes la columna `numero` en el `INSERT`: SQL Server la llena sola. Si intentas insertar un valor a mano, falla con el error **544**: *Cannot insert explicit value for identity column… when IDENTITY_INSERT is set to OFF.*

```sql
-- @error
CREATE TABLE Ticket (
  numero INT NOT NULL IDENTITY(1,1),
  asunto VARCHAR(30) NOT NULL
);

INSERT INTO Ticket (numero, asunto) VALUES (5, 'No me dejan elegir');
```

Y un detalle que sorprende: **el contador no retrocede.**

```sql
CREATE TABLE Ticket (
  numero INT NOT NULL IDENTITY(1,1),
  asunto VARCHAR(30) NOT NULL
);

INSERT INTO Ticket (asunto) VALUES ('A'), ('B'), ('C');
DELETE FROM Ticket;                        -- borro las 3 filas
INSERT INTO Ticket (asunto) VALUES ('D');  -- ¿qué número le toca?

SELECT * FROM Ticket;
```

La fila nueva se llama **4**, no 1: borrar filas **no reinicia** el contador. Para reiniciarlo existe `TRUNCATE` (más abajo).

> [!profundiza] El contador se gasta aunque falle el `INSERT`
> Si un `INSERT` **falla** (por ejemplo, por un dato obligatorio que faltó), el número que **iba** a usar **ya se consumió**. Por eso a veces ves “huecos” en una columna `IDENTITY`: 1, 2, 4, 5… **No es un error** y **no se debe “arreglar”**: un `IDENTITY` solo promete que los números **no se repiten**, no que no tengan huecos.

```quiz
Con `numero INT IDENTITY(1,1)`, ¿qué valor tendrá la **tercera** fila que insertes?
- `2`
- `3` *
- Hay que escribirlo tú en el `INSERT`
> Empieza en 1 y sube de 1 en 1: 1, 2, **3**. Tú no escribes ese valor: lo genera SQL Server.
```

## Ver cómo quedó tu tabla: `INFORMATION_SCHEMA`

SQL Server guarda **la descripción de tus tablas** en “vistas del sistema”. La más útil para ti es `INFORMATION_SCHEMA.COLUMNS`:

```sql
CREATE TABLE Libro (
  id      INT           NOT NULL,
  titulo  VARCHAR(60)   NOT NULL,
  precio  DECIMAL(8,2)  NULL,
  CONSTRAINT PK_Libro PRIMARY KEY (id)
);

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Libro'
ORDER BY ORDINAL_POSITION;
```

Así **compruebas** nombres, tipos y si admiten `NULL`. En SSMS también puedes verlo en el panel **Object Explorer** → Tables → tu tabla → Columns.

## `ALTER TABLE`: modificar la estructura

Cuando la tabla **ya existe** y necesitas cambiarla **sin perder sus datos**, usas `ALTER TABLE`. Estas son sus formas:

| Quiero… | Sintaxis |
|---|---|
| **agregar** una columna | `ALTER TABLE T ADD columna TIPO [NULL / NOT NULL];` |
| **cambiar** el tipo o la longitud | `ALTER TABLE T ALTER COLUMN columna TIPO [NULL / NOT NULL];` |
| **quitar** una columna | `ALTER TABLE T DROP COLUMN columna;` |
| **agregar** una restricción | `ALTER TABLE T ADD CONSTRAINT nombre ...;` |
| **quitar** una restricción | `ALTER TABLE T DROP CONSTRAINT nombre;` |

### Agregar una columna (`ADD`)

```sql
-- @datos: colegio
ALTER TABLE Alumno ADD telefono VARCHAR(12) NULL;

SELECT id, nombre, telefono FROM Alumno WHERE id <= 3;
```

La columna nueva aparece con `NULL` en **todas las filas que ya existían** (no tenían ese dato).

> [!ojo] Agregar una columna `NOT NULL` a una tabla **con datos**
> Si la tabla ya tiene filas y agregas una columna `NOT NULL` **sin `DEFAULT`**, ¿qué valor le pondría SQL Server a las filas viejas? No lo sabe: da el error **4901**. Dale un `DEFAULT`:

```sql
-- @datos: colegio
-- @error
ALTER TABLE Alumno ADD pais VARCHAR(20) NOT NULL;
```

```sql
-- @datos: colegio
ALTER TABLE Alumno ADD pais VARCHAR(20) NOT NULL DEFAULT 'Peru';

SELECT id, nombre, pais FROM Alumno WHERE id <= 3;
```

### Cambiar una columna (`ALTER COLUMN`)

Sirve para **ampliar la longitud** de un texto o cambiar el tipo:

```sql
-- @datos: colegio
ALTER TABLE Alumno ALTER COLUMN nombre VARCHAR(60) NOT NULL;

SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Alumno' AND COLUMN_NAME = 'nombre';
```

> [!error] La trampa de `ALTER COLUMN` y el `NOT NULL`
> En `ALTER COLUMN` **siempre escribe `NULL` o `NOT NULL`**. Si no lo escribes, SQL Server **vuelve la columna `NULL`** (aunque antes fuera `NOT NULL`) y pierdes la obligatoriedad sin darte cuenta.
>
> ```sql
> -- @datos: colegio
> ALTER TABLE Alumno ALTER COLUMN nombre VARCHAR(60);   -- olvidé el NOT NULL
>
> SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
> WHERE TABLE_NAME = 'Alumno' AND COLUMN_NAME = 'nombre';
> ```

### Quitar una columna (`DROP COLUMN`)

```sql
-- @datos: colegio
ALTER TABLE Alumno DROP COLUMN correo;

SELECT * FROM Alumno WHERE id = 1;
```

No puedes quitar una columna de la que **dependa** una restricción (por ejemplo, la llave primaria): error **5074**.

```sql
-- @datos: colegio
-- @error
ALTER TABLE Alumno DROP COLUMN id;
```

### Agregar y quitar restricciones

```sql
CREATE TABLE Empleado (
  id      INT          NOT NULL,
  nombre  VARCHAR(30)  NOT NULL,
  dni     CHAR(8)      NOT NULL
);

ALTER TABLE Empleado ADD CONSTRAINT PK_Empleado PRIMARY KEY (id);
ALTER TABLE Empleado ADD CONSTRAINT UQ_Empleado_dni UNIQUE (dni);
ALTER TABLE Empleado DROP CONSTRAINT UQ_Empleado_dni;

SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'Empleado';
```

Por eso conviene **ponerles nombre**: para poder referirte a ellas después.

## `DROP`: eliminar para siempre

`DROP TABLE` elimina la tabla **completa: estructura y datos**. **No hay “deshacer”**.

```sql
-- @datos: colegio
DROP TABLE Alumno;

SELECT * FROM INFORMATION_SCHEMA.TABLES;
```

Si la tabla no existe, falla (error **3701**). Para evitarlo, `IF EXISTS`:

```sql
DROP TABLE IF EXISTS TablaQueTalVezNoExiste;
SELECT 'No pasó nada: no había error' AS resultado;
```

> [!regla] Antes de un `DROP`, piensa dos veces
> `DROP DATABASE` borra la base **entera**; `DROP TABLE`, una tabla **entera**. En una base real, **primero se respalda**.

## `TRUNCATE`: vaciar la tabla

`TRUNCATE TABLE` **borra todas las filas** pero **deja la tabla** (su estructura) lista para recibir datos nuevos. Además **reinicia el contador `IDENTITY`**.

```sql
CREATE TABLE Ticket (
  numero INT NOT NULL IDENTITY(1,1),
  asunto VARCHAR(30) NOT NULL
);

INSERT INTO Ticket (asunto) VALUES ('A'), ('B'), ('C');
TRUNCATE TABLE Ticket;
INSERT INTO Ticket (asunto) VALUES ('D');

SELECT * FROM Ticket;
```

La fila nueva vuelve a ser la **1**. Compárala con el `DELETE` de más arriba, donde fue la 4.

| | `DELETE FROM T` | `TRUNCATE TABLE T` | `DROP TABLE T` |
|---|---|---|---|
| Familia | DML | DDL | DDL |
| Borra las filas | sí (todas, o las que filtres con `WHERE`) | **todas** | todas |
| Deja la tabla | sí | sí | **no** |
| Reinicia `IDENTITY` | no | **sí** | — |
| ¿Admite `WHERE`? | **sí** | no | no |

## `RENAME`: cambiar un nombre

En muchos motores (MySQL, Oracle) existe una instrucción `RENAME`. **En SQL Server no**: se usa el procedimiento **`sp_rename`**.

```sql
CREATE TABLE Clientes (id INT, nombre VARCHAR(20));

EXEC sp_rename 'Clientes', 'Cliente';                         -- renombrar la TABLA
EXEC sp_rename 'Cliente.nombre', 'nombres', 'COLUMN';          -- renombrar una COLUMNA

SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cliente';
```

Y para que reconozcas el `RENAME` de otros motores cuando lo veas:

```sql-static
-- MySQL / Oracle (NO funciona en SQL Server)
RENAME TABLE Clientes TO Cliente;
```

> [!ojo] Renombrar puede romper otros códigos
> SSMS te avisa: *“Changing any part of an object name could break scripts and stored procedures”*. Si otros programas usan el nombre viejo, dejarán de funcionar.

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| Error **2714** `There is already an object named…` | esa tabla ya existe: bórrala (`DROP`) o usa otro nombre |
| Error **208** `Invalid object name` | la tabla no existe (o la escribiste mal) |
| Error **515** | falta un dato en una columna `NOT NULL` |
| Error **544** | quisiste insertar a mano en una columna `IDENTITY` |
| Error **4901** | agregaste una columna `NOT NULL` sin `DEFAULT` a una tabla con filas |
| Error **5074** | la columna que quieres quitar tiene una restricción que depende de ella |
| Error **3701** | haces `DROP` de algo que no existe (usa `IF EXISTS`) |
| La columna dejó de ser obligatoria | hiciste `ALTER COLUMN` sin escribir `NOT NULL` |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | `CREATE TABLE`, tipos, `NOT NULL`, `DEFAULT` | 2.1 a 2.6 |
| 2 | `IDENTITY` y `UNIQUE` | 2.7 a 2.10 |
| 3 | `ALTER TABLE` | 2.11 a 2.14 |
| 4 | `DROP`, `TRUNCATE`, `sp_rename` y repaso | 2.15 a 2.18 |

**Reglas del juego**

- Cada ejercicio comprueba tu tabla mirando `INFORMATION_SCHEMA` **y** metiendo datos de prueba: tu estructura debe **comportarse** como se pide.
- Ponle **nombre a tus restricciones** (`PK_…`, `UQ_…`).
- Antes de ejecutar: **predice** qué va a pasar. Después: **repite en tu SSMS**.

## Resumen de la clase

- **DDL** crea y modifica la **estructura**: `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`.
- `CREATE TABLE T (columna TIPO restricciones, …)`; `NOT NULL` = obligatorio; `DEFAULT` = valor si no escribes la columna; `UNIQUE` = sin repetidos; `PRIMARY KEY` = identificador.
- **`IDENTITY(semilla, incremento)`** genera el número solo: **no se inserta**; el contador **no retrocede** con `DELETE` ni con `INSERT` fallidos; `TRUNCATE` lo reinicia.
- `ALTER TABLE`: `ADD`, `ALTER COLUMN` (siempre di `NULL` / `NOT NULL`), `DROP COLUMN`, `ADD`/`DROP CONSTRAINT`.
- `DROP` elimina todo; `TRUNCATE` vacía y reinicia `IDENTITY`; `DELETE` borra filas con `WHERE`.
- En SQL Server se renombra con **`sp_rename`**.
- `INFORMATION_SCHEMA.COLUMNS` te deja **ver** cómo quedó tu tabla.

Y ahora la **práctica** de DDL.
