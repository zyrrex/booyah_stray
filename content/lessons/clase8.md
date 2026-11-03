---
id: clase8
clase: 8
title: Iteradores y métodos en objetos
subtitle: Recorrer arreglos y objetos sin pelearte con los índices, y darles a tus objetos acciones propias.
date: 2 nov 2026
icon: list
summary: for of y forEach para arreglos, for in para objetos, notación de corchetes, y métodos (funciones que pertenecen a un objeto) con this.
---

## Dónde estamos

Ya sabes recorrer un arreglo con el `for` clásico:

```js
const notas = [14, 9, 17, 12]

for (let i = 0; i < notas.length; i++) {
  console.log(notas[i])
}
```

Funciona, pero tiene **mucho ruido** para lo que haces: declarar `i`, escribir la condición con `length`, sumar `i++`, y escribir `notas[i]` cada vez que quieres el valor. Y los errores clásicos de esa clase viven justo ahí (`<=` en lugar de `<`, un número pegado en la condición…).

Los **iteradores** son formas de recorrer **sin manejar el índice a mano**. Esta clase tiene dos partes:

1. **Iteradores**: `for of` y `forEach` (para arreglos) y `for in` (para objetos).
2. **Métodos en objetos**: darle **acciones propias** a un objeto.

| Quiero recorrer… | Herramienta |
|---|---|
| un **arreglo** | `for...of` · `forEach` |
| un **objeto** | `for...in` |

## `for...of`: los **valores** de un arreglo

```js
const notas = [14, 9, 17, 12]

for (const nota of notas) {
  console.log(nota)
}
```

Se lee casi en español: **“para cada `nota` de `notas`”**. En cada vuelta, `nota` vale **el siguiente elemento**, empezando por el primero y terminando solo, cuando se acaban. No hay `i`, no hay `length`, no hay `notas[i]`.

> [!tip] ¿Por qué `const` si cambia en cada vuelta?
> Porque en **cada vuelta se crea una variable nueva** con ese valor: no se reasigna la misma. Por eso `const` funciona y es lo recomendado. (Si dentro del bucle vas a reasignar la variable de la vuelta, usa `let`.)
>
> El nombre `nota` lo eliges tú. Una buena costumbre: **singular del nombre del arreglo** (`notas` → `nota`, `productos` → `producto`).

Todo lo que ya sabes de los bucles sigue valiendo: `break` y `continue` funcionan igual.

```js
const precios = [12, 8, 0, 30, 4]
let total = 0

for (const precio of precios) {
  if (precio === 0) {
    continue          // salta solo esta vuelta
  }
  if (total > 40) {
    break             // corta todo el bucle
  }
  total += precio
}

console.log(total)
```

### Con arreglos de objetos

Cada vuelta te entrega **un objeto completo**, y lees sus propiedades con el punto. Compara cómo queda más limpio:

```js
const productos = [
  { nombre: "Arroz", precio: 5, stock: 20 },
  { nombre: "Aceite", precio: 12, stock: 8 },
  { nombre: "Leche", precio: 6, stock: 0 }
]

// antes: productos[i].nombre, productos[i].precio, ...
for (const producto of productos) {
  if (producto.stock === 0) {
    console.log(`${producto.nombre} - AGOTADO`)
    continue
  }
  console.log(`${producto.nombre} - S/ ${producto.precio}`)
}
```

### ¿Y si necesito el índice?

`for of` **no te da la posición**. Hay dos salidas:

- Llevar un **contador a mano** (`let numero = 1` y `numero++` dentro del bucle).
- Usar el `for` clásico cuando el índice es lo importante (recorrer **desde atrás**, saltar de **dos en dos**, comparar con el elemento **anterior**…).

```js
const nombres = ["Ana", "Luis", "Rosa"]
let numero = 1

for (const nombre of nombres) {
  console.log(`${numero}. ${nombre}`)
  numero++
}
```

> [!ojo] Cambiar la variable de la vuelta no cambia el arreglo
> Para números y textos, `nota` es **una copia**. Reasignarla no toca el arreglo. (Con **objetos** sí cambia el original si modificas sus propiedades: es lo mismo que viste en la clase de funciones.)
>
> ```js
> const numeros = [1, 2, 3]
> for (let numero of numeros) {
>   numero = numero * 10
> }
> console.log(numeros)   // [ 1, 2, 3 ]: el arreglo no cambió
> ```

### `for of` también recorre textos

Un texto se puede recorrer **letra por letra**:

```js
let vocalesA = 0

for (const letra of "banana") {
  if (letra === "a") {
    vocalesA++
  }
}

console.log(vocalesA)   // 3
```

