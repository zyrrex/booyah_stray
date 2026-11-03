---
id: clase9
clase: 9
title: Arrow functions
subtitle: La misma función con una forma de escribirla más corta, directa y cómoda para callbacks.
date: 3 nov 2026
icon: sparkle
summary: Función guardada en una variable, sintaxis de flecha, return implícito, flechas como callbacks y métodos, y en qué se diferencian de function.
---

## Una función, otra manera de escribirla

Las **arrow functions** (funciones flecha) son **funciones de verdad**, con una diferencia en cómo se **escriben**. Se usan muchísimo por su facilidad y por lo limpio que deja el código.

Mira la misma tarea escrita de tres maneras:

```js
// 1) La que ya conoces: declaración con function
function saludar() {
  console.log("Hola")
}

// 2) Función guardada en una variable
const saludar2 = function () {
  console.log("Hola")
}

// 3) Arrow function
const saludar3 = () => {
  console.log("Hola")
}

saludar()
saludar2()
saludar3()
```

Las tres hacen exactamente lo mismo y se invocan igual. Vamos paso a paso.

## Primero: una función puede guardarse en una variable

En la clase 7 la función tenía su propio nombre (`function saludar() { }`). Pero una función también es **un valor**, como un número o un texto, así que se puede **guardar en una variable**:

```js
const despedir = function () {
  console.log("Chau")
}

despedir()
```

La función **no lleva nombre** después de `function` (es *anónima*): el nombre es el de la **variable**. Esto ya lo usaste en la clase anterior, dentro de los métodos de un objeto (`sayHola: function () { }`). La arrow function es el siguiente paso: **la misma idea, escrita más corta**.

## Definición de una arrow function

Se **reemplaza la palabra `function`** por unos paréntesis y la **flecha `=>`**:

```js
const sayHello = () => {
  console.log("Hola")
}
```

| Parte | Qué es |
|---|---|
| `const sayHello` | La variable que guarda la función (su nombre) |
| `( )` | Los **parámetros** (aquí ninguno) |
| `=>` | La **flecha**: reemplaza a la palabra `function` |
| `{ ... }` | El **cuerpo**, igual que siempre |

## Invocación

Exactamente igual que una función normal: **nombre y paréntesis**.

```js
const sayHello = () => {
  console.log("Hola")
}

sayHello()
sayHello()
```

> [!tip] ¿`const` o `let`?
> Se acostumbra **`const`**: una función normalmente no cambia de dueño, y así evitas reasignarla por accidente.

> [!regla] Dos cosas que no cambian
> **1.** Definir **no ejecuta**: sin la llamada `sayHello()` no pasa nada.
> **2.** El cuerpo, los `return`, los `if`, los bucles… funcionan **idéntico** a una función normal.

## Parámetros en una arrow function

Entre los paréntesis van los parámetros, igual que antes:

```js
const saludar = (nombre) => {
  console.log(`Hola, ${nombre}`)
}

const presentar = (nombre, edad) => {
  console.log(`${nombre} tiene ${edad} años`)
}

saludar("Ana")
presentar("Luis", 17)
```

Los **valores por defecto** también funcionan igual:

```js
const aplicarDescuento = (precio, porcentaje = 10) => {
  return precio - precio * porcentaje / 100
}

console.log(aplicarDescuento(200))
console.log(aplicarDescuento(200, 25))
```

Sobre los **paréntesis**:

| Parámetros | Se escribe | ¿Paréntesis? |
|---|---|---|
| Ninguno | `() => { }` | **Obligatorios** |
| Uno | `(n) => { }` o `n => { }` | Opcionales |
| Varios | `(a, b) => { }` | **Obligatorios** |

> [!tip] Consejo de orden
> Aunque con un solo parámetro se pueda omitir el paréntesis, en este cuaderno los escribimos **siempre**: `(n) => ...`. Un solo estilo, menos confusión.

## `return` en una arrow function

Con llaves, **igual que antes**: necesitas escribir `return` para devolver algo.

```js
const sumar = (a, b) => {
  return a + b
}

console.log(sumar(4, 5))
```

### Return implícito: sin llaves, sin `return`

Cuando el cuerpo es **una sola expresión**, puedes **quitar las llaves y la palabra `return`**: la flecha **devuelve automáticamente** el valor de esa expresión.

```js
const sumar = (a, b) => a + b
const doble = (n) => n * 2
const esPar = (n) => n % 2 === 0
const mayorDeEdad = (edad) => edad >= 18 ? "Mayor" : "Menor"

console.log(sumar(4, 5))
console.log(doble(21))
console.log(esPar(7))
console.log(mayorDeEdad(20))
```

Compara lado a lado (hacen lo mismo):

```js-static
function doble(n) {          // clásica
  return n * 2
}

const doble = (n) => {       // flecha con llaves
  return n * 2
}

const doble = (n) => n * 2   // flecha con return implícito
```

