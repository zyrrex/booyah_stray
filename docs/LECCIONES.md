# Especificación de lecciones y ejercicios

> Cómo se **diseña** una clase de stray: su lección, su serie de ejercicios y los criterios para darla por buena.
> El **formato de los archivos** (cabeceras, secciones, `@tests`…) está en [`CONTENIDO.md`](CONTENIDO.md).
> La **filosofía** (por qué se enseña así) está en [`PEDAGOGIA.md`](PEDAGOGIA.md).

> Esta especificación es el **estándar para clases nuevas**. Las clases 1 a 9 se escribieron antes de fijarla y pueden no
> cumplir algún mínimo (por ejemplo, la cantidad de ejercicios de repaso); se ajustan cuando se toquen.

Una clase = **1 lección** (`content/lessons/claseN.md`) + **1 cuaderno de ejercicios**
(`content-private/exercises/claseN.md`) + una **actualización de la chuleta**.

---

## 1. Anatomía de una lección

### 1.1 Cabecera

```md
---
id: claseN                 # único
clase: N
title: Título corto
subtitle: Una frase que dice qué podrá hacer el alumno
date: 2 nov 2026
icon: bolt                 # un icono existente (ver src/components/Icon.tsx)
summary: Una línea para el mapa de clases
---
```

### 1.2 Secciones, en este orden

| # | Sección (`##`) | Qué lleva | Obligatoria |
|---|---|---|---|
| 1 | **El problema** | Una situación concreta donde falta la herramienta nueva (código repetido, datos sueltos…). 1 fragmento “antes” | Sí |
| 2 | **Idea central / definición** | La definición **con las palabras del tutor**, en un recuadro `[!regla]`. Qué es y para qué sirve | Sí |
| 3 | **Sintaxis y anatomía** | Ejemplo mínimo + tabla “parte → qué es” | Sí |
| 4 | **Ejecución** | Fragmentos **ejecutables** que se pueden editar y probar. Primero el caso feliz | Sí |
| 5 | **Cada concepto, por separado** | Una sección por concepto (`##`/`###`), de lo simple a lo difícil | Sí |
| 6 | **Errores típicos** | Con `[!error]` o tabla “síntoma → causa” | Sí |
| 7 | **Preguntas rápidas** | `quiz`, 1 cada 2–3 secciones (mín. 3 por lección) | Sí |
| 8 | **Profundiza** | `[!profundiza]` para detalles que sorprenden (opcional pero recomendado) | No |
| 9 | **Cuaderno de errores típicos** | Tabla final consolidada | Sí |
| 10 | **Cómo usar el cuaderno de práctica** | Tabla *día → tema → ejercicios* + **reglas del juego** | Sí |
| 11 | **Resumen de la clase** | 6–10 viñetas que cubren **todo** lo enseñado | Sí |

### 1.3 Longitud y ritmo
- Orientación: **250–550 líneas** de Markdown (se lee en 25–40 min con práctica de los fragmentos).
- **Una idea por sección.** Si una sección necesita dos ideas nuevas, se parte.
- Cada `##` se marca como **leída** al verse (+5 XP): cuida que cada una **tenga sentido sola**.

### 1.4 Bloques especiales

| Bloque | Uso |
|---|---|
| ```` ```js ```` | Fragmento ejecutable. **Reglas abajo (§1.5)** |
| ```` ```js-static ```` | Solo lectura: código que no debe ejecutarse (varias versiones comparadas con el mismo nombre, código que depende de algo externo) |
| ```` ```quiz ```` | 1.ª línea = pregunta; `- opción`; la correcta termina en ` *`; `> explicación` |
| `> [!regla]` | Definición o regla que **hay que recordar** |
| `> [!tip]` | Consejo práctico |
| `> [!ojo]` | Detalle que puede pasar desapercibido |
| `> [!error]` | Error clásico con su causa |
| `> [!profundiza]` | Ampliación de **lo ya enseñado** (no temas nuevos) |
| `> [!ejemplo]` / `> [!tu]` | Ejemplo guiado / pedir al alumno que lo intente |

### 1.5 Reglas de los fragmentos ejecutables
1. **Deterministas**: mismo resultado siempre (nada de fechas/azar sin necesidad).
2. **Cortos**: ≤ ~18 líneas; si pasa, se parte.
3. Cada fragmento **muestra algo**: termina en un `console.log` visible.
4. Un fragmento que **falla a propósito** (error de ejemplo) lo dice en el texto **antes** y en un comentario `// ✖ …`.
5. Nada de `this` a nivel superior (el navegador y Node difieren); sí dentro de métodos.
6. Si dos versiones del mismo código se comparan lado a lado, van en **`js-static`** (no tienen que ejecutarse juntas).
7. Variables en **español, sin tildes**; textos de salida, con tildes normales.
8. **Antes de publicar**, todos los fragmentos se ejecutan una vez (los errores deben ser **solo** los intencionales).

