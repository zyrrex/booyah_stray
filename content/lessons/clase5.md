---
id: clase5
clase: 5
title: Alcance, while y trabajo con textos
subtitle: Cómo se descompone un programa grande (el cajero), dónde "viven" las variables y cómo recorrer un texto.
date: 21 oct 2026
icon: target
summary: Revisión del cajero automático paso a paso, alcance de variables (scope), bucle while, índices de un texto y métodos de string y number.
---

## Un programa grande, paso a paso: el cajero automático

Esta clase empieza con un ejercicio que se siente enorme: un cajero con límites, intentos, mantenimientos y cortes. La clave **no es saber más sintaxis**: es **ordenar el problema**. Vamos a hacerlo como lo haría alguien con método.

**El enunciado, resumido:**

1. Si `saldo` no es number → `DATOS INVALIDOS` y se acaba.
2. Con un `switch`, el `limiteDiario` depende del tipo de cuenta (AHORROS 600, SUELDO 800, CORRIENTE 1000, otro 300).
3. Hay 6 intentos de retiro. El monto del intento `i` es `i * 100`.
4. Los intentos múltiplos de 3 están en mantenimiento: se saltan.
5. Si `retirado + monto` supera el límite **o** el monto supera el saldo: guarda el intento en `corte` y **corta**.
6. Si no, retira: suma a `retirado` y resta del `saldo`.
7. Al final imprime un resumen.

### Paso 1 · Separa lo de “antes del bucle” de lo de “dentro”

- **Antes del bucle**: validar el tipo de `saldo` y definir `limiteDiario`. Se hace **una sola vez**.
- **Dentro del bucle**: se repite en cada intento: saltar mantenimiento → comprobar si cabe → retirar.
- **Después del bucle**: imprimir el resumen.

### Paso 2 · El esqueleto, sin una línea de código

```js-static
// ANTES: validar saldo (typeof) ; limiteDiario (switch)
// DENTRO, en este orden, por cada intento i de 1 a 6:
//   1) ¿múltiplo de 3? → continue
//   2) monto = i * 100
//   3) ¿no cabe en el límite o supera el saldo? → corte = i ; break
//   4) retirar: sumar a retirado y restar del saldo
// DESPUÉS: imprimir el resumen
```

### Paso 3 · Código de a una regla, probando cada una

```js
const tipoCuenta = "AHORROS"
let saldo = 900
let retirado = 0
let corte = 0
let limiteDiario = 0

if (typeof saldo !== "number") {
  console.log("DATOS INVALIDOS")
} else {
  switch (tipoCuenta) {
    case "AHORROS": limiteDiario = 600; break
    case "SUELDO": limiteDiario = 800; break
    case "CORRIENTE": limiteDiario = 1000; break
    default: limiteDiario = 300
  }

  for (let i = 1; i <= 6; i++) {
    let monto = i * 100

    if (i % 3 === 0) continue

    if (retirado + monto > limiteDiario || monto > saldo) {
      corte = i
      break
    }

    retirado += monto
    saldo -= monto
  }

  console.log(corte != 0
    ? `Retiró S/ ${retirado} de S/ ${limiteDiario}. Cortó en el intento ${corte}`
    : `Retiró S/ ${retirado} de S/ ${limiteDiario}. Sin cortes`)
}
```

> [!ojo] Fíjate en dos decisiones de orden
> `continue` va **antes** de evaluar el corte: un intento en mantenimiento no debe poder cortar nada. Y el chequeo del límite va **antes** de retirar: primero compruebas si *cabe*, después lo sacas.

En clase se usó `monto % 3 === 0` y aquí `i % 3 === 0`. Aquí dan el mismo resultado, porque `monto` es `i * 100` y 100 no comparte factores con 3. Pero el enunciado habla de **intentos** múltiplos de 3, así que `i % 3` dice exactamente lo que quieres decir. **Cambia `100` por `150` en tu copia y mira qué versión se rompe.**

## Alcance de variables (scope)

Fíjate en esto: dentro del bucle declaramos `let monto`. ¿Existe `monto` **fuera** del bucle? Pruébalo:

```js
let retiros = 0

if (true) {
  let monto = 500
  retiros = retiros + monto
}

console.log(retiros)   // 500: declarada afuera, vive en todo el archivo
console.log(monto)     // ✖ ReferenceError: monto is not defined
```

> [!regla] Regla del alcance
> Una variable declarada con `let` o `const` **vive solo dentro del bloque `{ }` donde nació** (un `if`, un `for`…). Afuera **no existe**. Una variable declarada *antes* del bloque, en cambio, se ve desde dentro y desde fuera.

Por eso en el cajero `retirado`, `saldo` y `corte` están **fuera** del bucle (necesitamos leerlas al final), pero `monto` está **dentro** (solo importa en cada vuelta).