> [!error] El error clásico: llaves **sin** `return`
> Si usas **llaves**, tienes que escribir `return`. Si no lo escribes, la función devuelve `undefined`:
>
> ```js
> const dobleMal = (n) => { n * 2 }       // con llaves y sin return
> const dobleBien = (n) => n * 2          // sin llaves: devuelve solo
>
> console.log(dobleMal(5))    // undefined
> console.log(dobleBien(5))   // 10
> ```
> **Regla:** o llaves **con** `return`, o sin llaves **y sin** `return`. Nunca llaves sin `return` esperando que devuelva algo.

### Devolver un objeto: paréntesis alrededor

Hay un detalle que sorprende. Si quieres que el return implícito devuelva **un objeto**, las llaves del objeto se confundirían con las llaves del cuerpo. Se resuelve **envolviendo el objeto en paréntesis**:

```js
const crearPunto = (x, y) => ({ x: x, y: y })

console.log(crearPunto(3, 4))
```

```js-static
const crearPuntoMal = (x, y) => { x: x, y: y }     // ✖ las llaves se leen como el cuerpo
```

## Arrow functions como callbacks (con `forEach`)

Aquí es donde más se usan. En la clase pasada le dabas a `forEach` una función con `function`. Con una flecha queda mucho más corto:

```js
const nombres = ["Ana", "Luis", "Rosa"]

// clase anterior
nombres.forEach(function (nombre) {
  console.log(`Hola, ${nombre}`)
})

// con flecha y llaves
nombres.forEach((nombre) => {
  console.log(`Hola, ${nombre}`)
})

// con flecha y return implícito (una sola línea)
nombres.forEach((nombre) => console.log(`Hola, ${nombre}`))
```

Con el **índice** como segundo parámetro:

```js
const nombres = ["Ana", "Luis", "Rosa"]

nombres.forEach((nombre, indice) => console.log(`${indice + 1}. ${nombre}`))
```

También puedes **guardar la flecha** en una variable y pasarla **por nombre** (sin paréntesis):

```js
const mostrar = (nota) => console.log(`Nota: ${nota}`)

;[14, 9, 17].forEach(mostrar)
```

> [!ojo] El `;` delante del arreglo
> Cuando una línea empieza con `[`, JavaScript podría pegarla a la línea anterior. Para evitar el problema, ese ejemplo lleva un `;` al inicio. Si guardas el arreglo en una variable (`const notas = [...]` y luego `notas.forEach(mostrar)`), ya no hace falta.

## Funciones que reciben funciones (cómo funciona `forEach` por dentro)

Un parámetro puede ser **una función**: es lo que hace `forEach`. Para entenderlo bien, construye tu propio `forEach`:

```js
const paraCada = (arreglo, accion) => {
  for (let i = 0; i < arreglo.length; i++) {
    accion(arreglo[i], i)       // llama a la función que recibió
  }
}

paraCada(["Ana", "Luis"], (nombre, indice) => {
  console.log(`${indice}: ${nombre}`)
})
```

`paraCada` no sabe **qué** va a hacer con cada elemento: eso se lo dice quien la llama, pasándole la función `accion`. Esa función de “instrucciones” es el **callback**.

## Funciones guardadas en arreglos y objetos

Si una función es un valor, entonces cabe **en un arreglo**:

```js
const pasos = [
  (n) => n + 10,
  (n) => n * 2,
  (n) => n - 3
]

let valor = 5
for (const paso of pasos) {
  valor = paso(valor)
  console.log(valor)
}
```

Y también **dentro de un objeto**, como **método**:

```js
const miObj = {
  name: "Carlos",
  edad: 24,
  sayHola: () => {
    console.log("Hola")
  }
}

miObj.sayHola()
```

Se invoca igual que cualquier método (`objeto.metodo()`). Y puede tener parámetros y return implícito:

```js
const calculadora = {
  sumar: (a, b) => a + b,
  restar: (a, b) => a - b,
  multiplicar: (a, b) => a * b
}

console.log(calculadora.sumar(6, 3))
console.log(calculadora.multiplicar(6, 3))
```

Hasta puede decirse que se ve **más formal y ordenado**: cada método cabe en una línea.

> [!ojo] Una flecha como método **no sirve** si necesitas `this`
> Una arrow function **no tiene su propio `this`**: usa el del lugar donde se escribió, que **no es el objeto**. Por eso, si un método necesita leer o cambiar las propiedades de su objeto con `this`, **tiene que ser una función normal** (`function () { }`), no una flecha.
>
> ```js-static
> const persona = {
>   nombre: "Carlos",
>   saludarMal: () => console.log(this.nombre),              // ✖ this NO es persona
>   saludarBien: function () { console.log(this.nombre) }    // ✔ this es persona
> }
> ```
> **Regla práctica:** método que usa `this` → `function`. Método que solo usa sus parámetros (como `sumar` de la calculadora) → flecha sin problema.

## ¿En qué se diferencia de `function`?

Para esta etapa, lo importante es esto:

| | `function nombre() { }` | `const nombre = () => { }` |
|---|---|---|
| Se escribe | con la palabra `function` | con `=>` |
| Return implícito | No | **Sí** (sin llaves) |
| ¿Se puede llamar **antes** de definirla? | **Sí** | **No** |
| `this` propio (en métodos) | **Sí** | No |
| Uso típico | funciones “principales”, métodos con `this` | callbacks, funciones cortas |

