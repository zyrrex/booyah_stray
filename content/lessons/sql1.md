---
id: sql1
curso: sql
clase: 1
title: Bases de datos y SQL
subtitle: Qué es una base de datos, de qué está hecha una tabla y cuáles son las cuatro familias de instrucciones de SQL.
date: 15 nov 2026
icon: database
summary: SQL, bases de datos, tablas, columnas y filas; tipos de datos y NULL; SQL Server y SSMS; las familias DDL, DML, DQL y DCL.
---

## El problema: datos que no se pierden

Hasta ahora guardabas datos en **variables**, **objetos** y **arreglos**. Funcionan mientras el programa corre, pero cuando lo cierras **todo desaparece**. Y cuando tienes 10 000 clientes, ya no puedes tenerlos en un arreglo dentro del código.

Para guardar datos **de forma permanente, ordenada y consultable** existen las **bases de datos**. Y el idioma para hablar con ellas es **SQL**.

## Qué es SQL

> [!regla] Definición
> **SQL** significa ***Structured Query Language***, en español **Lenguaje Estructurado de Consultas**. Es un **lenguaje de programación enfocado en bases de datos**.

Y una **base de datos** es **una colección de entidades relacionadas**, donde cada una de ellas **almacena un grupo de datos definidos**.

Dicho en simple: una base de datos es un **archivador** con muchas **fichas ordenadas**, y SQL es el idioma con el que le pides al archivador: *“guarda esto”*, *“cámbiame aquello”*, *“muéstrame lo que cumpla tal condición”*.

## Las entidades se llaman tablas

Las **entidades** de una base de datos se llaman **tablas**. Una tabla se compone de **columnas** y **filas**:

| Parte | Qué es | Ejemplo |
|---|---|---|
| **Columna** | Cada **valor que solicita la tabla** para poder considerar un registro | `nombre`, `edad`, `nota` |
| **Fila** | Cada **registro** que insertas en la tabla | `Ana Torres, 15, 17` |
| **Celda** | El dato que cae en una fila y una columna | `17` |

Para tener una referencia clave: **imagina una hoja de Excel**. Las columnas son los encabezados y las filas son los registros. La **diferencia** con Excel es que en una base de datos las tablas **se relacionan entre sí** (lo verás en la clase 6).

Mira una tabla de verdad. Esta es `Alumno`, con 10 filas y 6 columnas. Pulsa **Ejecutar**:

```sql
-- @datos: colegio
SELECT * FROM Alumno;
```

> [!tip] `SELECT * FROM Alumno` se lee casi en español
> *“Seleccióname **todo** (`*`) **desde** (`FROM`) la tabla `Alumno`”*. El `*` significa **todas las columnas**.

Dos cosas que ya puedes ver en la tabla:

- Cada columna tiene un **nombre** y guarda **un solo tipo de dato** (números en `edad`, textos en `nombre`).
- Hay celdas que dicen **`NULL`**: son datos que **no existen** (Eva Lima todavía no tiene nota). Más abajo lo vemos.

También puedes pedir **solo algunas columnas**: las separas con comas.

```sql
-- @datos: colegio
SELECT nombre, nota FROM Alumno;
```

```quiz
En una tabla `Alumno` con 10 registros y 6 datos por alumno, ¿cuántas filas y cuántas columnas tiene?
- 6 filas y 10 columnas
- 10 filas y 6 columnas *
- 60 filas y 1 columna
> Cada **fila** es un registro (un alumno): 10 filas. Cada **columna** es un dato que pide la tabla: 6 columnas.
```

### Vocabulario (todo significa lo mismo)

Vas a escuchar distintas palabras para las mismas cosas:

| Palabra | También se dice |
|---|---|
| **Tabla** | entidad |
| **Columna** | campo, atributo |
| **Fila** | registro |

## Cada columna sabe qué tipo de dato guarda

Cuando se **crea** una tabla, cada columna declara **qué tipo de dato** admite. Los más comunes en SQL Server:

| Tipo | Guarda | Ejemplos |
|---|---|---|
| `INT` | números enteros | `15`, `-3`, `0` |
| `DECIMAL(10,2)` | números con decimales (10 cifras en total, 2 decimales) | `22.50`, `0.99` |
| `VARCHAR(30)` | texto de **hasta** 30 caracteres | `'Ana Torres'` |
| `CHAR(8)` | texto de **exactamente** 8 caracteres (se rellena con espacios) | `'12345678'` |
| `DATE` | una fecha | `'2026-11-15'` |
| `BIT` | verdadero (`1`) o falso (`0`) | `1`, `0` |

