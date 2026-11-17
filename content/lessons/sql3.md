---
id: sql3
curso: sql
clase: 3
title: DML, insertar, actualizar y borrar datos
subtitle: INSERT, UPDATE y DELETE para manipular la información de las tablas, con la regla de oro del WHERE.
date: 16 nov 2026
icon: pencil
summary: INSERT (una o varias filas, con y sin lista de columnas), UPDATE y DELETE con WHERE, la regla de oro, filas afectadas y los errores de datos más comunes.
---

## El problema: la tabla existe, pero está vacía

En la clase anterior construiste tablas. Ahora toca **llenarlas y mantenerlas**: agregar registros, corregir un dato mal escrito y quitar lo que sobra.

Eso es **DML** (*Data Manipulation Language*): el grupo de instrucciones que **permite manipular la información de las tablas**.

| Instrucción | Qué hace | Analogía |
|---|---|---|
| `INSERT` | **agrega** filas nuevas | anotar un registro nuevo |
| `UPDATE` | **cambia** datos de filas que ya existen | corregir con borrador |
| `DELETE` | **elimina** filas | tachar un registro |
| `SELECT` | **lee** datos (sin cambiarlos) | mirar la tabla |

> [!regla] Reglas de oro de DML
> - **`UPDATE`: no ejecutar sin un `WHERE`.**
> - **`DELETE`: no ejecutar sin un `WHERE`.**
>
> Sin `WHERE`, la instrucción afecta a **TODAS** las filas. En una base real, **no hay “deshacer”**.

## `INSERT`: agregar filas

La forma recomendada **nombra las columnas** y luego da los valores **en el mismo orden**:

```sql-static
INSERT INTO Tabla (columna1, columna2, columna3)
VALUES (valor1, valor2, valor3);
```

Un ejemplo con una tabla de contactos. Primero la tabla, luego tres filas:

```sql
CREATE TABLE Contacto (
  id       INT           NOT NULL IDENTITY(1,1),
  nombre   VARCHAR(30)   NOT NULL,
  telefono VARCHAR(12)   NULL,
  ciudad   VARCHAR(20)   NOT NULL DEFAULT 'Lima',
  CONSTRAINT PK_Contacto PRIMARY KEY (id)
);

INSERT INTO Contacto (nombre, telefono, ciudad) VALUES ('Ana', '987654321', 'Cusco');
INSERT INTO Contacto (nombre, telefono) VALUES ('Luis', '912345678');
INSERT INTO Contacto (nombre) VALUES ('Rosa');

SELECT * FROM Contacto;
```

Fíjate en lo que pasó con las **columnas que no escribiste**:

| Columna | Si no la escribes en el `INSERT`… |
|---|---|
| `id` (`IDENTITY`) | SQL Server **la genera** (1, 2, 3…) |
| `telefono` (`NULL`) | queda en **`NULL`** |
| `ciudad` (`DEFAULT 'Lima'`) | toma el valor por **defecto** |
| una columna `NOT NULL` sin `DEFAULT` | **error 515** |

### Varias filas en un solo `INSERT`

Separas cada fila con una **coma**:

```sql
CREATE TABLE Color (
  codigo INT         NOT NULL,
  nombre VARCHAR(15) NOT NULL
);

INSERT INTO Color (codigo, nombre)
VALUES (1, 'Rojo'),
       (2, 'Verde'),
       (3, 'Azul');

SELECT * FROM Color;
```

> [!tip] Un `INSERT` con varias filas es **todo o nada**
> Si **una** de las filas falla (por ejemplo, una llave repetida), **no se inserta ninguna**. Es lo mismo que “o se hace completo o no se hace”.

### `INSERT` sin lista de columnas

También puedes escribir **solo** `VALUES`, pero entonces debes dar **todos** los valores, **en el orden exacto** en que se crearon las columnas:

```sql
CREATE TABLE Libro (
  id      INT          NOT NULL,
  titulo  VARCHAR(40)  NOT NULL,
  paginas INT          NOT NULL
);

INSERT INTO Libro VALUES (1, 'El principito', 96);

SELECT * FROM Libro;
```

> [!ojo] Es más corto, pero más frágil
> Si mañana alguien agrega una columna a la tabla, ese `INSERT` **deja de funcionar** (error 213). Con la lista de columnas, sigue funcionando. **Acostúmbrate a nombrar las columnas.**
>
> Y con una columna `IDENTITY`: sin lista de columnas, **la saltas** (SQL Server la llena sola).

### Textos, números, fechas y `NULL`

| Dato | Cómo se escribe | Ejemplo |
|---|---|---|
| Texto | entre **comillas simples** | `'Ana'` |
| Número | **sin comillas** | `15`, `22.50` |
| Fecha | entre comillas simples, **año-mes-día** | `'2026-11-16'` |
| Sin dato | la palabra `NULL` (sin comillas) | `NULL` |
| Un apóstrofo dentro de un texto | se **duplica** | `'D''Angelo'` |

