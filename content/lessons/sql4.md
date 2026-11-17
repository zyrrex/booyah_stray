---
id: sql4
curso: sql
clase: 4
title: DQL I, hacer preguntas con SELECT, FROM y WHERE
subtitle: Elegir columnas, ponerles alias y filtrar filas con comparaciones, AND/OR/NOT, IN, BETWEEN, LIKE y NULL.
date: 16 nov 2026
icon: search
summary: SELECT y FROM, alias y expresiones, DISTINCT, y el filtro WHERE con comparaciones, AND/OR/NOT, IN, BETWEEN, LIKE e IS NULL.
---

## El problema: de toda la tabla, solo quiero esto

Una tienda puede tener **miles** de productos. Nunca vas a querer *“toda la tabla”*: querrás **los productos de Bebidas**, **los que cuestan menos de 5 soles**, **los que se quedaron sin stock**…

Para eso existe **DQL** (*Data Query Language*): el grupo de instrucciones que **permite hacer consultas de forma directa a las tablas**, con **operadores** y **secuencias** cada vez más precisas.

Una consulta completa tiene varias **cláusulas**, siempre en **este orden**:

| Cláusula | Pregunta que responde | ¿Cuándo la ves? |
|---|---|---|
| `SELECT` | ¿**qué columnas** quiero? | esta clase |
| `FROM` | ¿**de qué tabla**? | esta clase |
| `WHERE` | ¿**qué filas** cumplen una condición? | esta clase |
| `GROUP BY` | ¿cómo **agrupo** las filas? | clase 5 |
| `HAVING` | ¿cómo filtro los **grupos**? | más adelante (es avanzado) |
| `ORDER BY` | ¿en qué **orden** las muestro? | clase 5 |
| `TOP` / `FETCH` (`LIMIT`, `FIRST`) | ¿**cuántas** filas muestro? | clase 5 |

> [!tip] Una consulta **no cambia** la tabla
> `SELECT` solo **lee**. Puedes ejecutarla las veces que quieras sin miedo. (Lo peligroso era `UPDATE` y `DELETE`.)

## `SELECT` y `FROM`: qué columnas, de qué tabla

La consulta más corta posible:

```sql
-- @datos: tienda
SELECT * FROM Producto;
```

`*` = **todas** las columnas. Para elegir algunas, **escribe sus nombres** separados por comas. Salen **en el orden que tú escribas**, no en el de la tabla:

```sql
-- @datos: tienda
SELECT precio, nombre FROM Producto;
```

> [!ojo] En proyectos reales, evita el `*`
> `SELECT *` trae **todo**, incluso lo que no necesitas. Con muchas columnas y filas es lento. Escribe **solo las columnas que usarás**.

### Alias con `AS`: ponerle otro nombre a la columna del resultado

El **alias** cambia **el nombre que se muestra** en el resultado (no cambia la tabla):

```sql
-- @datos: tienda
SELECT nombre AS producto, precio AS precio_unitario
FROM   Producto;
```

Si el alias lleva espacios, ponlo entre **corchetes** (`[ ]`):

```sql
-- @datos: tienda
SELECT nombre AS [Nombre del producto], stock AS [Unidades en almacén]
FROM   Producto;
```

### Columnas calculadas (expresiones)

En el `SELECT` puedes **hacer cuentas** con las columnas de **cada fila** (`+`, `-`, `*`, `/`). Ponles alias para que tengan nombre:

```sql
-- @datos: tienda
SELECT nombre,
       precio,
       stock,
       precio * stock AS valor_en_almacen
FROM   Producto;
```

Y puedes escribir **valores fijos** como columnas:

```sql
-- @datos: tienda
SELECT nombre, precio * 1.18 AS precio_con_igv, 'S/' AS moneda
FROM   Producto;
```

> [!error] Una columna calculada **sin alias** no tiene nombre
> `SELECT precio * stock FROM Producto` funciona, pero la columna sale como **`(No column name)`**. Ponle siempre un alias.

### `DISTINCT`: sin repetidos

