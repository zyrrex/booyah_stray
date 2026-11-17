# Cómo escribir contenido

## Regla de oro (pedagógica)

La lección y los ejercicios **solo usan lo que ya se explicó en las clases anteriores**. Se puede *profundizar* un tema
visto (más ejemplos, errores típicos, analogías, casos de borde), pero **no se introducen temas nuevos** que el alumno
todavía no ha visto en la videollamada: se satura. Si un enunciado necesita algo nuevo, se cambia el enunciado.

Convenciones del curso: variables en **español, sin tildes**, un solo idioma; datos en `const`, contadores en `let`;
nada de métodos de arreglos/objetos hasta que se enseñen.

## Lecciones — `content/lessons/*.md`

```md
---
id: clase7              # único; para las clases numeradas: clase<N>
clase: 7                # 0 = misión secundaria (como "metodo" y "chuleta")
title: Título corto
subtitle: Una frase
date: 2 nov 2026
icon: book              # compass, terminal, pencil, refresh, target, book, list, flag…
summary: Una línea para el mapa
---

## Cada ## es una sección (se marca como leída al verla)

Texto normal con **negritas**, `código en línea`, tablas, listas.
```

Bloques especiales:

| Bloque | Resultado |
|---|---|
| ```` ```js ```` | Fragmento **editable y ejecutable** (botón *Probar*) |
| ```` ```js-static ```` | Fragmento solo de lectura (código que no se puede ejecutar) |
| ```` ```quiz ```` | Pregunta rápida (+10 XP). Primera línea = pregunta; `- opción`, la correcta termina en ` *`; `> explicación` |
| `> [!tip] Título` | Recuadros: `tip`, `ojo`, `error`, `profundiza`, `ejemplo`, `regla`, `tu` |

## Ejercicios — `content-private/exercises/*.md` (privado)

Cada ejercicio empieza con una cabecera y secciones `#### @nombre`:

```md
### @ex s2-a1 | A1 | Portero de discoteca | code | 2 | 35 | if,else if
                    id  | num |   título           | kind |lvl|xp| etiquetas
```

- `id` debe empezar con `s<clase>-` (curso JavaScript) o `q<clase>-` (curso SQL, ver más abajo). `kind`: `code` (el alumno escribe código) o `predict` (responde preguntas).
- `lvl` 1–3 (estrellas), `xp` base.

### Ejercicio de código (`code`)

| Sección | Contenido |
|---|---|
| `@enunciado` | Markdown. Debe decir **exactamente** qué imprimir (la evaluación compara la salida) |
| `@datos` | ```` ```js ```` con `const x = …`; son los datos que el alumno ve y que se anteponen a su código |
| `@starter` | Esqueleto inicial del editor (opcional) |
| `@solucion` | Solución de referencia (**privada**, cifrada) |
| `@tests` | ```` ```json ```` lista de variantes (ver abajo) |
| `@check` | Salida esperada del caso principal (verifica la solución al compilar) |
| `@mostrar` | (bandera) muestra al alumno la salida esperada (solo si el cuaderno original ya la trae) |
| `@pistas` | Lista `- pista` (cada una resta 10 % de XP) |
| `@explicacion` | Markdown privado: trampas y casos |

**`@tests`** — cada variante es un objeto. Las claves normales **reemplazan** la línea `const clave = …` de `@datos`
(debe ser una sola línea). Claves especiales:

- `"$append": "productos[3].stock = 10"` → código extra después de los datos.
- `"$data": "const celulares = […]"` → reemplaza todos los datos de ese caso.
- `"$expect": ["línea 1", "línea 2"]` → comprueba que la solución produce justo eso (útil para validar contra un PDF).
- `"$label": "Nombre del caso"`.

Cada rama del enunciado necesita al menos un caso. Incluye **bordes** (justo debajo / exacto / justo encima).

### Ejercicio de predicción (`predict`)

| Sección | Contenido |
|---|---|
| `@enunciado` | Markdown |
| `@datos` | (opcional) variables de contexto para las expresiones |
| `@codigo` | (opcional) código para leer/ejecutar. Con `@norun` no es ejecutable; con `@runafter` solo se puede ejecutar tras comprobar |
| `@esperaerror` | (bandera) el código termina con un error esperado |
| `@preguntas` | Lista de preguntas (abajo) |

Formatos de pregunta (`- etiqueta => respuesta`):

| Formato | Significado |
|---|---|
| `` - `a + b` => eval `` | Evalúa la expresión con `@datos` (y `@codigo`) y exige ese valor. Los textos van con comillas |
| `- etiqueta :: expr => eval` | Igual, mostrando otra etiqueta. Si `expr` lleva backticks, enciérrala en doble: ``` `` `${x}` `` ``` |
| `=> eval:raw` | Para strings: acepta con y sin comillas (ej. resultados de `typeof`) |
| `=> out:N` | La línea N que imprime `@codigo` |
| `=> out:N:K` | El valor K (separado por espacios) de la línea N |
| `=> bool:true` | Verdadero/Falso con botones |
| `etiqueta ?? op1 \| op2 \| op3 => op2` | Opción múltiple |
| `=> 78.54` / `=> a ;; b` | Texto libre; `;;` separa respuestas alternativas aceptadas |

Las respuestas se publican solo como hashes; el alumno recibe “correcta/incorrecta” por fila, nunca la respuesta.

## Curso SQL (SQL Server)

**Lecciones** `content/lessons/sqlN.md`: frontmatter `curso: sql`, `id: sqlN`, `clase: N`. Fragmentos:

- ```` ```sql ```` → editor ejecutable en el simulador. Primera línea opcional: `-- @datos: tienda` (o `colegio`; carga un
  dataset de `content/sql/datasets/`) y/o `-- @error` (el ejemplo debe fallar; `check:lessons` lo exige).
- ```` ```sql-static ```` → solo lectura (para lo que el simulador no ejecuta, p. ej. `GRANT`).

**Ejercicios** `content-private/exercises/sqlN.md`: ids `qN-k`, cabecera como en JS y `#### @lenguaje` con `sql`.
Los de **código** usan:

| Sección | Contenido |
|---|---|
| `@datos` | ```` ```sql ```` script inicial (se ejecuta antes del SQL del alumno) |
| `@solucion` | Solución de referencia en T-SQL (cifrada) |
| `@tests` | Variantes: `$append` (SQL extra tras los datos), `$data` (reemplaza `@datos`), `$post` (SQL oculto tras el código del alumno), `$expect`, `$label` |
| `@check` | Salida esperada del caso principal: celdas separadas por ` \| `, encabezado primero, y líneas `Error <num>` |
| `@verificar` | SQL oculto que se ejecuta **después** del código del alumno (comprueba el estado final de las tablas) |
| `@esperaerror` | (bandera) la solución debe terminar en error |
| `@mostrar` | (bandera) muestra al alumno la salida esperada |

Se compara lo que **muestran las consultas** (encabezado + filas) y los errores (`Error 2627`). Las filas se comparan sin
importar el orden, **salvo** que la solución use `ORDER BY` (entonces el orden cuenta). Los mensajes “(N rows affected)” son
solo informativos. Usa siempre `ORDER BY` en `@verificar` para que el resultado sea estable.

**Predicción SQL** (`predict` con `@lenguaje sql`): formatos de pregunta `=> out:N`, `=> out:N:K` (separa por ` | `),
`=> rows[:S]` (cantidad de filas del resultado S), `=> cell:R:C[:S]`, `=> err[:N]` (número de error), `=> sql` (primera
celda de una consulta que corre tras `@datos` + `@codigo`), opción múltiple `?? a | b => a` y texto `=>`. `eval` no existe en SQL.
Para **DCL** (que no se puede ejecutar) usa solo opción múltiple.

Reglas: sin `JOIN`, `HAVING`, subconsultas, `CASE`, `UNION` ni variables (el simulador los rechaza como “unsupported”).

## Flujo

```bash
npm run validate   # ejecuta TODAS las soluciones; falla si alguna no cumple sus casos
npm run dev        # revisa en el navegador (panel de tutor → "Validar contenido" repite la prueba en el navegador)
npm run build:all
```
