---
id: chuleta-sql
curso: sql
clase: 0
title: Chuleta de SQL
subtitle: Todo lo visto en el curso de SQL en un solo lugar para consultar rápido. Si algo no se entiende, vuelve a su clase.
date: siempre
icon: list
summary: Las familias, el orden de las cláusulas, los tipos, las restricciones, las llaves, las funciones y los errores de SQL Server del curso.
---

## Las cuatro familias

| Familia | Para qué | Instrucciones | Clase |
|---|---|---|---|
| **DDL** | estructura | `CREATE` · `ALTER` · `DROP` · `TRUNCATE` · `sp_rename` | 2 |
| **DML** | datos | `INSERT` · `UPDATE` · `DELETE` (y `SELECT`) | 3 |
| **DQL** | consultas | `SELECT` · `FROM` · `WHERE` · `GROUP BY` · `ORDER BY` · `TOP`/`FETCH` | 4 y 5 |
| **DCL** | permisos | `GRANT` · `REVOKE` · `DENY` | 7 |

> **Regla de oro:** `UPDATE` y `DELETE` **nunca sin `WHERE`**. Rutina: `SELECT` → cambiar → `SELECT`.

## Tipos de dato y NULL

| Tipo | Guarda | Ejemplo |
|---|---|---|
| `INT` | entero | `15` |
| `DECIMAL(10,2)` | decimal (10 cifras, 2 decimales) | `22.50` |
| `VARCHAR(30)` | texto hasta 30 | `'Ana'` |
| `CHAR(8)` | texto de largo fijo | `'12345678'` |
| `DATE` | fecha | `'2026-11-15'` |
| `BIT` | 0 / 1 | `1` |

- Textos y fechas con **comillas simples**; un apóstrofo se duplica (`'D''Angelo'`).
- `NULL` = **no hay dato** (no es `0` ni `''`). Se pregunta con `IS NULL` / `IS NOT NULL`, **nunca** con `=`.

## DDL

```sql-static
CREATE DATABASE Tienda;   USE Tienda;

CREATE TABLE Producto (
  id        INT           NOT NULL IDENTITY(1,1),        -- 1, 2, 3...
  nombre    VARCHAR(30)   NOT NULL,
  precio    DECIMAL(10,2) NOT NULL DEFAULT 0,
  codigo    VARCHAR(10)   NULL UNIQUE,
  categoria_id INT        NOT NULL,
  CONSTRAINT PK_Producto PRIMARY KEY (id),
  CONSTRAINT FK_Producto_Categoria FOREIGN KEY (categoria_id) REFERENCES Categoria (id)
);

ALTER TABLE T ADD columna TIPO NULL;                       -- agregar
ALTER TABLE T ALTER COLUMN columna TIPO NOT NULL;          -- cambiar (¡siempre NULL / NOT NULL!)
ALTER TABLE T DROP COLUMN columna;                         -- quitar
ALTER TABLE T ADD CONSTRAINT UQ_T_x UNIQUE (x);            -- restricción
ALTER TABLE T DROP CONSTRAINT UQ_T_x;

DROP TABLE T;   DROP TABLE IF EXISTS T;                    -- elimina todo
TRUNCATE TABLE T;                                          -- vacía y reinicia IDENTITY
EXEC sp_rename 'Vieja', 'Nueva';                           -- renombrar tabla
EXEC sp_rename 'T.vieja', 'nueva', 'COLUMN';               -- renombrar columna
```

- **`IDENTITY(semilla, incremento)`**: no se inserta; no retrocede con `DELETE` ni con inserciones fallidas; `TRUNCATE` lo reinicia.
- Ver la estructura: `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'T';`

## DML

```sql-static
INSERT INTO T (col1, col2) VALUES (v1, v2), (v3, v4);      -- nombra las columnas
UPDATE T SET col1 = v1, col2 = col2 * 1.1 WHERE condicion; -- ¡con WHERE!
DELETE FROM T WHERE condicion;                             -- ¡con WHERE!
```

- Mira siempre el mensaje **`(N rows affected)`**.
- Las restricciones **rechazan** el dato inválido y la instrucción **no cambia nada**.

## DQL: el orden de las cláusulas

```sql-static
SELECT [DISTINCT] [TOP n] columnas / expresiones AS alias
FROM   Tabla
WHERE  condicion
GROUP BY columnas
ORDER BY columna [ASC | DESC]
OFFSET a ROWS FETCH NEXT b ROWS ONLY;      -- exige ORDER BY
```

Cómo lo “piensa” SQL: `FROM` → `WHERE` → `GROUP BY` → `SELECT` → `ORDER BY` → `TOP`.

| Quiero… | Escribo |
|---|---|
| igual / distinto | `=` · `<>` |
| mayor / menor | `>` `<` `>=` `<=` |
| combinar | `AND` · `OR` · `NOT` (con paréntesis) |
| en una lista | `IN ('a', 'b')` · `NOT IN (…)` |
| en un rango (incluye extremos) | `BETWEEN 4 AND 8` |
| por patrón | `LIKE 'A%'` · `'%ar%'` · `'_gua%'` |
| sin dato / con dato | `IS NULL` · `IS NOT NULL` |