```quiz
¿Qué imprime `for (const x of [4, 5, 6]) { console.log(x) }`?
- `0`, `1`, `2`
- `4`, `5`, `6` *
- `[4, 5, 6]` una sola vez
> `for of` entrega los **valores**, no las posiciones.
```

## `forEach`: “ejecuta esta función por cada elemento”

`forEach` es un **método de los arreglos**. Le entregas **una función** y él la ejecuta **una vez por cada elemento**, pasándole el elemento como argumento.

```js
const notas = [14, 9, 17]

notas.forEach(function (nota) {
  console.log(`Nota: ${nota}`)
})
```

Esa función que le das a otra para que **la llame por ti** se llama **callback** (“función de retorno de llamada”). Aquí no eres tú quien la invoca: lo hace `forEach`, tantas veces como elementos haya.

También puedes tener la función definida aparte y **pasarla por nombre**:

```js
function mostrarNota(nota) {
  console.log(`Nota: ${nota}`)
}

const notas = [14, 9, 17]
notas.forEach(mostrarNota)    // SIN paréntesis
```

> [!error] `mostrarNota` y `mostrarNota()` no son lo mismo
> Con paréntesis **ejecutas** la función ahora. Sin paréntesis **le pasas la función** a `forEach` para que la ejecute él. Si escribes `notas.forEach(mostrarNota())` ejecutas la función en ese momento y le pasas lo que devolvió (`undefined`): falla.

### El segundo parámetro: la posición

`forEach` llama a tu función con **dos datos**: el elemento y su **índice**. El índice es opcional: solo lo recibes si declaras un segundo parámetro.

```js
const nombres = ["Ana", "Luis", "Rosa"]

nombres.forEach(function (nombre, indice) {
  console.log(`${indice + 1}. ${nombre}`)
})
```

Fíjate: aquí **sí tienes el índice** sin escribir un `for` clásico.

### Acumular con `forEach`

La función puede **leer y cambiar variables de afuera**, así que un acumulador funciona igual que siempre:

```js
const precios = [12, 8, 30]
let total = 0

precios.forEach(function (precio) {
  total += precio
})

console.log(total)   // 50
```

### Lo que `forEach` **no** hace

- **No puedes cortarlo con `break`** ni saltar con `continue`: no son bucles, son llamadas a una función.
- Un `return` dentro de la función solo **termina esa llamada** (equivale a un `continue`), no detiene el recorrido.
- Solo existe en **arreglos**. Con un objeto da error.

```js
const numeros = [1, 2, 3, 4]

numeros.forEach(function (numero) {
  if (numero === 2) {
    return                 // solo se salta ESTA llamada; sigue con 3 y 4
  }
  console.log(numero)
})
```

```js
const persona = { nombre: "Ana", edad: 30 }
persona.forEach(function (dato) {    // ✖ TypeError: persona.forEach is not a function
  console.log(dato)
})
```

### `for of` frente a `forEach`

| | `for of` | `forEach` |
|---|---|---|
| ¿Qué le entregas? | el cuerpo del bucle | una **función** |
| `break` / `continue` | **Sí** | No |
| ¿Tengo el índice? | No (contador a mano) | **Sí** (segundo parámetro) |
| ¿Sirve en textos? | **Sí** | No (solo arreglos) |

> [!profundiza] ¿Y esto se puede escribir más corto?
> Sí. En la próxima clase verás una forma más corta de escribir la función que le das a `forEach` (**arrow functions**). Es solo otra manera de escribir lo mismo: por ahora, con `function` ya sabes todo lo necesario.

## `for...in`: las **claves** de un objeto

Los objetos no tienen posiciones: tienen **claves** (los nombres de sus propiedades). Para recorrerlos existe `for...in`:

```js
const persona = { nombre: "Luis Angel", edad: 17, estudios: "Secundaria" }

for (const clave in persona) {
  console.log(clave)
}
```

Imprime `nombre`, `edad` y `estudios`: **los nombres**, no los valores. Se lee: **“para cada `clave` en `persona`”**.

### ¿Y cómo saco el valor? Con corchetes

Aquí aparece una herramienta nueva, indispensable para `for in`: la **notación de corchetes**.

```js
const persona = { nombre: "Luis Angel", edad: 17 }

console.log(persona.edad)        // 17   → con punto
console.log(persona["edad"])     // 17   → con corchetes y el nombre entre comillas
```

Las dos formas leen lo mismo. La diferencia aparece cuando **el nombre está guardado en una variable**:

