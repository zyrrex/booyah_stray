---
id: clase4
clase: 4
title: Ternario y bucles
subtitle: Asignar valores en una línea y repetir tareas con for, break y continue sin caer en bucles infinitos.
date: 19 oct 2026
icon: refresh
summary: Operador ternario (simple y anidado), la idea de bucle, los operadores += -= ++ -- *=, for, break, continue y bucles infinitos.
---

## Repaso rápido (antes de avanzar)

Dos ideas de la clase 3 que hoy vas a necesitar:

- **`switch`** evalúa **una variable** contra valores exactos. Usa `case`, `default` y **`break`** para no “caer” a los casos siguientes.
- Un `if` evalúa **una condición** completa que se resuelve a `true` o `false`.

Si alguna duda quedó, vuelve a la clase 3 antes de seguir: lo nuevo se apoya en eso.

## El operador ternario

Mira este código. Solo quiere saber si alguien puede entrar a una fiesta:

```js
const edad = 20
let entraAFiesta

if (edad >= 18) {
  entraAFiesta = true
} else {
  entraAFiesta = false
}

console.log(entraAFiesta)
```

Son **5 líneas para decidir un solo valor**. El **operador ternario** lo hace en una:

```js
const edad = 20
const entraAFiesta = edad >= 18 ? true : false

console.log(entraAFiesta)
```

> [!regla] La forma del ternario
> **`condición ? valorSiVerdadero : valorSiFalso`**
> Se lee: “¿se cumple la condición? **sí** → el primer valor, **no** → el segundo”.

Es un `if / else` **que devuelve un valor**, por eso puedes asignarlo directo a una variable.

```js
const stock = 0
const estado = stock > 0 ? "disponible" : "agotado"
console.log(estado)
```

Y dentro de un template literal también funciona:

```js
const edad = 16
console.log(`Entrada: ${edad >= 18 ? "adulto" : "menor"}`)
```

### Ternarios anidados

Si hay **más de dos** resultados, pones otro ternario en la parte “falso” (después de los dos puntos):

```js
const nota = 14
const resultado = nota >= 16 ? "excelente" : nota >= 11 ? "aprobado" : "desaprobado"
console.log(resultado)
```

Lee en vertical: ¿nota ≥ 16? sí → “excelente”; no → ¿nota ≥ 11? sí → “aprobado”; no → “desaprobado”.

> [!ojo] Cuándo SÍ y cuándo NO
> El ternario (y mucho más el anidado) es para **asignar un valor directo**. Si necesitas hacer **varias cosas** (imprimir varias líneas, calcular, modificar varias variables), usa `if`. Un ternario largo es ilegible.

```quiz
¿Qué vale `x` en `const x = 7 > 10 ? "A" : "B"`?
- `"A"`
- `"B"` *
> `7 > 10` es falso, así que se toma el valor después de los dos puntos.
```

## Bucles: repetir sin copiar y pegar

Imagina pintar una cerca de 5 postes. No escribes “pinta poste 1, pinta poste 2…”. Dices: **“repite 5 veces: pinta un poste”**. Eso es un **bucle** (loop): una sentencia que **repite un bloque de código** un número de veces, y que **siempre debe tener un final**.

> [!error] El pecado de los bucles: el bucle infinito
> Un bucle que **nunca termina** consume recursos hasta que el programa se cuelga. Imagina un banco que nunca termina de depositar. En esta web tu código se detiene a los 2 segundos; en tu terminal tendrías que cortarlo con **Ctrl + C**.

### Los tres elementos de todo bucle

Todo bucle necesita:

1. **Inicializador**: dónde empieza el contador (`let i = 0`).
2. **Condición**: mientras sea verdadera, el bucle sigue (`i < 5`).
3. **Incremento**: cómo avanza el contador en cada vuelta (`i++`).

Si falta cualquiera, o el incremento nunca acerca la condición a ser falsa, es un bucle infinito.

### Hacerlo “a mano” para entender

Depósitos de 250 hasta llegar a 1000. Mira cuánto trabajo y cuántas posibilidades de equivocarse:

```js
let i = 0
let transacciones = 0
const monto = 250

transacciones = transacciones + 1   // 1
console.log(`Depósito ${transacciones}: ${monto}`)
transacciones = transacciones + 1   // 2
console.log(`Depósito ${transacciones}: ${monto}`)
transacciones = transacciones + 1   // 3
console.log(`Depósito ${transacciones}: ${monto}`)
```

Funciona, pero repetir y reasignar a mano es **peligroso si no se automatiza**.

### Abreviaturas de reasignación

| Largo | Corto | Qué hace |
|---|---|---|
| `i = i + 1` | `i += 1` | suma 1 |
| `i = i - 1` | `i -= 1` | resta 1 |
| `i = i + 1` | `i++` | suma **solo 1** |
| `i = i - 1` | `i--` | resta **solo 1** |
| `i = i * 2` | `i *= 2` | multiplica por 2 |
| `i = i / 2` | `i /= 2` | divide entre 2 |

`++` y `--` suben o bajan **únicamente de a uno**. Para otro paso (2, 10, el doble…) usa `+=`, `-=`, `*=`, `/=`.