```sql
CREATE TABLE Persona (
  id      INT         NOT NULL,
  nombre  VARCHAR(30) NOT NULL,
  nacio   DATE        NULL,
  nota    DECIMAL(4,1) NULL
);

INSERT INTO Persona (id, nombre, nacio, nota) VALUES
(1, 'Ana María', '2010-05-20', 17.5),
(2, 'D''Angelo', NULL, NULL);

SELECT * FROM Persona;
```

### El simulador y SQL Server rechazan datos que no encajan

| Error | Cuándo ocurre | Ejemplo |
|---|---|---|
| **515** | falta un dato en una columna `NOT NULL` | no escribiste `nombre` |
| **8152** | el texto es **más largo** que el `VARCHAR(n)` de la columna | `'Nombre larguísimo…'` en `VARCHAR(10)` |
| **245** | el dato **no se puede convertir** al tipo de la columna | `'abc'` en una columna `INT` |
| **213** | la cantidad de valores **no coincide** con las columnas | 3 valores para 4 columnas |
| **2627** | la llave **ya existe** (se repite) | dos filas con el mismo `id` |

```sql
-- @error
CREATE TABLE Mini (
  id     INT         NOT NULL,
  codigo VARCHAR(5)  NOT NULL
);

INSERT INTO Mini (id, codigo) VALUES (1, 'ABCDEFGHIJ');
```

```quiz
`INSERT INTO Mini (id, codigo) VALUES (1, 'ABCDEFGHIJ')` falla porque…
- falta una coma
- el texto tiene 10 letras y `codigo` solo admite 5 *
- `id` no puede ser 1
> Es el error **8152**: *String or binary data would be truncated*. El dato no cabe en `VARCHAR(5)`.
```

## `SELECT` para ver qué hay y qué cambió

Mientras aprendes, **usa `SELECT` antes y después** de cambiar datos. Lo estudiarás a fondo en la clase 4; por ahora usa estas dos formas:

```sql-static
SELECT * FROM Tabla;                       -- toda la tabla
SELECT * FROM Tabla WHERE condicion;       -- solo las filas que cumplen la condición
```

## `UPDATE`: cambiar datos que ya existen

```sql-static
UPDATE Tabla
SET    columna1 = nuevoValor1,
       columna2 = nuevoValor2
WHERE  condicion;
```

- **`SET`** dice **qué columnas** cambian y **a qué valor**.
- **`WHERE`** dice **qué filas** cambian. Sin `WHERE`, cambian **todas**.

Subamos el precio del producto 3 (leche):

```sql
-- @datos: tienda
UPDATE Producto SET precio = 5.20 WHERE id = 3;

SELECT id, nombre, precio FROM Producto WHERE id = 3;
```

Fíjate en la condición: **`WHERE id = 3`**. Como `id` es la **llave primaria** (única), afecta **exactamente una fila**. Esa es la forma más segura de actualizar **un** registro.

### Cambiar varias columnas a la vez

```sql
-- @datos: tienda
UPDATE Producto
SET    precio = 6.50,
       stock  = 100
WHERE  id = 4;

SELECT id, nombre, precio, stock FROM Producto WHERE id = 4;
```

### Usar el valor actual para calcular el nuevo

El lado derecho del `=` puede usar las columnas **de la misma fila**:

```sql
-- @datos: tienda
UPDATE Producto
SET    precio = precio * 1.10       -- subo 10 %
WHERE  categoria = 'Bebidas';

SELECT nombre, precio FROM Producto WHERE categoria = 'Bebidas';
```

Aquí el `WHERE` filtra por **categoría**: se actualizan **varias filas** (todas las bebidas). Por eso es tan importante saber **qué filas** cumplen tu condición antes de ejecutar.

### El mensaje `(N rows affected)`

Después de un `INSERT`, `UPDATE` o `DELETE`, SQL Server te dice **cuántas filas** tocó, en la pestaña **Messages**:

```sql
-- @datos: tienda
UPDATE Producto SET stock = 0 WHERE categoria = 'Snacks';
```

Mira el mensaje: **`(3 rows affected)`**. Si esperabas 1 y dice 400, **algo salió mal**: ese número es tu primera red de seguridad.

## La regla de oro: `UPDATE` sin `WHERE`

Mira qué pasa cuando **te olvidas** del `WHERE`:

```sql
-- @datos: tienda
UPDATE Producto SET precio = 1;      -- ¡sin WHERE!

SELECT nombre, precio FROM Producto;
```

**Los 12 productos** quedaron con precio 1. No hay botón “deshacer”. Por eso:

> [!regla] La rutina segura de tres pasos
> 1. **`SELECT`** con el `WHERE` que piensas usar: *¿son justo las filas que quiero tocar?*
> 2. **`UPDATE`** (o `DELETE`) con **el mismo** `WHERE`.
> 3. **`SELECT`** otra vez para **verificar**.
>
> Y escribe el **`WHERE` primero**, antes del `SET`, para que nunca se te olvide.