```js
const persona = { nombre: "Luis Angel", edad: 17 }
const clave = "edad"

console.log(persona.clave)     // undefined → busca una propiedad llamada literalmente "clave"
console.log(persona[clave])    // 17        → usa el VALOR de la variable clave
```

> [!regla] Punto = nombre literal · corchetes = lo que vale lo de adentro
> - `objeto.clave` → busca una propiedad que **se llame** `clave`.
> - `objeto[clave]` → **primero** mira qué vale la variable `clave` (por ejemplo `"edad"`) y **luego** busca esa propiedad.
>
> Dentro de un `for in` la clave **cambia en cada vuelta**, así que **siempre** usarás corchetes: `objeto[clave]`.

Ahora sí, **clave y valor**:

```js
const persona = { nombre: "Luis Angel", edad: 17, estudios: "Secundaria" }

for (const clave in persona) {
  console.log(`${clave}: ${persona[clave]}`)
}
```

### Contar propiedades, sumar valores

```js
const gastos = { comida: 120, transporte: 45, ocio: 80 }
let total = 0
let cantidad = 0

for (const rubro in gastos) {
  total += gastos[rubro]
  cantidad++
}

console.log(`${cantidad} rubros, total ${total}`)
```

Si el objeto mezcla tipos de datos, puedes **preguntar antes de usar** el valor:

```js
const ficha = { nombre: "Ana", edad: 30, activa: true, puntos: 12 }
let suma = 0

for (const clave in ficha) {
  if (typeof ficha[clave] === "number") {
    suma += ficha[clave]
  }
}

console.log(suma)   // 42
```

### Corchetes también sirven para **escribir**

```js
const ficha = { nombre: "Ana" }
const campo = "telefono"

ficha[campo] = "987654321"      // crea la propiedad "telefono"
ficha["activa"] = true

console.log(ficha)
```

Es lo que usarás para **construir** objetos cuyo nombre de propiedad depende de los datos. Por ejemplo, un **conteo de votos** donde cada nombre se convierte en una clave:

```js
const votos = ["ana", "luis", "ana", "rosa", "ana", "luis"]
const conteo = {}

for (const voto of votos) {
  if (conteo[voto] === undefined) {
    conteo[voto] = 1          // primera vez que aparece
  } else {
    conteo[voto]++            // ya existía: sumar 1
  }
}

for (const nombre in conteo) {
  console.log(`${nombre}: ${conteo[nombre]}`)
}
```

Aquí se juntan **dos iteradores**: `for of` para recorrer el arreglo y `for in` para recorrer el objeto resultado. Recuerda que una propiedad inexistente da `undefined`: por eso `conteo[voto] === undefined` detecta “todavía no existe”.

### Objetos cuyos valores son objetos

```js
const stock = {
  arroz: { precio: 5, cantidad: 20 },
  aceite: { precio: 12, cantidad: 8 }
}

for (const producto in stock) {
  const datos = stock[producto]
  console.log(`${producto}: S/ ${datos.precio * datos.cantidad}`)
}
```

`stock[producto]` entrega el objeto completo de esa clave, y de ahí sigues con el punto.

> [!ojo] No uses `for in` con arreglos
> Funciona, pero entrega los **índices como texto** (`"0"`, `"1"`…), no los valores, y es fácil equivocarse con las cuentas. Para arreglos usa **`for of`** o `forEach`.
>
> ```js
> const frutas = ["pera", "uva"]
> for (const x in frutas) {
>   console.log(x, typeof x)    // 0 string · 1 string
> }
> ```

```quiz
Dentro de `for (const clave in persona)`, ¿cómo lees el valor de la propiedad actual?
- `persona.clave`
- `persona[clave]` *
- `clave.persona`
> Con corchetes se usa **el valor de la variable** (`"edad"`, `"nombre"`…). Con punto buscarías una propiedad llamada literalmente `clave`.
```

## ¿Cuál uso?

| Si quiero… | Uso |
|---|---|
| recorrer un **arreglo** y usar cada valor | `for of` |
| además poder **cortar** o **saltar** (`break`, `continue`) | `for of` |
| recorrer un **texto** letra por letra | `for of` |
| ejecutar **una función** por cada elemento (con índice) | `forEach` |
| recorrer las **propiedades de un objeto** | `for in` |
| recorrer **desde atrás**, saltando de dos en dos, o comparar con el anterior | `for` clásico |

> [!tip] Ninguno reemplaza al `for` clásico
> Son comodidades para los casos habituales. Cuando necesitas **controlar el índice**, el `for` de siempre sigue siendo la herramienta.

## Métodos en objetos

Hasta aquí un objeto solo **guarda datos**. Pero un objeto también puede **hacer cosas**: tener acciones propias.

