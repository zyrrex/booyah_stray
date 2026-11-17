---
id: sql5
curso: sql
clase: 5
title: DQL II, ordenar, limitar y resumir
subtitle: ORDER BY, TOP y OFFSET-FETCH, y las funciones de resumen (COUNT, SUM, AVG, MIN, MAX) con GROUP BY.
date: 17 nov 2026
icon: list
summary: ORDER BY (ASC/DESC, varias columnas), TOP y OFFSET-FETCH (y sus equivalentes LIMIT y FIRST), funciones de agregado y GROUP BY.
---

## El problema: no basta con filtrar

Con `WHERE` ya filtras filas. Pero todavía te faltan tres cosas muy comunes:

1. **Ordenar**: *“los más baratos primero”*.
2. **Limitar**: *“solo los 3 más caros”*, *“la página 2 de resultados”*.
3. **Resumir**: *“¿cuántos productos hay por categoría?”*, *“¿cuál es el precio promedio?”*.

Eso es lo que verás hoy. Las cláusulas nuevas son `ORDER BY`, `TOP`/`FETCH` y `GROUP BY`, y con ellas se completa casi toda tu caja de herramientas de consultas.

> [!tip] `HAVING` existe, pero todavía no
> Hay una cláusula `HAVING` (filtra **grupos**). Es **avanzada** y se verá más adelante. Por ahora, concéntrate en las demás.

## `ORDER BY`: ordenar el resultado

> [!regla] Sin `ORDER BY`, el orden **no está garantizado**
> Si no pides un orden, SQL Server devuelve las filas **en el orden que le resulte más cómodo** (muchas veces el de la llave primaria, pero **no hay promesa**). Si el orden te importa, **pide `ORDER BY`**.

```sql
-- @datos: tienda
SELECT nombre, precio
FROM   Producto
ORDER BY precio;
```

Por defecto ordena de **menor a mayor** (`ASC`, ascendente). Para **mayor a menor**, `DESC`:

```sql
-- @datos: tienda
SELECT nombre, precio
FROM   Producto
ORDER BY precio DESC;
```

| Palabra | Orden | En números | En textos |
|---|---|---|---|
| `ASC` (por defecto) | ascendente | 1, 2, 3 | A, B, C |
| `DESC` | descendente | 3, 2, 1 | C, B, A |

### Ordenar por **varias** columnas

Si dos filas empatan en la primera columna, la segunda **desempata**:

```sql
-- @datos: tienda
SELECT categoria, nombre, precio
FROM   Producto
ORDER BY categoria, precio DESC;
```

Lee así: *“primero por categoría (A→Z); dentro de cada categoría, del más caro al más barato”*. Cada columna lleva **su propio** `ASC`/`DESC`.

### Ordenar por un alias, por una expresión o por una posición

```sql
-- @datos: tienda
SELECT nombre, precio * stock AS valor
FROM   Producto
ORDER BY valor DESC;
```

> [!ojo] Aquí **sí** puedes usar el alias
> En el `WHERE` no podías (se evalúa antes del `SELECT`), pero **`ORDER BY` se ejecuta al final**, cuando el alias ya existe.

También puedes ordenar por **la posición** de la columna en el `SELECT` (`ORDER BY 2`), pero es frágil: si cambias el `SELECT`, cambia el orden. Mejor el nombre.

### `NULL` en el orden

En SQL Server, **`NULL` se considera el valor más pequeño**: va **primero** con `ASC` y **al final** con `DESC`.

```sql
-- @datos: colegio
SELECT nombre, nota
FROM   Alumno
ORDER BY nota;
```

### `WHERE` y `ORDER BY` juntos

`ORDER BY` va **al final** de la consulta:

```sql
-- @datos: tienda
SELECT nombre, categoria, precio
FROM   Producto
WHERE  categoria IN ('Bebidas', 'Snacks')
ORDER BY categoria, nombre;
```

```quiz
`ORDER BY precio DESC` muestra primero…
- el producto más barato
- el producto más caro *
- el primer producto que se insertó
> `DESC` es descendente: de mayor a menor. Primero el **más caro**.
```

## Limitar las filas: `TOP` y `OFFSET … FETCH`

A veces solo quieres **las primeras filas**: *“los 3 más caros”*. Cada motor tiene su forma:

| Motor | Cómo se escribe |
|---|---|
| **SQL Server** | `SELECT TOP 3 …` o `OFFSET … FETCH …` |
| MySQL / PostgreSQL | `… LIMIT 3` |
| Oracle (y el estándar) | `… FETCH FIRST 3 ROWS ONLY` |

En esta clase te importan las dos de **SQL Server**.

### `TOP n`

`TOP` va **justo después de `SELECT`**:

```sql
-- @datos: tienda
SELECT TOP 3 nombre, precio
FROM   Producto
ORDER BY precio DESC;
```