### 1.6 Voz
Cercana, directa, en **tú**. Frases cortas. Se explica **qué pasa y por qué**. Analogías cotidianas (licuadora, receta,
llave de la casa, cartel de la tienda). Se usan **los ejemplos y nombres del tutor** cuando existen. Sin tecnicismos
innecesarios; si aparece uno, se define en la misma frase. Ver [`PEDAGOGIA.md`](PEDAGOGIA.md) §6.

---

## 2. La serie de ejercicios (lo que **siempre** lleva una clase)

### 2.1 Composición mínima

| Requisito | Mínimo |
|---|---|
| Total de ejercicios | **15** (lo habitual: 16–25) |
| Predicción / rastreo | **≥ 30 %** del total |
| Integradores (nivel 3, mezclan todo lo de la clase) | **≥ 2** |
| Código con **casos de borde** | Todos los de código |
| Repaso de clases anteriores | **≥ 2** ejercicios que mezclen lo nuevo con algo previo |

### 2.2 Tipos que debe incluir

| Tipo | Qué entrena | Dónde va en la clase |
|---|---|---|
| **A. Predicción** (`predict`) | Leer y **predecir** antes de ejecutar; la tabla de estado | Al comienzo de cada bloque y antes de los difíciles |
| **B. Calentamiento** (`code`, nivel 1) | Aplicar **un** concepto, con enunciado casi guiado | Inicio del bloque |
| **C. Con decisiones y bordes** (`code`, nivel 2) | Varias reglas, empates, valores límite | Medio |
| **D. Corrección / lectura de error** | Encontrar qué está mal, o predecir **un error** (`@esperaerror`) | Mitad y final |
| **E. Elegir la herramienta** (`predict` de opción múltiple) | Decidir qué usar en cada situación (p. ej. “¿`for of` o `for in`?”) | Hacia el final |
| **F. Integrador** (`code`, nivel 3) | Combinar todo lo de la clase y de clases anteriores | **Último bloque** |

### 2.3 Bloques (“días”)
Los ejercicios se agrupan en **días de 60–90 minutos** (3–5 ejercicios cada uno), de lo simple a lo complejo. La tabla de
días va en la lección (§1.2, fila 10) y en el cuaderno se numera de corrido (`F1…F18`).

| Día típico | Contenido |
|---|---|
| 1 | Lo más básico del tema (predicción + 2 de calentamiento) |
| 2–4 | Un concepto por día, cada uno con predicción + código |
| 5 | Elegir la herramienta / errores |
| 6 | Integradores |

### 2.4 Niveles y XP

| Nivel | Estrellas | Perfil | XP base habitual |
|---|---|---|---|
| 1 | ★ | Un concepto, enunciado guiado | 25–40 |
| 2 | ★★ | Varias reglas, bordes, decisiones | 45–70 |
| 3 | ★★★ | Integrador, ambigüedad realista, mezcla de clases | 75–110 |

### 2.5 Numeración e ids

- **Id**: `s<clase>-<corto>` en minúscula (`s7-f12`). El prefijo `s<N>-` es obligatorio.
- **Número visible**: letra(s) + correlativo por clase (`F1…`, `I1…`, `FL1…`). Debe ser **único dentro de la clase**.
- **Etiquetas** (`tags`): 2–4 conceptos (`for of`, `return`, `default parameters`).

---

## 3. Cómo se escribe un buen ejercicio

### 3.1 Enunciado
1. Abre con **el contexto** (una situación, no un acertijo abstracto).
2. Dice **exactamente** qué debe imprimir: texto, orden, decimales, mayúsculas, símbolos. **La evaluación es carácter a
   carácter.**
3. Fija la **interfaz** cuando hay funciones: nombre, parámetros, qué **devuelve** y qué **imprime**, y **dónde** se llama.
4. Aclara las **ambigüedades** (¿mayor o *igual*? ¿empate? ¿primero o último?). Lo no aclarado es un fallo del enunciado.
5. Si pide una forma de escribir (flecha, `for of`…), lo dice y **advierte** que el evaluador solo ve la salida.
6. Evita temas **no enseñados** (ver [`PEDAGOGIA.md`](PEDAGOGIA.md) §2).

### 3.2 Datos y casos de prueba
- `@datos`: pocas variables `const`, en **una sola línea** cada una (las variantes sustituyen la línea).
- **Mínimo 3 casos** además del principal; lo habitual: **4–6**.
- Deben cubrir: **cada rama**, **bordes** (justo debajo / exacto / justo encima), **vacío o mínimo** (arreglo de 1,
  texto vacío), **empates**, **negativos** o `0`, y **datos que hacen fallar una solución hardcodeada**.
- **Aritmética exacta.** Usa números que den resultados sin ruido de coma flotante, o fija `toFixed(n)` en el enunciado y
  da la **fórmula exacta** (el orden de operaciones cambia los últimos decimales).
- **Los casos no pueden dar todos la misma salida** (el validador lo advierte).
- Para arreglos/objetos de datos, la línea `const x = [...]` va completa en **una** línea.