## El bucle `for`

El `for` junta los tres elementos **en una sola línea**:

```js
for (let i = 0; i < 5; i++) {
  console.log(`Vuelta ${i}`)
}
```

Léelo así: *“empieza con `i = 0`; **mientras** `i < 5`; después de cada vuelta haz `i++`”*. Imprime las vueltas **0, 1, 2, 3, 4**: son 5 iteraciones, y el 5 ya no entra.

> [!tip] ¿Por qué empezamos en 0?
> Los programadores cuentan desde **0**: es la norma. Así los límites cuadran exactos: `i < 5` hace exactamente 5 vueltas. (Esto será clave cuando veas arreglos en la clase 6.)

Puedes cambiar el incremento para obtener otros saltos:

```js
for (let i = 1; i < 100; i *= 2) {
  console.log(i)
}
// 1, 2, 4, 8, 16, 32, 64
```

### Cómo seguir un bucle sin perderte (tabla de estado)

Escribe una fila por vuelta, y **no borres** los valores anteriores:

| Vuelta | `i` antes | ¿`i < 5`? | acción | `i` después |
|---|---|---|---|---|
| 1 | 0 | sí | imprime 0 | 1 |
| 2 | 1 | sí | imprime 1 | 2 |
| … | … | … | … | … |
| 6 | 5 | **no** | termina | — |

## Bucles infinitos: cómo detectarlos

Cuatro formas clásicas de pasarse:

```js-static
for (let i = 10; i > 0; i++) { ... }       // i sube, y i > 0 siempre es cierto
for (let i = 1; i != 10; i += 2) { ... }   // i = 1,3,5,7,9,11… ¡nunca vale 10!
for (let i = 0; i <= 20; i *= 2) { ... }   // 0 * 2 siempre es 0
for (let i = 0; i < 10; i--) { ... }       // i baja y siempre es < 10
```

> [!regla] Antes de ejecutar cualquier bucle, pregúntate
> **¿La condición puede volverse falsa?** ¿Mi incremento acerca el contador a ese punto? Y evita `!=` como condición de salida: usa `<` o `<=`.

## `break`: salir del bucle ahora mismo

`break` **termina el bucle inmediatamente** e ignora lo que quedaba. Se usa cuando ya conseguiste lo que buscabas, o cuando superas un límite.

```js
let transferido = 0
const monto = 400

for (let i = 0; i < 5; i++) {
  if (transferido + monto > 1000) break   // si me paso del límite, me detengo

  transferido = transferido + monto
  console.log(`Depósito ${i + 1}: ${monto} (acumulado ${transferido})`)
}

console.log(`El monto transferido fue: ${transferido}`)
```

## `continue`: saltar solo esta vuelta

`continue` **se salta el resto de la vuelta actual** y pasa a la siguiente. No sale del bucle.

```js
for (let i = 0; i < 6; i++) {
  if (i === 3) continue    // la vuelta 3 se omite
  console.log(`Vuelta ${i}`)
}
// Imprime 0, 1, 2, 4, 5  → falta el 3
```

> [!tip] La diferencia que importa
> **`break`** = *cancela todo* el proceso. **`continue`** = *ignora solo este elemento* y sigue con el siguiente. Piensa en buscar una palabra en una lista: `continue` descarta un elemento; `break` detiene la búsqueda completa.

### El orden de `break` y `continue` cambia el resultado

```js
// Versión A: continue primero
let texto = ""
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue      // los pares se saltan
  if (i % 4 === 0) break         // (nunca se ejecuta: todo múltiplo de 4 es par)
  texto += i + ","
}
console.log(texto)               // 1,3,5,7,9,
```

```js
// Versión B: break primero
let texto = ""
for (let i = 1; i <= 10; i++) {
  if (i % 4 === 0) break         // en el 4, el bucle termina
  if (i % 2 === 0) continue
  texto += i + ","
}
console.log(texto)               // 1,3,
```

Mismo código, **distinto orden**, resultado distinto. El orden de las reglas es parte de tu lógica.

```quiz
En un `for`, ¿qué hace `continue`?
- Termina el bucle por completo
- Se salta lo que queda de esta vuelta y sigue con la siguiente *
- Reinicia el bucle desde cero
> `break` es el que termina todo. `continue` solo omite la vuelta actual.
```

## Otros bucles (solo para que los reconozcas)

Existen `while` y `do while`. En la práctica se usan menos que `for` para contar; los verás en detalle en la clase 5. Por ahora, dominar `for`, `break` y `continue` es suficiente.

## Resumen de la clase

- **Ternario**: `condición ? siVerdadero : siFalso` para asignar valores directos.
- **Bucle**: repite un bloque; necesita inicializador, condición e incremento.
- `+=`, `-=`, `*=`, `++`, `--` abrevian la reasignación.
- `for (let i = 0; i < n; i++)` hace `n` vueltas.
- Si la condición nunca se vuelve falsa → **bucle infinito**.
- `break` sale del bucle; `continue` salta la vuelta actual.
- Haz **tabla de estado** a mano y revisa el orden de tus reglas.

Y ahora la **práctica**: ternarios, bucles `for`, `break` y `continue`.
