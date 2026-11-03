---
id: metodo
clase: 0
title: Guía de resolución de problemas
subtitle: Tu problema no es la sintaxis: es el método. Estas herramientas te dicen qué hacer antes de escribir código.
date: 22 oct 2026
icon: compass
summary: Siete herramientas para leer, rastrear, ordenar, verificar y desbloquearte. Más tu propio método, versión 1.
---

## Para qué sirve esta guía

Cuando un ejercicio sale mal, casi nunca falta sintaxis: falta **método**. Esta guía te da herramientas para decidir **qué hacer antes de escribir código**, y al final armas **tu propio método**.

> [!regla] Regla madre: se responde la pregunta, no el código
> Un error **con análisis** te enseña algo: sabes en qué paso te equivocaste. Un error **por suposición** no te enseña nada: fue suerte.
> Antes de contestar, pregúntate: **¿esto lo vi en el código o lo supuse?**

## Tus 3 talones de Aquiles

Son tres, y cada uno tiene su herramienta.

| Talón | Cómo se ve | Herramienta |
|---|---|---|
| **1. Ordenar un programa** | En un ejercicio grande no sabías por dónde empezar y todo se enredó | 4 (descomponer) |
| **2. Perder el rastro de los valores** | Una variable cambió y no sabes en qué línea ni por qué | 2 (tabla de estado) y 5 (predice y ejecuta) |
| **3. Leer el código en vez de la pregunta** | `activo = true` arriba, `!activo` abajo, y dices “verdadero” porque te pierdes entre tantas líneas | 1 (lectura dirigida) y 3 (de adentro hacia afuera) |

Hay tres errores más que conviene vigilar: **confundir AND con OR**, **negar mal** una condición, y **errar por uno** en los límites (`>` contra `>=`). Si en tu bitácora ves que se repiten, anótalos como talón 4, 5 y 6.

## Herramientas 1 a 3: leer, rastrear, evaluar

### 1 · Lectura dirigida

No leas todo el código: **lee la pregunta y busca solo lo que ella nombra.**

1. Reescribe la pregunta en una línea: *“¿Cuánto vale `activo` en el `if`?”*
2. Marca las variables que la pregunta nombra. **Solo esas importan.**
3. Pon el dedo en la línea de la pregunta y **sube hasta la primera asignación** de esa variable. Ese es su valor; lo que está más arriba ya no cuenta.
4. Ignora el resto hasta que la pregunta te obligue a mirarlo.

```js-static
let activo = true
// ... 20 líneas de otras cosas ...
activo = intentos < 3
if (!activo) { ... }
```

Desde el `if` subes y la primera asignación es `activo = intentos < 3`, **no** el `true` del inicio.

### 2 · Tabla de estado

**Una columna por variable y una fila por cada línea que se ejecuta.** Anota el valor nuevo en su fila y **nunca borres el anterior**.

```js
let a = 2
let b = a
a = a * 5
b = b + a
```

| Línea | `a` | `b` |
|---|---|---|
| `let a = 2` | 2 | – |
| `let b = a` | 2 | 2 |
| `a = a * 5` | 10 | 2 |
| `b = b + a` | 10 | 12 |

Dos reglas: **`b = a` copia el valor**, así que si después `a` cambia, `b` no se entera. Y si una variable cambió, tiene que existir una fila con la línea que la cambió: si no la encuentras, búscala **dentro de un `if` o de un bucle**.

### 3 · Evaluar de adentro hacia afuera

Reemplaza las variables por sus valores, **resuelve el paréntesis más interno** y reescribe la expresión en cada paso, **una línea por paso**. Con `activo = false` y `edad = 17`:

```js
!(activo || edad >= 18)
!(false || 17 >= 18)
!(false || false)
!(false)
true
```

> [!tip] Recuerda
> **AND** exige que **todas** sean verdaderas. **OR** se cumple con **una sola**.

```quiz
Con `edad = 17` y `dni = true`, ¿cuánto vale `!(edad < 18 || !dni)`?
- `true`
- `false` *
> `edad < 18` es true, así que el OR da true, y negarlo da false.
```

## Herramienta 4: descomponer antes de escribir

Si no sabes por dónde empezar, el código no es el problema: **todavía no tienes el problema ordenado**. Estos pasos son un punto de partida; después los cambias a tu gusto.

1. **Una línea**: reescribe el enunciado con tus palabras.
2. **Entradas y salida**: qué datos tienes y qué debes producir.
3. **Reglas**: una oración del enunciado = una regla. Numéralas.
4. **Prioridad**: ¿qué regla manda sobre cuál? Eso decide el orden de los `if`.
5. **Esqueleto en comentarios**: el programa completo, sin una sola línea de código.
6. **Rellena de a una**: convierte una línea del esqueleto en código, ejecuta, y recién sigues.
7. **Prueba**: un caso por cada rama y los valores del borde.

### Ejemplo completo: el cine