### 3.3 Solución de referencia
- Usa **solo lo enseñado** hasta esa clase.
- Está **comentada solo lo necesario**; es la forma que el tutor enseñaría, no la más “ingeniosa”.
- Se ejecuta **en Node al compilar** y debe coincidir con `@check` (y `$expect` si hay PDF/cuaderno de origen).

### 3.4 Pistas (`@pistas`)
- **2–3**, progresivas: **dirección → herramienta → casi la solución**. Nunca la solución completa.
- Cada pista cuesta 10 % del XP: deben **valer** ese costo.
- Las pistas son **públicas** (viajan en el bundle): nada que sea la solución literal.

### 3.5 Explicación (`@explicacion`, privada)
Una o dos líneas para el tutor: **la trampa principal**, el **error típico** del alumno y **qué caso de prueba lo
detecta**.

### 3.6 `@mostrar`
Se usa **siempre que la salida esperada ayude a orientarse** (la mayoría de los de código). Se omite cuando la salida
revelaría la lógica o cuando la gracia es descubrirla.

---

## 4. Ejercicios de predicción

| Elemento | Criterio |
|---|---|
| `@codigo` | Corto (≤ ~15 líneas), con una **trampa concreta** (orden, borde, copia vs. referencia, `undefined`…) |
| `@runafter` | Casi siempre: se puede ejecutar **después** de comprobar (predecir es lo que entrena) |
| `@norun` | Si el código no es ejecutable o ejecutarlo revelaría todo |
| `@esperaerror` | Si el código termina con un error **esperado** (se enseña a leer errores) |
| Preguntas | De **3 a 9**; mezcla de salida exacta (`out:N`), valores (`eval`), verdadero/falso y opción múltiple |
| Opción múltiple | Las opciones **no deben contener** ` => ` ni `|`; distractores **plausibles** (los errores reales del alumno) |
| Texto libre | Evita respuestas con tildes o espacios ambiguos: usa `eval`/`out` o elige opciones |

---

## 5. Checklist de calidad (antes de dar una clase por terminada)

**Contenido**
- [ ] Todo lo enseñado coincide con lo que el tutor **explicó**; nada de temas no vistos.
- [ ] Lo que el tutor dijo con imprecisión está **corregido** y se avisó al tutor.
- [ ] Cada concepto tiene ejemplo ejecutable, error típico y pregunta rápida.
- [ ] El resumen cubre **todo** lo enseñado.

**Ejercicios**
- [ ] ≥ 15 ejercicios; ≥ 30 % predicción; ≥ 2 integradores; ≥ 2 de repaso.
- [ ] Cada ejercicio de código: enunciado con salida fija, ≥ 3 casos, bordes, sin ambigüedad.
- [ ] Pistas progresivas, ninguna es la solución.
- [ ] No hay `NaN`, `undefined` ni decimales largos inesperados en ninguna variante.

**Técnico**
- [ ] `npm run validate` → `✔` y **0 advertencias**.
- [ ] Panel de tutor → **Validar contenido** → todo correcto.
- [ ] Los fragmentos ejecutables de la lección se probaron (solo fallan los intencionales).
- [ ] Chuleta y `CLAUDE.md` actualizados (estado y “aún no se ve”).
- [ ] `src/generated/bundle.json` regenerado y commiteado; `content-private/` respaldado.

---

## 6. Plantillas

### 6.1 Ejercicio de código

````md
### @ex s<N>-<id> | <NUM> | <Título> | code | <1-3> | <xp> | <tag1,tag2>
#### @enunciado
<Contexto>. Define **`nombre(params)`** que <qué devuelve/imprime>. Imprime exactamente:

```
Línea 1: ...
Línea 2: ...
```
#### @datos
```js
const dato = valor
```
#### @mostrar
#### @solucion
```js
// solución de referencia
```
#### @tests
```json
[{"dato": valorBorde}, {"dato": otroValor}, {"dato": valorMinimo}]
```
#### @check
```
salida del caso principal
```
#### @pistas
- dirección
- herramienta
#### @explicacion
Trampa principal y caso que la detecta.
````

### 6.2 Ejercicio de predicción

````md
### @ex s<N>-<id> | <NUM> | <Título> | predict | <1-3> | <xp> | <tags>
#### @enunciado
Qué se debe hacer (tabla de estado) y qué idea recordar.
#### @codigo
```js
// código corto con una trampa
```
#### @runafter
#### @preguntas
- ¿Qué imprime la línea 1? => out:1
- `expresion` => eval
- ¿Pregunta de opción? ?? A | B | C => B
#### @pistas
- ...
#### @explicacion
Resultado correcto y la trampa.
````

---

## 7. Cuándo ampliar o reorganizar

- **Una clase con > 25 ejercicios** → dividir en dos cuadernos (días).
- **Un tema que el alumno falla en la bitácora dos semanas seguidas** → añadir una clase de **refuerzo** (no nuevos
  temas), usando sus propios errores como ejercicios.
- **Un cambio en lo ya enseñado** (el tutor corrige algo) → actualizar lección, ejercicios y chuleta **a la vez**.