> [!regla] Un método es una función que pertenece a un objeto
> Es literalmente una función, con una diferencia clave: **vive dentro de un objeto**, así que para usarla tienes que **invocar al objeto**. Cuando una función se invoca mediante un objeto, su nombre pasa a ser **método**.

### Definición

La función se escribe como **valor de una propiedad**:

```js
const miObj = {
  nombre: "Carlos",
  edad: 24,
  sayHola: function () {
    console.log("Hola")
  }
}
```

(Fíjate que la función **no lleva nombre** después de `function`: ya lo tiene, es el de la propiedad: `sayHola`.)

### Invocación

Se llama con **objeto, punto, nombre y paréntesis**:

```js
const miObj = {
  nombre: "Carlos",
  edad: 24,
  sayHola: function () {
    console.log("Hola")
  }
}

miObj.sayHola()
miObj.sayHola()
```

Si te fijas, es lo mismo que una función, solo que se llama **a través del objeto**. Y como en una función normal, puedes usar **parámetros**, **valores por defecto** y **`return`**:

```js
const calculadora = {
  sumar: function (a, b) {
    return a + b
  },
  saludar: function (nombre = "invitado") {
    return `Hola, ${nombre}`
  }
}

console.log(calculadora.sumar(4, 5))
console.log(calculadora.saludar("Ana"))
console.log(calculadora.saludar())
```

### Leer el método no es llamarlo

Igual que con las funciones, **los paréntesis son lo que ejecuta**:

```js
const persona = {
  saludar: function () {
    return "Hola"
  }
}

console.log(persona.saludar)     // [Function: saludar] → es la función, no se ejecutó
console.log(persona.saludar())   // "Hola"               → aquí sí
```

### Una propiedad que no existe *no* es lo mismo que un método que no existe

```js
const persona = { nombre: "Ana" }

console.log(persona.telefono)   // undefined → propiedad inexistente: sin error
persona.volar()                 // ✖ TypeError: persona.volar is not a function
```

Pedir una propiedad que no existe da `undefined` (silencioso). Pero **llamar** a algo que no existe como si fuera función **detiene el programa**: `undefined` no se puede ejecutar.

```quiz
Con `const p = { nombre: "Ana" }`, ¿qué pasa con `p.saludar()`?
- Imprime `undefined`
- Da un `TypeError`: `p.saludar` no es una función *
- No hace nada
> `p.saludar` vale `undefined`, y `undefined()` no se puede ejecutar: error.
```

## `this`: el objeto dueño del método

Un método casi siempre necesita **los datos de su propio objeto**. Para eso existe **`this`**: dentro de un método, `this` significa **“el objeto con el que me llamaron”**, o sea, **lo que está a la izquierda del punto** en `persona.presentarse()`.

```js
const persona = {
  nombre: "Carlos",
  edad: 24,
  presentarse: function () {
    console.log(`Hola, soy ${this.nombre} y tengo ${this.edad} años`)
  },
  cumplirAnios: function () {
    this.edad = this.edad + 1       // modifica el objeto desde adentro
  }
}

persona.presentarse()
persona.cumplirAnios()
persona.presentarse()
```

> [!profundiza] ¿Por qué `this` y no el nombre de la variable?
> Podrías escribir `persona.nombre` dentro del método y también funcionaría. Pero si mañana cambias el nombre de la variable, o el mismo método se usa en **otro objeto**, se rompe. `this` siempre apunta al **dueño de turno**:
>
> ```js
> function presentarse() {
>   console.log(`Soy ${this.nombre}`)
> }
>
> const ana = { nombre: "Ana", presentarse: presentarse }
> const luis = { nombre: "Luis", presentarse: presentarse }
>
> ana.presentarse()    // Soy Ana
> luis.presentarse()   // Soy Luis
> ```
> La misma función, dos dueños, dos resultados.

> [!ojo] Sin `this.` no encuentra los datos del objeto
> Dentro del método, `nombre` a secas **no** es la propiedad del objeto (sería una variable suelta que no existe). Para leer o cambiar una propiedad propia: **`this.nombre`**.

### Métodos que cambian el estado del objeto

Un objeto con **datos + acciones** modela cosas reales: una cuenta bancaria con su saldo y sus operaciones.

```js
const cuenta = {
  titular: "Mario",
  saldo: 500,
  depositar: function (monto) {
    this.saldo += monto
  },
  retirar: function (monto) {
    if (monto > this.saldo) {
      console.log("Saldo insuficiente")
      return
    }
    this.saldo -= monto
  },
  mostrar: function () {
    console.log(`${this.titular}: S/ ${this.saldo}`)
  }
}

cuenta.mostrar()
cuenta.depositar(250)
cuenta.retirar(100)
cuenta.retirar(5000)
cuenta.mostrar()
```

