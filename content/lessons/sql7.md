---
id: sql7
curso: sql
clase: 7
title: DCL, permisos (conceptos) y repaso integrador
subtitle: Quién puede ver o cambiar qué con GRANT y REVOKE, y un repaso de todo el curso armando una base de datos completa.
date: 17 nov 2026
icon: lock
summary: Conceptos de DCL (usuarios, permisos, objetos, GRANT, REVOKE y DENY), el principio del mínimo privilegio y un proyecto integrador de DDL, DML y DQL.
---

## El problema: no todos deben poder hacer todo

Imagina la base de datos de una tienda con tres tipos de personas:

| Quién | Qué necesita | Qué **no** debería poder hacer |
|---|---|---|
| El **cajero** | consultar productos y registrar ventas | borrar productos o cambiar precios |
| El **contador** | consultar las ventas | modificar nada |
| El **administrador** | todo | — |

Si todos entran con el mismo poder, **un error** (o una mala intención) de cualquiera puede **destruir datos**. Controlar **quién puede acceder a qué** es lo que hace **DCL**.

> [!regla] Definición
> **DCL** significa ***Data Control Language*** y es el grupo de instrucciones que **permite dar diferentes permisos a los usuarios** para que puedan **acceder o no** a ciertos objetos de la base de datos.

Solo tiene dos instrucciones principales:

| Instrucción | Qué hace | Analogía |
|---|---|---|
| **`GRANT`** | **concede** un permiso | entregar una llave |
| **`REVOKE`** | **quita** un permiso que habías concedido | recoger la llave |

> [!tip] Esta clase es **conceptual**
> En DCL solo se explican **conceptos puntuales**; se profundizará **a futuro**. Aquí vas a **entender la idea** y a **leer** instrucciones de permisos. Crear usuarios reales exige un servidor propio, así que los ejemplos son para **leer** (y probarlos más adelante en SSMS).

## Las piezas: usuario, objeto y permiso

Toda instrucción DCL combina **tres cosas**:

| Pieza | Qué es | Ejemplos |
|---|---|---|
| **Quién** (usuario o rol) | la persona o grupo que recibe el permiso | `cajero`, `contador`, un **rol** como `ventas` |
| **Sobre qué** (objeto) | lo que se protege | una **tabla**, una vista, un procedimiento |
| **Qué puede hacer** (permiso) | la acción permitida | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |

Los **permisos** coinciden con las instrucciones de DML que ya conoces:

| Permiso | Permite… |
|---|---|
| `SELECT` | **leer** los datos |
| `INSERT` | **agregar** filas |
| `UPDATE` | **modificar** filas |
| `DELETE` | **borrar** filas |
| `ALTER` | **cambiar la estructura** (DDL) |
| `EXECUTE` | ejecutar un procedimiento almacenado |

Un **rol** es un **grupo** de permisos: en vez de dar permisos a 20 cajeros uno por uno, creas el rol `cajeros`, le das los permisos **una vez**, y metes a cada cajero en el rol.

## `GRANT`: conceder un permiso

```sql-static
GRANT permiso [, permiso ...]
ON    objeto
TO    usuario_o_rol;
```

Por ejemplo, el **cajero** puede **leer** y **agregar** ventas:

```sql-static
GRANT SELECT, INSERT ON Venta TO cajero;
GRANT SELECT ON Producto TO cajero;
```

Y el **contador**, solo **leer**:

```sql-static
GRANT SELECT ON Venta TO contador;
```

Con `WITH GRANT OPTION` el usuario puede, además, **darle ese permiso a otros** (úsalo con muchísimo cuidado):

```sql-static
GRANT SELECT ON Producto TO gerente WITH GRANT OPTION;
```

## `REVOKE`: quitar un permiso

```sql-static
REVOKE permiso [, permiso ...]
ON     objeto
FROM   usuario_o_rol;
```

Si el cajero ya no debe agregar ventas:

```sql-static
REVOKE INSERT ON Venta FROM cajero;
```