> [!tip] Dos variables con el mismo nombre
> Un `monto` dentro de un bloque y otro `monto` afuera **coexisten sin pisarse**: son distintas variables. Si te confundes, cambia el nombre de una.

```quiz
Declaras `let total = 0` dentro de un `for` y después del `for` haces `console.log(total)`. ¿Qué pasa?
- Imprime 0
- Imprime el último valor
- Error: `total is not defined` *
> `total` nació dentro del bloque del `for` y solo existe ahí. Si lo necesitas después, declara fuera.
```

## Textos: posiciones (índices)

Un texto es una **secuencia de caracteres**, y cada carácter tiene una **posición** que empieza en **0**:

| Texto | `C` | `a` | `r` | `l` | `o` | `s` |
|---|---|---|---|---|---|---|
| Posición | 0 | 1 | 2 | 3 | 4 | 5 |

```js
const nombre = "Carlos"

console.log(nombre[0])        // "C"
console.log(nombre[3])        // "l"
console.log(nombre.length)    // 6 → la cantidad de caracteres
console.log(nombre[nombre.length - 1])   // "s" → el último
```

`length` es la **cantidad**, y la última posición es `length - 1` (porque se empieza en 0).

### Métodos de string

Un **método** es una acción que le pides a un valor, escrita con punto y paréntesis:

```js
const nombre = "Carlos"

console.log(nombre.toUpperCase())     // "CARLOS"
console.log(nombre.toLowerCase())     // "carlos"
console.log(nombre.startsWith("Ca"))  // true  → ¿empieza con "Ca"?
console.log(nombre.endsWith("e"))     // false → ¿termina en "e"?
console.log(nombre.concat(" Rimachi"))// "Carlos Rimachi"
console.log(nombre.charAt(3))         // "l"   → igual que nombre[3]
```

Y para números hay `toFixed(n)`: deja **n decimales** (y devuelve un texto):

```js
const nro = 12.23434
console.log(nro.toFixed(3))   // "12.234"
```

## El bucle `while`

El `for` es ideal cuando **sabes cuántas veces** repetir. El **`while`** repite **mientras una condición sea verdadera**, y no trae contador integrado: **tú** manejas el inicializador y el incremento.

> [!regla] Comparación con lo que ya sabes
> `for` = inicializador + condición + incremento **en una línea**.
> `while` = **solo la condición**, parecido a un `if`, pero que se repite.

```js
let casado = false
let i = 0
const nombre = "maria"

while (!casado) {
  console.log(nombre[i])

  if (nombre[i] === "i") {
    casado = true          // encontró la "i": apaga la bandera
  }

  if (nombre.length === i) {
    casado = true          // llegó al final: apaga la bandera
  }

  i++                       // ¡NUNCA olvides avanzar el contador!
}
```

La variable `casado` es una **bandera**: arranca en `false`, y cuando pasa algo, se pone en `true` para que `!casado` se vuelva falso y el bucle termine.

> [!error] Riesgo número uno del while
> Si olvidas `i++` o nunca cambias la bandera, la condición **nunca** se vuelve falsa: **bucle infinito**. Antes de ejecutar, pregúntate: *¿qué hace que esto termine?*

### Valores de verdad dentro de un `while`

Recuerda la conversión implícita: **`0` es falso; los números positivos (y los textos con contenido) son verdaderos**. Eso permite condiciones como:

```js
let intentos = 3
while (intentos) {      // se repite mientras intentos NO sea 0
  console.log(`Quedan ${intentos}`)
  intentos--
}
```

```quiz
¿Cuántas veces se ejecuta el cuerpo de `let n = 3; while (n) { n-- }`?
- 3 *
- 2
- Infinitas
> `n` vale 3, 2, 1 (verdadero) y cuando llega a 0 la condición es falsa. Son 3 vueltas.
```

## Cómo estudiar esta clase

El video de la sesión conviene verlo **varias veces**: la primera, para seguir; la segunda, **pausando y prediciendo** qué va a pasar en cada línea. Y prueba tu código en cada paso: instala Node y usa tu editor.

## Resumen de la clase

- Un programa grande se ordena: **antes / dentro / después** del bucle, con esqueleto de comentarios.
- **Alcance**: `let` y `const` viven solo dentro de su bloque `{ }`.
- Un texto tiene posiciones desde 0; `length` cuenta caracteres; el último es `length - 1`.
- Métodos útiles: `toUpperCase`, `toLowerCase`, `startsWith`, `endsWith`, `concat`, `charAt`; y `toFixed` para números.
- `while (condición)` repite mientras sea verdadera: **tú** manejas el contador y la bandera.

> [!tu] Siguiente
> La práctica de esta clase es el **método de resolución**: primero lee la guía, resuelve los 8 ejercicios leves y luego los 15 ejercicios grandes.