Si una columna repite valores (`categoria` se repite), `DISTINCT` muestra **cada valor una sola vez**:

```sql
-- @datos: tienda
SELECT DISTINCT categoria FROM Producto;
```

```quiz
`SELECT nombre, precio FROM Producto`, ¿qué muestra?
- todas las filas, pero solo las columnas `nombre` y `precio` *
- solo la primera fila
- todas las columnas de las filas que cuestan algo
> Sin `WHERE`, devuelve **todas las filas**. El `SELECT` solo elige qué **columnas** ves.
```

## `WHERE`: filtrar filas

`WHERE` va **después de `FROM`** y deja pasar **solo las filas que cumplen la condición**:

```sql-static
SELECT columnas
FROM   Tabla
WHERE  condicion;
```

Piensa en un **colador**: cada fila de la tabla pasa por el `WHERE`, y solo las que dan **verdadero** llegan al resultado. (Es el mismo razonamiento de los **booleanos** y del `if` de JavaScript.)

### Operadores de comparación

| Operador | Significa | Ejemplo |
|---|---|---|
| `=` | igual a | `categoria = 'Bebidas'` |
| `<>` (o `!=`) | **distinto** de | `categoria <> 'Bebidas'` |
| `>` / `<` | mayor / menor que | `precio > 10` |
| `>=` / `<=` | mayor o igual / menor o igual | `stock <= 20` |

> [!ojo] En SQL el igual es **uno solo**
> En JavaScript comparabas con `===`. En SQL, **comparar** es `=` (uno solo). Lo que en JavaScript era asignar, en SQL se hace con `SET` o `INSERT`.

```sql
-- @datos: tienda
SELECT nombre, categoria, precio
FROM   Producto
WHERE  categoria = 'Bebidas';
```

```sql
-- @datos: tienda
SELECT nombre, precio
FROM   Producto
WHERE  precio >= 10;
```

Una condición con **números**: sin comillas. Con **textos**: **con comillas simples**. Y como ya viste, SQL Server **no distingue mayúsculas de minúsculas** al comparar textos:

```sql
-- @datos: tienda
SELECT nombre, categoria
FROM   Producto
WHERE  categoria = 'bebidas';
```

### `AND`, `OR` y `NOT`: combinar condiciones

Son los **operadores lógicos** que ya conoces de la clase 1 de JavaScript (`&&`, `||`, `!`):

| Operador | La fila pasa si… |
|---|---|
| `A AND B` | **ambas** condiciones son verdaderas |
| `A OR B` | **al menos una** es verdadera |
| `NOT A` | `A` es falsa |

```sql
-- @datos: tienda
SELECT nombre, categoria, precio
FROM   Producto
WHERE  categoria = 'Lacteos' AND precio < 10;
```

```sql
-- @datos: tienda
SELECT nombre, categoria
FROM   Producto
WHERE  categoria = 'Bebidas' OR categoria = 'Snacks';
```

> [!regla] Cuando mezclas `AND` y `OR`, usa **paréntesis**
> `AND` se evalúa **antes** que `OR` (igual que la multiplicación antes que la suma). Los paréntesis te dan **prioridad** y evitan sorpresas: *“agrupa lo que debe resolverse junto”*.

```sql
-- @datos: tienda
-- Sin paréntesis: Lacteos con stock 0, O cualquier Snack
SELECT nombre, categoria, stock
FROM   Producto
WHERE  categoria = 'Lacteos' AND stock = 0 OR categoria = 'Snacks';
```

```sql
-- @datos: tienda
-- Con paréntesis: (Lacteos o Snacks) y además con stock 0
SELECT nombre, categoria, stock
FROM   Producto
WHERE  (categoria = 'Lacteos' OR categoria = 'Snacks') AND stock = 0;
```

Las dos consultas **parecen parecidas**, pero devuelven resultados distintos. Es la **precedencia** de siempre.

### `IN`: “está en esta lista”

En vez de encadenar muchos `OR`, usa `IN`:

```sql
-- @datos: tienda
SELECT nombre, categoria
FROM   Producto
WHERE  categoria IN ('Bebidas', 'Snacks', 'Limpieza');
```

`NOT IN` es lo contrario: la fila pasa si **no** está en la lista.

### `BETWEEN`: dentro de un rango (incluye los extremos)

```sql
-- @datos: tienda
SELECT nombre, precio
FROM   Producto
WHERE  precio BETWEEN 4 AND 8;
```

`BETWEEN 4 AND 8` equivale a `precio >= 4 AND precio <= 8`: **incluye el 4 y el 8**. Esos son los **bordes**: pruébalos siempre.

### `LIKE`: buscar por un pedazo de texto

Con `LIKE` comparas un texto contra un **patrón**, que usa dos comodines:

| Comodín | Significa |
|---|---|
| `%` | **cualquier cantidad** de caracteres (incluso ninguno) |
| `_` | **exactamente un** carácter |

| Patrón | Encuentra |
|---|---|
| `'A%'` | empieza con A |
| `'%a'` | termina con a |
| `'%ar%'` | contiene “ar” en cualquier parte |
| `'_gua%'` | una letra cualquiera y luego “gua” (`Agua 625ml`) |

```sql
-- @datos: tienda
SELECT nombre
FROM   Producto
WHERE  nombre LIKE 'A%';
```

```sql
-- @datos: tienda
SELECT nombre
FROM   Producto
WHERE  nombre LIKE '%1L';
```

```sql
-- @datos: tienda
SELECT nombre
FROM   Producto
WHERE  nombre LIKE '%ar%';
```

### `NULL`: se pregunta con `IS NULL`

Recuerda: `NULL` = **no hay dato**. Como no es un valor, **no se puede comparar con `=`**:

```sql
-- @datos: colegio
SELECT nombre, nota FROM Alumno WHERE nota = NULL;
```

**No devuelve nada** (y **no da error**: es una trampa silenciosa). Lo correcto es **`IS NULL`**:

```sql
-- @datos: colegio
SELECT nombre, nota FROM Alumno WHERE nota IS NULL;
```

Y su contrario, `IS NOT NULL`:

```sql
-- @datos: colegio
SELECT nombre, correo FROM Alumno WHERE correo IS NOT NULL;
```

> [!error] Las comparaciones con `NULL` nunca dan verdadero
> `nota = NULL`, `nota <> NULL`, `nota > 10` cuando `nota` es `NULL`… **ninguna cumple** el `WHERE`. Un `NULL` **no pasa** ningún filtro de comparación. Por eso en el siguiente ejemplo **Eva Lima** (nota `NULL`) y **Lucia Mora** (nota `NULL`) **no aparecen**, aunque “no tengan más de 10”:
>
> ```sql
> -- @datos: colegio
> SELECT nombre, nota FROM Alumno WHERE nota <= 11;
> ```

```quiz
¿Cuál de estas consultas devuelve a los alumnos **sin nota**?
- `WHERE nota = NULL`
- `WHERE nota = 0`
- `WHERE nota IS NULL` *
> `NULL` no se compara con `=`: se pregunta con `IS NULL`. Y `0` es una nota válida, no “sin nota”.
```

## Funciones de apoyo para el `SELECT` y el `WHERE`

Algunas funciones pequeñas que te ahorran trabajo (hay muchas más; estas son las básicas):

| Función | Qué hace | Ejemplo |
|---|---|---|
| `UPPER(t)` / `LOWER(t)` | pasa a mayúsculas / minúsculas | `UPPER(nombre)` |
| `LEN(t)` | cantidad de caracteres | `LEN(nombre)` |
| `ISNULL(x, y)` | si `x` es `NULL`, devuelve `y` | `ISNULL(nota, 0)` |
| `+` entre textos | **une** textos | `nombre + ' - ' + grado` |

```sql
-- @datos: colegio
SELECT UPPER(nombre) AS nombre_mayus,
       LEN(nombre)   AS letras,
       ISNULL(nota, 0) AS nota_o_cero
FROM   Alumno
WHERE  grado = '3ro';
```