> [!error] `TOP` sin `ORDER BY` devuelve “las primeras n” **que casualmente salgan**
> *“Los 3 más caros”* **necesita** `ORDER BY precio DESC`. Sin él, `TOP 3` te da 3 filas cualesquiera. **Siempre combina `TOP` con `ORDER BY`.**

### `OFFSET … FETCH`: paginar

Para **saltar** filas y tomar un pedazo (la **página 2**, por ejemplo), usa `OFFSET` (cuántas saltar) y `FETCH NEXT` (cuántas traer). **Exige `ORDER BY`**:

```sql
-- @datos: tienda
SELECT id, nombre, precio
FROM   Producto
ORDER BY id
OFFSET 4 ROWS FETCH NEXT 4 ROWS ONLY;
```

Lee: *“ordenados por id, salta 4 filas y trae las 4 siguientes”* → los productos 5 al 8. Páginas de 4: la página 1 es `OFFSET 0`, la 2 es `OFFSET 4`, la 3 es `OFFSET 8`.

Y para que reconozcas los equivalentes de otros motores:

```sql-static
-- MySQL / PostgreSQL (NO funciona en SQL Server)
SELECT id, nombre, precio FROM Producto ORDER BY id LIMIT 4 OFFSET 4;

-- Oracle y estándar SQL
SELECT id, nombre, precio FROM Producto ORDER BY id FETCH FIRST 4 ROWS ONLY;
```

## Resumir con funciones de agregado

Una **función de agregado** toma **muchas filas** y las **resume en un solo valor**:

| Función | Devuelve | Ejemplo |
|---|---|---|
| `COUNT(*)` | cuántas **filas** hay | `COUNT(*)` |
| `COUNT(columna)` | cuántas filas tienen **dato** (no `NULL`) en esa columna | `COUNT(nota)` |
| `SUM(columna)` | la **suma** | `SUM(stock)` |
| `AVG(columna)` | el **promedio** | `AVG(nota)` |
| `MIN(columna)` | el **menor** | `MIN(precio)` |
| `MAX(columna)` | el **mayor** | `MAX(precio)` |

```sql
-- @datos: tienda
SELECT COUNT(*)    AS productos,
       SUM(stock)  AS unidades,
       MIN(precio) AS mas_barato,
       MAX(precio) AS mas_caro
FROM   Producto;
```

Con **agregados** el resultado es **una sola fila**. Y también funcionan **con `WHERE`** (primero se filtra, luego se resume):

```sql
-- @datos: tienda
SELECT COUNT(*) AS bebidas, SUM(stock) AS unidades_de_bebidas
FROM   Producto
WHERE  categoria = 'Bebidas';
```

### Los agregados ignoran los `NULL`

```sql
-- @datos: colegio
SELECT COUNT(*)      AS alumnos,
       COUNT(nota)   AS con_nota,
       COUNT(correo) AS con_correo
FROM   Alumno;
```

`COUNT(*)` cuenta **filas** (10). `COUNT(nota)` cuenta solo las filas con nota, o sea **8**. SQL Server además avisa en **Messages**: *“Null value is eliminated by an aggregate or other SET operation”*.

> [!error] `AVG` de números **enteros** devuelve un **entero**
> `AVG(nota)` con notas enteras **trunca los decimales** (no redondea): el promedio de 10 y 15 sale **12**, no 12.5.
>
> ```sql
> -- @datos: colegio
> SELECT SUM(nota) AS suma, COUNT(nota) AS cuantos, AVG(nota) AS promedio
> FROM   Alumno;
> ```
>
> 109 ÷ 8 = 13.6…, pero `AVG` muestra **13**. Para conservar decimales hay que convertir los números a decimales **antes** de promediar (por ejemplo, multiplicando por `1.0`). Lo importante: **sospecha de los promedios de enteros**.

### `COUNT(DISTINCT …)`: contar sin repetidos

```sql
-- @datos: tienda
SELECT COUNT(*) AS productos, COUNT(DISTINCT categoria) AS categorias
FROM   Producto;
```

## `GROUP BY`: un resumen **por grupo**

Hasta ahora resumiste **toda** la tabla. Con `GROUP BY` resumes **por grupos**: *“cuántos productos hay **en cada** categoría”*.

```sql
-- @datos: tienda
SELECT categoria, COUNT(*) AS cantidad
FROM   Producto
GROUP BY categoria
ORDER BY categoria;
```

SQL junta las filas **con el mismo valor** de `categoria` y aplica el agregado **a cada grupo**. Más ejemplos:

```sql
-- @datos: tienda
SELECT categoria,
       COUNT(*)     AS productos,
       SUM(stock)   AS unidades,
       MAX(precio)  AS mas_caro
FROM   Producto
GROUP BY categoria
ORDER BY unidades DESC;
```

```sql
-- @datos: colegio
SELECT grado, COUNT(*) AS alumnos, MAX(nota) AS mejor_nota
FROM   Alumno
GROUP BY grado
ORDER BY grado;
```