*Un cine tiene los asientos 1 al 10. Los múltiplos de 4 están dañados y se saltan. Los asientos 1 a 3 (VIP) cuestan 20 y los demás 12. Apenas lo recaudado supera 100, se cierra la caja. Imprime cuántas entradas se vendieron y el total.*

```js-static
// ENTRADAS: asientos del 1 al 10 (los recorre el bucle)
// SALIDA: vendidas y total
// REGLAS:
// R1. asiento múltiplo de 4 -> dañado, se salta
// R2. asientos 1 a 3 cuestan 20; los demás, 12
// R3. si el total supera 100 después de vender -> cerrar caja
// PRIORIDAD: R1 va antes de vender; R3 va después de sumar
// ESQUELETO:
// total = 0, vendidas = 0
// para cada asiento de 1 a 10:
//   si está dañado -> saltar
//   precio = ?
//   sumar al total, contar la venta
//   si total > 100 -> cortar
// imprimir vendidas y total
```

Caso esperado, **calculado a mano antes de programar**: se venden los asientos 1, 2, 3, 5, 6, 7 y 9; el 9 deja el total en 108 y cierra la caja. Resultado: **7 entradas, total 108**.

Ahora conviértelo en código (de a una regla) y compruébalo:

```js
let total = 0
let vendidas = 0

for (let asiento = 1; asiento <= 10; asiento++) {
  if (asiento % 4 === 0) continue          // R1

  const precio = asiento <= 3 ? 20 : 12     // R2
  total += precio
  vendidas++

  if (total > 100) break                    // R3
}

console.log(`Entradas: ${vendidas}, total: ${total}`)
```

> [!ojo] Si no puedes escribir las reglas, no entendiste el enunciado
> Vuelve al paso 1 en vez de seguir tecleando.

## Herramientas 5 a 7: verificar y desbloquearte

### 5 · Predice, ejecuta, compara

1. **Antes** de ejecutar, escribe lo que crees que va a imprimir, con su tabla de estado.
2. Ejecuta.
3. Si coincide, sigue. Si no, **no toques el código**: busca en tu tabla **la primera fila donde tu valor y el real se separan**. Ahí está el error de razonamiento.
4. Para ver los valores reales usa `console.log("i:", i, "total:", total)` dentro del bucle o tras cada asignación.

Ejecutar sin predecir **no entrena nada**: solo cambias cosas hasta que sale.

### 6 · Casos de borde

Para cada número que aparezca en una condición, prueba **el valor justo debajo, el valor exacto y el valor justo encima**. Con `if (total > 100)` prueba **99, 100 y 101**. Prueba también un caso por cada rama y **uno en el que ninguna regla se cumpla**.

### 7 · Protocolo de bloqueo

Si llevas **10 minutos sin avanzar**, sigue este orden:

1. Escribe en una línea qué te piden.
2. Escribe qué datos tienes.
3. Ejecuta lo que ya tienes y anota qué funciona.
4. **Reduce**: comenta todo menos una regla.
5. **Explícalo en voz alta**, como si se lo contaras a otra persona.
6. Define **el siguiente paso más pequeño posible** y hazlo.

> [!error] Nunca
> Reescribas todo desde cero ni **adivines cambios**.

## La bitácora (5 minutos por ejercicio)

Al terminar un ejercicio, responde:

| Pregunta |
|---|
| ¿Cuánto tardé en empezar y qué hice los primeros 2 minutos? |
| ¿En qué paso me bloqueé: entender, ordenar, rastrear o probar? |
| ¿Qué hice para salir y funcionó? |
| Mi predicción contra el resultado real: ¿coincidieron? Si no, ¿en qué fila de mi tabla? |
| ¿Qué error fue por análisis y cuál por suposición? |
| Un cambio concreto a mi método para el próximo ejercicio |

En esta web, al resolver un ejercicio se abre sola la ventana de bitácora, y todo queda guardado en tu **Bitácora**.

## Cómo avanzar a los ejercicios grandes

Para pasar a los ejercicios grandes (tipo el cajero) necesitas cumplir **un solo criterio**:

- **7 de los 8 ejercicios leves correctos** (los verás en la práctica de la clase 5), y
- poder **explicar en voz alta la tabla de estado** de D2 o D8.

No importa cuánto tardes. En los ejercicios grandes **pide pistas, no soluciones**; y si te atoras, usa el **protocolo de bloqueo** antes de preguntar.

## Tu método

Un método no se descubre pensando en abstracto: **se descubre resolviendo y mirando qué hiciste**. Las herramientas de arriba son el punto de partida; quedarte con ellas, cambiarlas o descartarlas es tu decisión, **siempre que sepas por qué**.

Cuando termines los primeros ejercicios grandes, completa tus cinco frases en la tarjeta **“Mi método”** que está abajo. Cada 3 ejercicios, reescríbelo como versión 2, 3 y así.