### Llamar antes de definir

Con `function` puedes llamarla **más arriba** de donde la escribiste (lo viste en la clase 7). Con una flecha guardada en `const`, **no**: la variable todavía no existe en esa línea.

```js
console.log(sumarA(2, 3))                 // funciona
function sumarA(a, b) {
  return a + b
}
```

```js
console.log(sumarB(2, 3))                 // ✖ ReferenceError
const sumarB = (a, b) => a + b
```

> [!tip] Definir arriba, usar abajo
> Con flechas el orden manda: **primero la defines, después la usas**. Es una buena costumbre en general.

## Cómo leer una flecha

Para convertir una función normal en flecha:

1. Quita la palabra `function` y el nombre; guárdala en `const nombre =`.
2. Pon la flecha `=>` entre los paréntesis y las llaves.
3. Si el cuerpo es **una sola expresión**, quita las llaves y el `return`.

```js-static
function areaCirculo(radio) {            // paso 0: la original
  return 3.14 * radio * radio
}

const areaCirculo = (radio) => {         // pasos 1 y 2
  return 3.14 * radio * radio
}

const areaCirculo = (radio) => 3.14 * radio * radio    // paso 3
```

Y al revés, para **leer** una flecha en voz alta: `(a, b) => a * b` se dice **“recibe `a` y `b`, devuelve `a` por `b`”**.

```quiz
¿Qué devuelve `const f = (n) => { n + 1 }` al llamar `f(5)`?
- `6`
- `undefined` *
- Un error
> Con llaves hay que escribir `return`. Sin él, la función no devuelve nada (`undefined`).
```

```quiz
¿Cuál escribe correctamente una flecha con return implícito que suma 1?
- `(n) => { n + 1 }`
- `(n) => n + 1` *
- `n => return n + 1`
> Sin llaves el valor se devuelve solo; **no** se escribe `return`. Con llaves sí haría falta.
```

## ¿Cuándo uso cuál?

| Situación | Elección |
|---|---|
| Callback de `forEach` o una función corta de una línea | **Flecha** |
| Función “principal” con nombre propio que puede llamarse desde arriba | `function` (o flecha, a gusto) |
| Método de objeto que usa `this` | **`function`** |
| Método de objeto que solo usa sus parámetros | Flecha o `function` |
| Necesito llamarla antes de definirla | `function` |

Ninguna es “mejor”: son **dos formas de escribir lo mismo**. Lo importante es que entiendas las dos, porque en código real las verás mezcladas.

## Cuaderno de errores típicos

| Síntoma | Casi seguro es… |
|---|---|
| La flecha devuelve `undefined` | pusiste **llaves sin `return`** |
| `Cannot access 'x' before initialization` | llamaste la flecha **antes** de definirla |
| `x is not a function` | la variable no guarda una función (revisa el nombre, o si la llamaste con `()` por error al pasarla de callback) |
| `Unexpected token` al devolver un objeto | te faltaron los **paréntesis** alrededor del objeto |
| El método con flecha imprime `undefined` | usaste `this` en una flecha: cámbiala a `function` |
| `forEach(mostrar())` falla | con paréntesis ejecutas la función; pásala **sin** paréntesis |
| `n => return n * 2` da error | `return` no se escribe en el implícito (o pon llaves) |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | Leer y escribir flechas | FL1 a FL4 |
| 2 | Flechas como callbacks | FL5 a FL7 |
| 3 | Funciones como valores, y cuándo usar cuál | FL8 a FL11 |
| 4 | Flechas con datos reales | FL12 a FL14 |
| 5 | Integradores | FL15 y FL16 |

**Reglas del juego**

- **Todavía no** uses otros métodos de arreglos (`push`, `map`, `filter`, `reduce`…): solo `forEach` y los bucles que ya conoces.
- En los ejercicios que dicen **“con flecha”**, escribe `const nombre = (...) => ...`. El evaluador solo mira la **salida**: que hayas escrito flecha o `function` lo juzgas tú. Es práctica: hazla como se pide.
- Si una función devuelve algo, que **devuelva**; imprime **afuera**, al llamarla.
- Antes de programar: **ruta mínima** y **predicción** de la salida, a mano.

## Resumen de la clase

- Una **arrow function** es una función con otra sintaxis: `const nombre = (parámetros) => { cuerpo }`.
- Se **invoca igual** (`nombre()`); definir no ejecuta.
- **Sin parámetros o con varios** → paréntesis obligatorios.
- **Con llaves** → escribes `return`. **Sin llaves** (una sola expresión) → **return implícito**.
- Para devolver un objeto con return implícito → **paréntesis** alrededor: `() => ({ ... })`.
- Muy usadas como **callbacks**: `arreglo.forEach((valor, indice) => ...)`.
- Una función es un **valor**: cabe en variables, arreglos y objetos, y puede pasarse como argumento.
- Como método sirve si **no usa `this`**; si necesitas `this`, usa `function`.
- Una flecha en `const` **no** puede llamarse antes de definirse.

Y ahora la **práctica** de arrow functions.