Reglas de escritura que ya conoces de JavaScript, con una diferencia:

- Los **textos** y las **fechas** van entre **comillas simples**: `'Ana'`. (En SQL **no** se usan comillas dobles para textos.)
- Los **números** van **sin comillas**: `15`, `22.50`.

### `NULL`: “no hay dato”

`NULL` significa **ausencia de dato**: “no sé”, “no aplica” o “todavía no hay”.

> [!ojo] `NULL` no es `0` ni `''`
> - Una nota de **`0`** es un dato: el alumno sacó cero.
> - Un texto vacío **`''`** es un dato: un texto sin letras.
> - **`NULL`** es **no tener dato**: aún no rindió el examen.
>
> Mezclarlos es un error clásico. (Lo mismo que `undefined` frente a `0` en JavaScript.) En la clase 4 aprenderás a preguntar por `NULL`.

## Tu motor: SQL Server y SSMS

En este curso el **motor de base de datos** es **SQL Server** de Microsoft, y la herramienta con la que escribes y ejecutas es **SSMS** (*SQL Server Management Studio*).

| En SSMS | Qué hace |
|---|---|
| **New Query** | abre una hoja en blanco para escribir SQL |
| **F5** o **Execute** | ejecuta lo que hay escrito (o solo lo que seleccionaste) |
| Pestaña **Results** | muestra la tabla que devuelve una consulta |
| Pestaña **Messages** | muestra mensajes: filas afectadas, errores |

Además, **en esta web** cada ejemplo y cada ejercicio de SQL tiene un botón **Ejecutar**: corre tu SQL en un **simulador de T-SQL** (el dialecto de SQL Server) que vive en tu navegador. No necesitas instalar nada para practicar.

> [!ojo] Un simulador no es SQL Server
> El simulador reproduce **lo que se enseña en este curso** (incluso los **mensajes de error** de SQL Server, que aparecen en inglés). Pero **siempre** debes **probar también en tu SSMS** y comprobar que te sale **lo mismo**. Si alguna vez sale distinto, avísale a Carlos: es un dato valioso.
>
> Lo que el simulador todavía no ejecuta (por ejemplo, las uniones `JOIN` que verás más adelante) se muestra como ejemplo de **solo lectura**: ahí tu SSMS es el único que puede ejecutarlo.

## Las cuatro familias de instrucciones

Las instrucciones de SQL se agrupan en **cuatro arquitecturas o modelos**. Piensa en una **casa**:

| Familia | Nombre completo | Para qué sirve | Analogía |
|---|---|---|---|
| **DDL** | *Data Definition Language* | **Crear** diferentes entidades y objetos de la base de datos | **Construir** la casa y sus habitaciones |
| **DML** | *Data Manipulation Language* | **Manipular la información** de las tablas | **Mudar** cosas: meter, cambiar, sacar |
| **DQL** | *Data Query Language* | **Consultar** las tablas de forma directa con operadores | **Mirar** y preguntar qué hay |
| **DCL** | *Data Control Language* | **Dar permisos** a los usuarios para acceder o no a ciertos objetos | **Entregar las llaves** |

Y sus instrucciones:

| Familia | Instrucciones |
|---|---|
| **DDL** | `CREATE` · `ALTER` · `DROP` · `TRUNCATE` · `RENAME` |
| **DML** | `SELECT` · `INSERT` · `UPDATE` · `DELETE` |
| **DQL** | `SELECT` · `FROM` · `WHERE` · `GROUP BY` · `HAVING` · `ORDER BY` · `LIMIT` / `FIRST` / `TOP` / `FETCH` |
| **DCL** | `GRANT` · `REVOKE` |

> [!tip] ¿Por qué `SELECT` está en dos familias?
> `SELECT` es la instrucción para **leer** datos, y por eso se la menciona tanto en DML como en DQL. **DQL** es el grupo de **cláusulas** (`FROM`, `WHERE`, `ORDER BY`…) con las que armas consultas cada vez más precisas. En las clases 4 y 5 te dedicarás a ellas.