```sql
-- @datos: colegio
SELECT nombre + ' (' + grado + ')' AS ficha
FROM   Alumno
WHERE  edad = 17;
```

> [!error] El `+` entre un texto y un **número** falla
> En JavaScript, `"Edad: " + 15` daba `"Edad: 15"`. **En SQL Server no**: intenta convertir `'Edad: '` a número y da el error **245**.
>
> ```sql
> -- @datos: colegio
> -- @error
> SELECT 'Edad: ' + edad FROM Alumno;
> ```
>
> Para unir texto con número hay que **convertir** el número a texto (`CAST(edad AS VARCHAR(3))`). Más adelante lo verás con calma.

## El orden en que SQL “piensa” tu consulta

Aunque **escribes** `SELECT` primero, SQL **piensa** en este orden:

1. **`FROM`**: ¿de qué tabla saco las filas?
2. **`WHERE`**: ¿cuáles de esas filas **pasan el filtro**?
3. **`SELECT`**: de las que pasaron, ¿qué columnas muestro?

Por eso **un alias definido en el `SELECT` no se puede usar en el `WHERE`** (todavía no existe cuando se filtra):

```sql
-- @datos: tienda
-- @error
SELECT nombre, precio * stock AS valor
FROM   Producto
WHERE  valor > 500;
```

La forma correcta es repetir la expresión:

```sql
-- @datos: tienda
SELECT nombre, precio * stock AS valor
FROM   Producto
WHERE  precio * stock > 500;
```

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| Error **207** `Invalid column name` | escribiste mal una columna, o usaste un alias en el `WHERE` |
| Error **208** `Invalid object name` | escribiste mal la tabla |
| No devuelve filas y no hay error | tu `WHERE` no coincide con nada (¿`= NULL`? ¿texto mal escrito?) |
| Devuelve **más** filas de las esperadas | un `OR` sin paréntesis, o falta una condición |
| Error **102** `Incorrect syntax` | falta una coma entre columnas, o sobra la coma antes de `FROM` |
| Error **245** | uniste texto con número usando `+` |
| `(No column name)` | olvidaste el alias de una columna calculada |
| Un texto no encuentra nada | faltan las comillas simples, o el texto no es el mismo |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | `SELECT`, `FROM`, alias y columnas calculadas | 4.1 a 4.6 |
| 2 | `WHERE`: comparaciones, `AND`, `OR`, `NOT` | 4.7 a 4.12 |
| 3 | `IN`, `BETWEEN`, `LIKE` | 4.13 a 4.17 |
| 4 | `NULL`, funciones y repaso | 4.18 a 4.22 |

**Reglas del juego**

- **Antes de ejecutar**, predice cuántas filas va a devolver.
- Escribe **solo las columnas** que piden; los **alias** deben llamarse **exactamente** como dice el enunciado.
- Cuando haya más de dos condiciones, **paréntesis**.
- Todavía **no** uses `ORDER BY`, `GROUP BY`, `HAVING`, `JOIN` ni subconsultas.
- Prueba **también en tu SSMS**.

## Resumen de la clase

- **DQL** = consultas. Orden de las cláusulas: `SELECT` → `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `ORDER BY` → `TOP`/`FETCH`.
- `SELECT columnas FROM Tabla`; `*` = todas; `AS` pone un alias; puedes calcular con las columnas; `DISTINCT` quita repetidos.
- `WHERE condición` deja pasar las filas que dan verdadero. Comparaciones: `=`, `<>`, `>`, `<`, `>=`, `<=`.
- `AND`, `OR`, `NOT`; mezclados, **con paréntesis**.
- `IN (lista)`, `BETWEEN a AND b` (incluye extremos), `LIKE` con `%` y `_`.
- **`NULL` se pregunta con `IS NULL` / `IS NOT NULL`**; con `=` nunca coincide.
- Los textos con comillas simples; la comparación de textos no distingue mayúsculas.
- SQL piensa: `FROM` → `WHERE` → `SELECT`.

Y ahora la **práctica** de consultas.