- Los textos se comparan **sin distinguir mayúsculas**.
- Alias: se usan en `ORDER BY`, **no** en `WHERE`.
- **Sin `ORDER BY` no hay orden garantizado.** `TOP` y `OFFSET-FETCH` siempre con `ORDER BY`.
- Otros motores: `LIMIT` (MySQL/PostgreSQL), `FETCH FIRST` (Oracle).

## Agregados y GROUP BY

| Función | Resultado |
|---|---|
| `COUNT(*)` | cuántas filas |
| `COUNT(col)` | cuántas con dato (sin `NULL`) |
| `COUNT(DISTINCT col)` | cuántos valores distintos |
| `SUM(col)` · `AVG(col)` | suma · promedio |
| `MIN(col)` · `MAX(col)` | menor · mayor |

- Ignoran `NULL`. **`AVG` de enteros trunca** (el promedio de 10 y 15 es 12).
- En un `SELECT` con `GROUP BY` solo van **columnas del `GROUP BY`** y **agregados** (si no, error 8120).
- Los agregados **no** van en el `WHERE` (error 147). `HAVING`: más adelante.

## Funciones útiles

`UPPER(t)` · `LOWER(t)` · `LEN(t)` · `ISNULL(x, y)` · `texto + texto` · (texto + número = error 245: hay que convertir).

## Llaves y relaciones

| | PK (llave primaria) | FK (llave foránea) |
|---|---|---|
| Qué es | identifica **a un registro** | **referencia la PK** de otra tabla |
| Reglas | única, **no nula**, una por tabla (puede ser compuesta) | el valor debe **existir** en el padre (o ser `NULL` si la columna lo admite) |
| Error si falla | **2627** (repetida) · **515** (nula) | **547** |

- **Padre**: tabla referenciada. **Hijo**: tabla con la FK.
- **Crear / insertar**: primero el padre. **Borrar / `DROP`**: primero el hijo.
- Uno a muchos = una FK. Muchos a muchos = tabla intermedia con dos FK y PK compuesta.
- `JOIN`: todavía no se ve.

```sql-static
CONSTRAINT PK_Nota PRIMARY KEY (alumno_id, curso_id)                    -- compuesta
CONSTRAINT FK_Libro_Autor FOREIGN KEY (autor_id) REFERENCES Autor (id)  -- foránea
```

## DCL (conceptos)

```sql-static
GRANT SELECT, INSERT ON Venta TO cajero;     -- concede
REVOKE INSERT ON Venta FROM cajero;          -- retira
DENY DELETE ON Producto TO cajero;           -- prohíbe (gana sobre GRANT)
```

**Mínimo privilegio:** a cada usuario solo lo que necesita.

## Errores de SQL Server del curso (revisa esto primero)

| Número | Mensaje (resumido) | Casi seguro es… |
|---|---|---|
| **102** | `Incorrect syntax near …` | falta o sobra una coma, paréntesis o comilla |
| **207** | `Invalid column name` | columna mal escrita (o alias en el `WHERE`) |
| **208** | `Invalid object name` | tabla mal escrita o inexistente |
| **213** | `Column name or number of supplied values does not match` | valores ≠ columnas |
| **245** | `Conversion failed …` | texto donde va número (o `texto + número`) |
| **515** | `Cannot insert the value NULL …` | dato obligatorio ausente |
| **544** | `Cannot insert explicit value for identity column` | insertaste a mano un `IDENTITY` |
| **547** | `… conflicted with the FOREIGN KEY / REFERENCE constraint` | padre inexistente o hijos pendientes |
| **2627** | `Violation of PRIMARY KEY / UNIQUE KEY constraint` | llave repetida |
| **2714** | `There is already an object named …` | la tabla ya existe |
| **3726 / 4712** | `Could not drop / truncate … referenced by a FOREIGN KEY` | borrar un padre con hijos |
| **4901** | `ALTER TABLE only allows columns to be added that can contain nulls…` | columna `NOT NULL` sin `DEFAULT` en tabla con filas |
| **5074** | `The object … is dependent on column` | columna con una restricción |
| **8120** | `Column … is invalid in the select list…` | columna fuera del `GROUP BY` |
| **8152** | `String or binary data would be truncated` | texto más largo que la columna |
| **147** | `An aggregate may not appear in the WHERE clause` | agregado dentro del `WHERE` |

## Tu ruta mínima para una consulta

1. La pregunta en **una línea**: ¿qué tabla, qué columnas, qué filas?
2. **Entradas y salida**: qué tablas tengo y qué resultado quiero.
3. **Reglas** numeradas (filtros, orden, límites) y cuál va primero.
4. **Esqueleto** en comentarios: `SELECT` / `FROM` / `WHERE`…
5. Escribe **de a una cláusula** y ejecuta cada vez.
6. **Casos de borde**: tabla vacía, `NULL`, empates y mayúsculas.