> [!regla] Reglas de oro de DML
> - **`UPDATE`: no se ejecuta sin un `WHERE`.**
> - **`DELETE`: no se ejecuta sin un `WHERE`.**
>
> Sin `WHERE`, afectan a **todas las filas** de la tabla. Lo verás en acción en la clase 3.

## Tu primera tabla (para ver las familias trabajando)

Todavía no necesitas entender cada palabra: **fíjate en qué familia va cada paso**. Ejecuta el script completo:

```sql
CREATE TABLE Mascota (          -- DDL: construyo la tabla
  id     INT,
  nombre VARCHAR(20),
  edad   INT
);

INSERT INTO Mascota (id, nombre, edad)   -- DML: meto datos
VALUES (1, 'Toby', 3), (2, 'Mishi', 5);

UPDATE Mascota SET edad = 4 WHERE id = 1;  -- DML: cambio un dato (con WHERE)

SELECT * FROM Mascota;                   -- DQL: miro qué quedó
```

Los cuatro pasos tienen algo en común: **escribes una instrucción, la ejecutas y la base de datos responde**. En las próximas clases irás de a una familia por vez, con todos sus detalles.

## Cómo se escribe SQL: reglas básicas

- **Las palabras clave no distinguen mayúsculas de minúsculas**: `select`, `Select` y `SELECT` son lo mismo. Por convención se escriben en **MAYÚSCULAS** para distinguirlas de tus nombres.
- **Los nombres de tablas y columnas tampoco** distinguen mayúsculas (en la configuración por defecto de SQL Server): `Alumno` y `alumno` son la misma tabla.
- **Una instrucción puede ocupar varias líneas**. Termina cada instrucción con **`;`** (buena costumbre).
- **Comentarios:** `-- una línea` o `/* varias líneas */`.
- **Nombres:** sin espacios ni tildes, en **un solo idioma** (la misma regla que ya usas en JavaScript).
- **`GO`**: en SSMS separa “lotes” de instrucciones. **No es SQL**: es una orden de SSMS. A veces lo verás entre scripts.

```sql
-- @datos: colegio
select NOMBRE, Grado
from alumno
where grado = '3RO';
```

Las palabras clave en minúscula, los nombres con otra capitalización y hasta `'3RO'` frente a `'3ro'`: **todo funciona igual**. (En SQL Server, por defecto, la comparación de textos **no distingue mayúsculas de minúsculas**.)

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| `Invalid object name 'Alumnos'` | escribiste mal el nombre de la **tabla** o no existe en esta base de datos |
| `Invalid column name 'nom'` | escribiste mal el nombre de una **columna** |
| `Incorrect syntax near ...` | falta o sobra una coma, un paréntesis o una comilla; o una palabra está mal escrita |
| Una columna de texto dice `Invalid column name 'Toby'` | te faltaron las **comillas simples** del texto |
| Crees que “no devolvió nada” | revisa la pestaña **Messages**: puede haber un error ahí |

## Cómo usar el cuaderno de práctica

El cuaderno de esta clase se trabaja **por bloques**. No pases al siguiente hasta cerrar el anterior.

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | Leer una tabla: filas, columnas, tipos y `NULL` | 1.1 a 1.6 |
| 2 | Tus primeras instrucciones | 1.7 a 1.14 |

**Reglas del juego**

- **Antes de ejecutar**, predice qué va a devolver.
- Después de ejecutar en la web, **ejecútalo también en tu SSMS** y compara.
- Todavía **no** uses `JOIN`, `HAVING` ni subconsultas: no se han visto.
- Los nombres de tablas y columnas, **un solo idioma y sin tildes**.

## Resumen de la clase

- **SQL** = *Structured Query Language* (Lenguaje Estructurado de Consultas): lenguaje enfocado en **bases de datos**.
- Una **base de datos** es una **colección de entidades relacionadas**; cada entidad es una **tabla**.
- Una **tabla** = **columnas** (lo que pide cada registro) + **filas** (los registros).
- Cada columna tiene un **tipo de dato**; los textos van entre comillas simples; **`NULL`** = no hay dato (no es `0` ni `''`).
- Tu motor es **SQL Server**, y tu herramienta, **SSMS**. Siempre valida también en SSMS.
- Cuatro familias: **DDL** (estructura), **DML** (datos), **DQL** (consultas), **DCL** (permisos).
- `UPDATE` y `DELETE` **nunca** sin `WHERE`.

Y ahora la **práctica**: leer tablas y dar tus primeros pasos.