```sql
-- @datos: tienda
-- 1) ¿qué filas voy a tocar?
SELECT id, nombre, stock FROM Producto WHERE categoria = 'Lacteos' AND stock = 0;

-- 2) las toco
UPDATE Producto SET stock = 24 WHERE categoria = 'Lacteos' AND stock = 0;

-- 3) verifico
SELECT id, nombre, stock FROM Producto WHERE categoria = 'Lacteos';
```

## `DELETE`: eliminar filas

```sql-static
DELETE FROM Tabla
WHERE condicion;
```

Eliminemos los productos sin stock:

```sql
-- @datos: tienda
SELECT id, nombre, stock FROM Producto WHERE stock = 0;   -- ¿cuáles son?

DELETE FROM Producto WHERE stock = 0;

SELECT COUNT(*) AS quedan FROM Producto;
```

Y sin `WHERE`… **borra toda la tabla** (pero la tabla sigue existiendo, vacía):

```sql
-- @datos: tienda
DELETE FROM Producto;

SELECT COUNT(*) AS quedan FROM Producto;
```

> [!tip] ¿Y si quiero vaciar toda una tabla a propósito?
> Para eso existe `TRUNCATE TABLE` (clase 2), que además reinicia el `IDENTITY`. `DELETE` sin `WHERE` también vacía, pero **suele ser un descuido**.

| | `DELETE` | `UPDATE` |
|---|---|---|
| Qué cambia | **filas** (las quita) | **datos** de las filas (las deja) |
| Con `WHERE` | solo las filas que cumplen | solo las filas que cumplen |
| Sin `WHERE` | **todas** las filas | **todas** las filas |

```quiz
`UPDATE Producto SET stock = 0;` (sin `WHERE`), ¿qué hace?
- cambia solo el primer producto
- pone `stock = 0` en **todos** los productos *
- da un error porque falta el `WHERE`
> SQL no te obliga a escribir `WHERE`: simplemente afecta **todas** las filas. Por eso es una **regla de oro** (la disciplina es tuya).
```

## Cuando `UPDATE` o `INSERT` fallan

Las mismas restricciones de la clase 2 **protegen tus datos** también al actualizar:

```sql
-- @error
CREATE TABLE Usuario (
  id     INT         NOT NULL PRIMARY KEY,
  correo VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO Usuario VALUES (1, 'ana@mail.com'), (2, 'luis@mail.com');

UPDATE Usuario SET correo = 'ana@mail.com' WHERE id = 2;   -- ya lo usa Ana
```

Fíjate: el `UPDATE` es **atómico** (todo o nada); si falla, **no cambia nada**.

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| `(400 rows affected)` y esperabas 1 | olvidaste el `WHERE` o tu condición es muy amplia |
| `(0 rows affected)` | tu `WHERE` no coincide con ninguna fila (mayúsculas, valor mal escrito…) |
| Error **515** | te faltó un dato obligatorio en el `INSERT` |
| Error **213** | los valores no coinciden con la cantidad de columnas |
| Error **8152** | un texto es más largo que la columna |
| Error **245** | pusiste un texto donde va un número (o al revés) |
| Error **2627** | repetiste una llave primaria o un valor `UNIQUE` |
| `Invalid column name 'Toby'` | olvidaste las comillas simples de un texto |
| `Incorrect syntax near ...` | falta una coma entre filas o columnas |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | `INSERT` (una fila, varias filas, valores por defecto) | 3.1 a 3.6 |
| 2 | `UPDATE` con `WHERE` | 3.7 a 3.11 |
| 3 | `DELETE` con `WHERE` y la rutina segura | 3.12 a 3.16 |

**Reglas del juego**

- **Nunca** un `UPDATE` o `DELETE` sin `WHERE` (salvo que el ejercicio lo pida **para que veas el efecto**).
- Antes de cambiar datos, **`SELECT` con el mismo `WHERE`**; después, **`SELECT` para verificar**.
- Todavía **no** uses `JOIN` ni `HAVING`.
- Prueba **también en tu SSMS** y compara el mensaje `(N rows affected)`.

## Resumen de la clase

- **DML** manipula los datos: `INSERT`, `UPDATE`, `DELETE` (y `SELECT` para leer).
- `INSERT INTO T (columnas) VALUES (…), (…)`: nombra las columnas; si no escribes una, toma `IDENTITY`, `DEFAULT` o `NULL`; varias filas = todo o nada.
- Textos y fechas con **comillas simples**; un apóstrofo se duplica; `NULL` sin comillas.
- `UPDATE T SET col = valor [, …] WHERE condición`; `DELETE FROM T WHERE condición`.
- **Regla de oro: nunca `UPDATE` ni `DELETE` sin `WHERE`.** Rutina: **SELECT → cambiar → SELECT**.
- `(N rows affected)` te dice cuántas filas tocaste: léelo siempre.
- Las restricciones (`NOT NULL`, `UNIQUE`, llaves, longitud, tipo) **rechazan** datos inválidos y la instrucción **no cambia nada**.

Y ahora la **práctica** de DML.
