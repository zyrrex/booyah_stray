---
id: clase1
clase: 1
title: Datos, variables y operadores
subtitle: La base de toda la lógica de programación: qué es un dato, cómo se guarda y cómo se compara.
date: 12 oct 2026
icon: compass
summary: Datos, variables, constantes, los tres tipos principales, operadores aritméticos, relacionales y lógicos.
---

## Lo que vas a dominar hoy

Programar es **darle instrucciones precisas a una computadora**. Antes de hablar de bucles o funciones necesitas cuatro piezas que aparecen en *todo* programa:

1. **Datos**: la información con la que trabajas.
2. **Variables y constantes**: dónde la guardas.
3. **Operadores**: cómo la combinas y la comparas.
4. **Decisiones**: qué hace el programa según lo que encuentre (eso lo verás completo en la clase 2).

> [!regla] Cómo se aprende esto
> No se aprende leyendo, se aprende **ejecutando y equivocándose con análisis**. Cada cuadro de código de esta lección se puede editar y probar con el botón *Probar*. Cámbialo, rómpelo, míralo fallar.

## Todo empieza con un dato

Un **dato** es cualquier cosa que puedes nombrar y guardar: un nombre (`"Luis Angel"`), una edad (`17`), un estado (`true`), un número de transacción. Sin importar qué signifique para ti, para el programa es **un valor**.

> [!tip] Idea clave
> Un nombre, una marca, un estado, una cualidad, un número de operación: todo eso, visto desde la lógica, es simplemente **un dato (un valor)**.

## Variables: ponerle nombre a un dato

Un dato suelto no sirve de mucho: necesitas poder **referirte a él** más tarde. Una **variable** es un nombre que apunta a un dato.

Hay cuatro palabras que vas a usar mucho, y conviene distinguirlas:

| Palabra | Qué significa | Ejemplo |
|---|---|---|
| **Definición / declaración** | Crear el nombre de la variable | `let usuario` |
| **Asignación** | Darle su primer valor | `usuario = "Luis Angel"` |
| **Reasignación** | Cambiarle el valor más adelante | `usuario = "Juanito"` |
| **Uso** | Leer su valor actual | `console.log(usuario)` |

En la práctica se hacen las dos primeras en una sola línea:

```js
let usuario = "Luis Angel"   // definición + asignación
console.log(usuario)

usuario = "Juanito"          // reasignación: sin let, la variable ya existe
console.log(usuario)
```

Fíjate en dos cosas:

- El **último valor asignado** es el que cuenta. Lo anterior ya no existe.
- Las líneas se ejecutan **en orden, de arriba hacia abajo**. El programa no “sabe” lo que viene después.

> [!error] Error típico
> Escribir `let usuario` dos veces. Una variable se define **una sola vez**; después solo se reasigna. Los nombres no deben repetirse.

### Reglas de nombres (las que usamos en este curso)

- Un solo idioma: **español**, sin mezclar con inglés (`edad`, no `age`).
- **Sin tildes** ni espacios: `anios`, `acompanante`, `saldoFinal`.
- Que diga qué guarda: `precioTotal` es mejor que `x`.
- Mayúscula en cada palabra nueva después de la primera: `dniAcompanante`.

```quiz
¿Cuál es un nombre de variable correcto según las reglas del curso?
- `acompañante`
- `dniAcompanante` *
- `mi edad`
> Sin tildes, sin espacios y en un solo idioma. `dniAcompanante` cumple las tres.
```

## Constantes: valores que no cambian

Algunos datos **no deben cambiar nunca**: el número π, los meses del año, un porcentaje de impuesto. Para eso existe `const`:

```js
const PI = 3.1416
console.log(PI)

PI = 3.14   // ✖ esto falla
```

Pruébalo: JavaScript se detiene con `Assignment to constant variable`. No es un fallo de la computadora; es **una protección**. Si el valor debe poder cambiar, usa `let`; si no debe cambiar, usa `const`.

> [!tip] Regla práctica
> Si no vas a reasignar, escribe `const`. Si algún día necesitas cambiarlo, el error te avisará y recién ahí lo pasas a `let`.

Un programa puede tener **cuantas variables y constantes necesite**.

## Los tres tipos de datos principales

No todos los datos son del mismo “tipo”. Tres bastan para empezar:

| Tipo | Se llama en inglés | Ejemplos |
|---|---|---|
| Texto | **string** | `"Carlos"`, `'c'`, `"9"`, `"you"` |
| Verdadero / falso | **boolean** | `true`, `false` |
| Número | **number** | `12`, `12.4`, `-12`, `19090909009090` |

- Un string siempre va **entre comillas** (simples o dobles). Por eso `"9"` es un texto, aunque parezca un número; y `9` sin comillas sí es un número.
- Un boolean **no lleva comillas**: `true` es un valor; `"true"` es solo un texto que dice “true”.
- Aprende los nombres en inglés: casi toda la documentación técnica está en inglés.

```js
let nombre = "Max"
let edad = 8
let esMayor = true

console.log(nombre, edad, esMayor)
```

```quiz
¿De qué tipo es el valor `"12"`?
- number
- string *
- boolean
> Lleva comillas, así que es un texto (string), aunque sus caracteres sean dígitos.
```

> [!profundiza] Para profundizar: tipado dinámico
> En JavaScript una variable puede cambiar de tipo con el tiempo (`let x = 5` y luego `x = "hola"`). Esto se llama *tipado dinámico*. Más adelante, en la clase 3, lo compararás con Java, que no lo permite.

## Verdadero y falso: la conversión implícita