### Un método puede llamar a otro: `this.otroMetodo()`

```js
const rectangulo = {
  base: 8,
  altura: 5,
  area: function () {
    return this.base * this.altura
  },
  describir: function () {
    return `Área: ${this.area()}`
  }
}

console.log(rectangulo.describir())
```

### Agregar un método después

Igual que cualquier propiedad:

```js
const perro = { nombre: "Toby" }

perro.ladrar = function () {
  console.log(`${this.nombre} dice: guau`)
}

perro.ladrar()
```

### Arreglos de objetos con métodos

Todo se combina: recorres con `for of` y **llamas al método de cada objeto**.

```js
const jugadores = [
  { nombre: "Ana", goles: 3, resumen: function () { return `${this.nombre}: ${this.goles} goles` } },
  { nombre: "Luis", goles: 1, resumen: function () { return `${this.nombre}: ${this.goles} goles` } }
]

for (const jugador of jugadores) {
  console.log(jugador.resumen())
}
```

> [!profundiza] Una forma corta de escribir métodos
> En el código de otras personas verás esto, que significa **exactamente lo mismo**:
>
> ```js-static
> const persona = {
>   nombre: "Carlos",
>   saludar() {                 // en vez de  saludar: function () {
>     console.log("Hola")
>   }
> }
> ```
> Tú puedes seguir con `saludar: function () { }`; solo conviene que lo reconozcas al leerlo.

## Cuaderno de errores típicos

| Síntoma | Casi seguro es… |
|---|---|
| `undefined` en vez del valor, dentro de `for in` | escribiste `objeto.clave` en vez de `objeto[clave]` |
| `x.forEach is not a function` | `x` no es un arreglo (un objeto no tiene `forEach`) |
| `forEach` “no se detiene” con `break` | `forEach` **no** admite `break`: usa `for of` |
| El `for in` de un arreglo da textos raros | para arreglos usa `for of` |
| Falta el número de vuelta | `for of` no da índice: contador a mano o `forEach (valor, indice)` |
| `objeto.metodo is not a function` | te equivocaste de nombre, o lo escribiste sin ser método |
| El método imprime `undefined` | usaste `nombre` en vez de `this.nombre` |
| El método “no hace nada” | lo nombraste pero **no lo llamaste** (faltan los `()`) |
| `Cannot read properties of undefined` | `this` no es el objeto que creías (el método se llamó mal) |

## Cómo usar el cuaderno de práctica

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | `for of` con arreglos, objetos y textos | I1 a I4 |
| 2 | `forEach` | I5 y I6 |
| 3 | `for in` y corchetes | I7 a I10 |
| 4 | Elegir el iterador correcto | I11 |
| 5 | Métodos y `this` | I12 a I15 |
| 6 | Integradores | I16 y I17 |

**Reglas del juego**

- **Todavía no** uses otros métodos de arreglos u objetos (`push`, `map`, `filter`, `Object.keys`…). Solo los iteradores de esta clase.
- Usa **`function`** para los callbacks y los métodos (la forma corta llega en la siguiente clase).
- Dentro de un método, **siempre `this.`** para tocar los datos del propio objeto.
- Antes de programar: **ruta mínima** y **predicción** de la salida, a mano.

> [!tip] Cada iterador, con su cara
> Si tu ejercicio dice “para cada elemento del arreglo”, piensa en **`for of`**. Si dice “por cada propiedad del objeto”, piensa en **`for in`**. Si dice “ejecuta esta acción por cada elemento”, piensa en **`forEach`**.

## Resumen de la clase

- **`for (const x of arreglo)`**: recorre **valores**; admite `break`/`continue`; sirve también para textos.
- **`arreglo.forEach(function (valor, indice) { })`**: ejecuta tu función por cada elemento; da el índice; no admite `break`.
- **`for (const clave in objeto)`**: recorre las **claves**; el valor se lee con **`objeto[clave]`**.
- **Punto** = nombre literal · **corchetes** = lo que vale la variable. También sirven para **escribir** propiedades.
- Un **método** es una función dentro de un objeto: `objeto.metodo()`. Admite parámetros y `return`.
- Dentro del método, **`this`** es el objeto dueño: `this.propiedad`.
- Una propiedad inexistente da `undefined`; **llamar** a un método inexistente da `TypeError`.

Y ahora la **práctica**: iteradores y métodos, bloque por bloque.