Fíjate en la **diferencia de palabras**: `GRANT … TO` y `REVOKE … FROM`.

## `DENY`: negar (una tercera instrucción de SQL Server)

SQL Server tiene también **`DENY`**, que **prohíbe explícitamente** un permiso, **aunque** el usuario lo reciba por otro lado (por ejemplo, desde un rol):

```sql-static
DENY DELETE ON Producto TO cajero;
```

| | `REVOKE` | `DENY` |
|---|---|---|
| Qué hace | **retira** el permiso concedido (queda “sin permiso”) | **prohíbe**: gana sobre cualquier `GRANT` |
| Analogía | recoger la llave | poner un candado |

## En SSMS: antes del `GRANT` hay que crear al usuario

En SQL Server, para dar permisos primero existe el **inicio de sesión** (*login*) del servidor y el **usuario** de la base de datos:

```sql-static
CREATE LOGIN cajero WITH PASSWORD = 'UnaClaveSegura#2026';   -- entra al servidor
CREATE USER cajero FOR LOGIN cajero;                         -- existe en esta base de datos
GRANT SELECT, INSERT ON Venta TO cajero;                     -- y recibe sus permisos
```

> [!ojo] Esto es solo para leer por ahora
> Una base de datos **real** guarda las contraseñas y los usuarios en el servidor. El simulador de esta web **acepta** estas instrucciones y responde *“Commands completed successfully”*, pero **no hace nada** (no hay usuarios que restringir). Para practicarlas de verdad usarás tu SSMS más adelante.

```sql
CREATE TABLE Venta (id INT NOT NULL PRIMARY KEY, monto DECIMAL(10,2) NOT NULL);

GRANT SELECT, INSERT ON Venta TO cajero;
REVOKE INSERT ON Venta FROM cajero;
```

## El principio del **mínimo privilegio**

> [!regla] Dale a cada usuario **solo lo que necesita**
> No concedas permisos “por si acaso”. Empieza con **nada** y agrega solo lo necesario. Un permiso que **nadie necesita** es un **riesgo** sin beneficio.

| Mala idea | Mejor |
|---|---|
| Darle a todos permisos de administrador | Un rol por tipo de trabajo, con lo mínimo |
| Que la aplicación web use el usuario administrador | Un usuario de aplicación que solo `SELECT`/`INSERT`/`UPDATE` lo necesario |
| Dejar `DELETE` para “comodidad” | Quitarlo y pedirlo cuando haga falta |

```quiz
Un usuario solo necesita **mirar** las ventas. ¿Qué le concedes?
- `GRANT SELECT ON Venta TO usuario` *
- `GRANT SELECT, INSERT, UPDATE, DELETE ON Venta TO usuario`
- Nada: hace falta ser administrador para leer
> **Mínimo privilegio**: solo `SELECT`. Los demás permisos serían un riesgo innecesario.
```

```quiz
¿Cuál instrucción **retira** un permiso concedido?
- `GRANT`
- `REVOKE` *
- `DROP USER`
> `REVOKE … FROM …` quita el permiso. (`DENY` en cambio lo prohíbe de forma explícita.)
```

## Repaso integrador: una base de datos completa

Ahora junta **todo el curso**. Vas a construir, poblar y consultar la base de datos de una tienda pequeña, **en el orden correcto**:

| Paso | Qué haces | Familia |
|---|---|---|
| 1 | Creas las tablas, **primero las padres** | DDL |
| 2 | Insertas los datos, **primero los padres** | DML |
| 3 | Corriges un dato (con `WHERE`) | DML |
| 4 | Consultas y resumes | DQL |
| 5 | Decides **quién** podría hacer qué | DCL (concepto) |