Dentro de una condición (`if`), JavaScript necesita un **booleano**. Si le das otra cosa, la convierte solo. La regla que debes memorizar para lo que hemos visto:

- El número **`0`** se comporta como **falso**.
- **Cualquier otro número** (incluso `-3`) se comporta como **verdadero**.
- Un texto **vacío** (`""`) es falso; un texto **con contenido** es verdadero.

Mira esto con los ojos bien abiertos:

```js
console.log(Boolean(0))        // falso
console.log(Boolean(5))        // verdadero
console.log(Boolean(-3))       // verdadero: solo el 0 es falso
console.log(Boolean(""))       // falso: texto vacío
console.log(Boolean("hola"))   // verdadero: texto con contenido
console.log(Boolean("0"))      // ¿qué crees? predice antes de ejecutar
```

> [!error] Error típico
> Creer que `-3` es falso porque “es negativo”. **Solo el 0 es falso**. Y creer que `"0"` es falso: es un texto con contenido, así que es verdadero.

## Operadores aritméticos

Sirven para hacer cuentas: suma `+`, resta `-`, multiplicación `*`, división `/` y **módulo** `%` (el residuo de una división; lo usarás muchísimo en la clase 3).

```js
let a = 12
let b = 3
let c = a / b

console.log(a + b)   // 15
console.log(a - b)   // 9
console.log(a * b)   // 36
console.log(c)       // 4
```

### Precedencia: quién va primero

Igual que en matemáticas: primero **multiplicación y división**, luego **suma y resta**, y al final lo que está entre **paréntesis** gana a todo.

```js
console.log(15 + 4 * 2)     // 23 → primero 4 * 2
console.log((15 + 4) * 2)   // 38 → primero el paréntesis
```

> [!tip] Cómo resolver una expresión sin perderte
> Reemplaza las variables por sus valores, resuelve **el paréntesis más interno** y reescribe la expresión **una línea por paso**. Es la herramienta 3 de la guía de método.

## Operadores relacionales: comparar

Comparan dos datos y **siempre devuelven un boolean**.

| Operador | Significa |
|---|---|
| `>` `<` | mayor que, menor que |
| `>=` `<=` | mayor o igual, menor o igual |
| `==` | igual que (compara el valor) |
| `!=` | diferente de |
| `===` | igual en valor **y en tipo** |

```js
let a = 12
let b = 12.1
let c = "12"

console.log(a > b)     // false
console.log(a <= b)    // true
console.log(a == c)    // true:  12 y "12" tienen el mismo valor
console.log(a === c)   // false: pero uno es number y el otro string
```

> [!error] Error típico que ya apareció en clase
> Un solo `=` **asigna**; dos `==` o tres `===` **comparan**. Escribir `if (edad = 18)` en vez de `if (edad == 18)` es uno de los errores más comunes. Cuando un programa “hace cosas raras”, revisa primero esto.

```quiz
Con `a = 20` y `c = "20"`, ¿cuánto vale `a === c`?
- `true`
- `false` *
> Tienen el mismo valor, pero distinto tipo (number contra string). `===` exige ambas cosas.
```

## Operadores lógicos: combinar condiciones

Cuando una decisión depende de **varias** condiciones, las combinas con:

| Operador | Se lee | Regla |
|---|---|---|
| `&&` | **Y** (AND) | verdadero solo si **todas** son verdaderas |
| `\|\|` | **O** (OR) | verdadero si **al menos una** es verdadera |
| `!` | **NO** (NOT) | invierte el valor |

Piénsalo con tareas de casa: *“limpié la cocina Y lavé los platos”*. Solo cuenta como “todo listo” si hiciste **ambas** (AND). Si basta con que hayas hecho **una**, es OR.

### Tablas de verdad

| P | Q | `P && Q` | `P \|\| Q` |
|---|---|---|---|
| V | V | V | V |
| V | F | F | V |
| F | V | F | V |
| F | F | F | F |

Y para el NOT: `!true` es `false`, y `!false` es `true`.

```js
const edad = 20
const tieneDni = false

console.log(edad >= 18 && tieneDni)    // false: falta una
console.log(edad >= 18 || tieneDni)    // true: basta una
console.log(!tieneDni)                 // true
```

### Combinar todo: evalúa de adentro hacia afuera

Con `activo = false` y `edad = 17`, resuelve `!(activo || edad >= 18)` **paso a paso**:

```js
const activo = false
const edad = 17

console.log(!(activo || edad >= 18))
// !(false || 17 >= 18)
// !(false || false)
// !(false)
// true
```

> [!ojo] Dos trampas que aparecieron en tus ejercicios
> **1) Confundir AND con OR.** Si un enunciado dice “debe cumplir A *y* B”, es `&&`. Si dice “basta A *o* B”, es `||`.
> **2) Negar mal.** Al negar un OR, cada parte se invierte **y el OR pasa a AND**: `!(a || b)` equivale a `!a && !b`.

```quiz
¿Qué vale `!(true && false)`?
- `true` *
- `false`
> `true && false` es `false`, y negarlo da `true`.
```

## Resumen de la clase

- Un **dato** es un valor; una **variable** es un nombre que lo guarda. Se define, se asigna y se reasigna.
- `const` para lo que no cambia; `let` para lo que sí.
- Tres tipos: **string**, **boolean**, **number**.
- Solo el `0` y el texto vacío se comportan como falsos.
- Aritméticos hacen cuentas; relacionales **siempre dan boolean**; lógicos combinan booleanos.
- `=` asigna, `==` / `===` comparan.

Ahora pasa a la **práctica**: son 8 ejercicios de glosario donde vas a *predecir* antes de comprobar.