> [!regla] La regla de `GROUP BY`
> En el `SELECT` solo puedes poner: **(1)** columnas que estén en el `GROUP BY`, y **(2)** **funciones de agregado**. Cualquier otra columna da el error **8120**.

```sql
-- @datos: tienda
-- @error
SELECT categoria, nombre, COUNT(*) AS cantidad
FROM   Producto
GROUP BY categoria;
```

Piénsalo: si hay 3 productos en `Bebidas`, ¿cuál `nombre` mostraría para el grupo? SQL no puede elegir, y por eso **te lo prohíbe**.

> [!tip] Siempre agrega `ORDER BY` a un `GROUP BY`
> El orden en que salen los grupos **no está garantizado**. Si importa, **pídelo**.

### `WHERE` filtra filas; los agregados no van en el `WHERE`

`WHERE` se ejecuta **antes** de agrupar: filtra **filas**, así que **no puede** usar agregados.

```sql
-- @datos: tienda
-- @error
SELECT categoria, COUNT(*) AS cantidad
FROM   Producto
WHERE  COUNT(*) > 2
GROUP BY categoria;
```

Es el error **147**. (Filtrar por el resultado de un agregado se hace con `HAVING`, que verás más adelante.) Lo que **sí** puedes hacer es filtrar **filas** primero:

```sql
-- @datos: tienda
SELECT categoria, COUNT(*) AS con_stock
FROM   Producto
WHERE  stock > 0
GROUP BY categoria
ORDER BY categoria;
```

## El orden de ejecución, completo

| Paso | Cláusula | Qué hace |
|---|---|---|
| 1 | `FROM` | toma las filas de la tabla |
| 2 | `WHERE` | **filtra filas** |
| 3 | `GROUP BY` | **agrupa** las filas que quedaron |
| 4 | `SELECT` | calcula las columnas y los agregados |
| 5 | `ORDER BY` | **ordena** el resultado |
| 6 | `TOP` / `OFFSET-FETCH` | **recorta** las primeras filas |

```sql
-- @datos: tienda
SELECT TOP 2 categoria, SUM(stock) AS unidades
FROM   Producto
WHERE  precio < 10
GROUP BY categoria
ORDER BY unidades DESC;
```

Lee **en el orden de ejecución**: *toma `Producto` → quédate con los de precio menor a 10 → agrupa por categoría → suma el stock de cada grupo → ordena de mayor a menor → quédate con las 2 primeras.*

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| Error **8120** | pusiste en el `SELECT` una columna que no está en el `GROUP BY` ni dentro de un agregado |
| Error **147** | pusiste un agregado dentro del `WHERE` |
| Error **207** `Invalid column name` | usaste en el `WHERE` un alias del `SELECT` |
| Los grupos salen “desordenados” | te faltó un `ORDER BY` |
| `TOP 3` devuelve filas raras | te faltó el `ORDER BY` |
| `AVG` sin decimales | el promedio de enteros **trunca** |
| `COUNT(col)` da menos que `COUNT(*)` | hay `NULL` en esa columna |
| Una columna calculada sin nombre | te faltó el alias |
| Error **102** con `OFFSET` | `OFFSET … FETCH` exige `ORDER BY` |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | `ORDER BY` | 5.1 a 5.5 |
| 2 | `TOP` y `OFFSET … FETCH` | 5.6 a 5.9 |
| 3 | Funciones de agregado | 5.10 a 5.14 |
| 4 | `GROUP BY` e integradores | 5.15 a 5.20 |

**Reglas del juego**

- Si el orden importa, **pon `ORDER BY`** (el evaluador lo exige donde el enunciado lo pide).
- Los alias deben llamarse **exactamente** como dice el enunciado.
- Todavía **no** uses `HAVING`, `JOIN` ni subconsultas.
- Predice cuántas filas va a devolver **antes** de ejecutar. Y prueba **también en tu SSMS**.

## Resumen de la clase

- **`ORDER BY col [ASC|DESC], …`**: ordena; va **al final**; `NULL` es el menor; **sin él no hay orden garantizado**.
- **`TOP n`** (SQL Server) o **`OFFSET a ROWS FETCH NEXT b ROWS ONLY`** (exige `ORDER BY`); equivalentes: `LIMIT` (MySQL/PostgreSQL) y `FETCH FIRST` (Oracle).
- **Agregados:** `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`; ignoran `NULL`; `COUNT(*)` cuenta filas; `AVG` de enteros **trunca**.
- **`GROUP BY`**: un resumen por grupo; en el `SELECT` solo columnas del `GROUP BY` y agregados.
- Los agregados **no** van en el `WHERE`. (`HAVING`: más adelante.)
- Orden de ejecución: `FROM` → `WHERE` → `GROUP BY` → `SELECT` → `ORDER BY` → `TOP`.

Y ahora la **práctica**.