```sql
-- 1) DDL: las tablas (la padre primero)
CREATE TABLE Categoria (
  id     INT         NOT NULL IDENTITY(1,1),
  nombre VARCHAR(20) NOT NULL,
  CONSTRAINT PK_Categoria PRIMARY KEY (id),
  CONSTRAINT UQ_Categoria_nombre UNIQUE (nombre)
);

CREATE TABLE Producto (
  id           INT           NOT NULL IDENTITY(1,1),
  nombre       VARCHAR(30)   NOT NULL,
  precio       DECIMAL(10,2) NOT NULL,
  stock        INT           NOT NULL DEFAULT 0,
  categoria_id INT           NOT NULL,
  CONSTRAINT PK_Producto PRIMARY KEY (id),
  CONSTRAINT FK_Producto_Categoria FOREIGN KEY (categoria_id) REFERENCES Categoria (id)
);

-- 2) DML: los datos (el padre primero)
INSERT INTO Categoria (nombre) VALUES ('Bebidas'), ('Snacks'), ('Limpieza');

INSERT INTO Producto (nombre, precio, stock, categoria_id) VALUES
('Gaseosa 2L', 7.50, 80, 1),
('Agua 625ml', 1.50, 150, 1),
('Galletas',   2.20, 100, 2),
('Chocolate',  4.00, 0,   2),
('Detergente', 14.90, 18, 3);

-- 3) DML: corrijo un precio, con WHERE
UPDATE Producto SET precio = 4.50 WHERE nombre = 'Chocolate';

-- 4) DQL: preguntas
SELECT categoria_id, COUNT(*) AS productos, SUM(stock) AS unidades
FROM   Producto
GROUP BY categoria_id
ORDER BY categoria_id;

SELECT TOP 2 nombre, precio
FROM   Producto
ORDER BY precio DESC;
```

Mira todo lo que ya sabes hacer: **diseñar** el esquema con llaves y restricciones, **poblarlo**, **corregirlo** sin riesgo y **preguntarle** cosas.

### Checklist antes de dar por terminado un diseño

- [ ] Cada tabla tiene **llave primaria**.
- [ ] Las tablas **se relacionan** con FK donde corresponde (nada de tablas sueltas).
- [ ] Las columnas obligatorias son `NOT NULL`; las opcionales, `NULL`.
- [ ] Los tipos de dato son los **correctos** (`INT`, `DECIMAL`, `VARCHAR(n)`…).
- [ ] Las restricciones tienen **nombre** (`PK_`, `FK_`, `UQ_`).
- [ ] Los `UPDATE` y `DELETE` llevan **`WHERE`**.
- [ ] Los permisos siguen el **mínimo privilegio**.

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| Confundes `GRANT` con `REVOKE` | `GRANT … TO` concede; `REVOKE … FROM` retira |
| Un usuario “no puede” hacer algo | falta un `GRANT`, o hay un `DENY` (que gana) |
| Das demasiados permisos | aplica el mínimo privilegio |
| Error **547** al repasar | insertaste o borraste en el orden equivocado (padre/hijo) |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | Conceptos de permisos (DCL) | 7.1 a 7.6 |
| 2 | Repaso de DDL y DML | 7.7 a 7.10 |
| 3 | Integradores | 7.11 a 7.14 |

**Reglas del juego**

- Los ejercicios de DCL son de **concepto**: léelos y responde.
- En los integradores, **respeta el orden** padre → hijo.
- **No** uses `JOIN` ni `HAVING`: todavía no se ven.

## Resumen de la clase

- **DCL** controla **quién puede acceder a qué**: **`GRANT`** concede, **`REVOKE`** retira, **`DENY`** prohíbe (SQL Server).
- Un permiso combina **quién** (usuario o rol), **sobre qué** (objeto) y **qué puede hacer** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`…).
- `GRANT … TO …` · `REVOKE … FROM …`.
- **Mínimo privilegio**: solo lo que cada usuario necesita.
- Repaso del curso: **DDL** construye (padres primero), **DML** mueve datos (con `WHERE`), **DQL** pregunta, **DCL** controla el acceso.
- Lo que sigue: uniones de tablas (`JOIN`), `HAVING` y más.

Y ahora la **práctica**: conceptos de permisos y los integradores del curso.
