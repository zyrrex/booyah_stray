---
id: clase6
clase: 6
title: Objetos y arreglos
subtitle: Cómo guardar un registro completo (objeto) y una lista de cosas (arreglo), y cómo recorrerlos sin números pegados.
date: 26 oct 2026
icon: book
summary: Objetos como registros, propiedades y undefined, arreglos con índices desde 0, length, arreglos de objetos, objetos con arreglos y recorridos con for.
---

## El problema que resuelven

Hasta ahora cada dato vivía en una variable suelta: `nombre`, `edad`, `saldo`… Si tienes **100 clientes**, no puedes tener `nombre1`, `nombre2`, … `nombre100`. Necesitas dos herramientas nuevas:

- **Objeto**: agrupa los datos de **una cosa** (un cliente, un producto).
- **Arreglo** (`array`): agrupa **muchas cosas** en una lista (todos los clientes).

## Objetos: un registro con propiedades

Un **objeto** es un registro que agrupa información con pares **`propiedad: valor`**, separados por comas y entre llaves.

```js
const persona1 = {
  nombre: "Luis Angel",
  edad: 17,
  estudios: "Secundaria",
  pasatiempo: "Videojuegos"
}

console.log(persona1)
```

Para leer una propiedad usas **el punto**:

```js
console.log(persona1.edad)      // 17
console.log(persona1.nombre)    // "Luis Angel"
console.log(`${persona1.nombre} tiene ${persona1.edad} años`)
```

### Una propiedad que no existe: `undefined`

Pedir una propiedad que el objeto **no tiene** **no da error**: devuelve `undefined` (“no definido”).

```js
console.log(persona1.telefono)         // undefined
console.log(typeof persona1.telefono)  // "undefined"
```

> [!ojo] `undefined` no es lo mismo que `0` ni que `""`
> Una propiedad que **vale 0** (por ejemplo `stock: 0`) **sí existe**: es un dato válido. `undefined` significa “esto no existe”. Mezclarlos es un error clásico: un stock de 0 **no** es “sin dato”.

### Cada objeto es independiente

Dos objetos **no tienen que compartir las mismas propiedades**:

```js
const persona2 = { nombre: "Ana", edad: 30 }          // sin estudios ni pasatiempo
const producto = { nombre: "Laptop", precio: 2500, stock: 4 }
```

### Cambiar y agregar propiedades

```js
const cuenta = { titular: "Mario", saldo: 500, activa: true }

cuenta.saldo = cuenta.saldo + 250     // reasignar una propiedad
cuenta.telefono = "987654321"         // agregar una propiedad nueva
cuenta.activa = !cuenta.activa        // invertir un boolean

console.log(cuenta)
```

> [!tip] ¿Un objeto `const` se puede cambiar?
> Sí. `const` impide **reasignar la variable** (`cuenta = otraCosa` fallaría), pero **no impide modificar las propiedades por dentro**. Compruébalo en el cuadro de arriba: no da error.

## Arreglos: una lista ordenada

Un **arreglo** agrupa valores **en orden**, entre **corchetes** `[ ]`:

```js
const precios = [12.5, 8, 30, 4.5, 15]
const nombres = ["Ana", "Luis", "Rosa"]
const mezcla = [10, "hola", true]
```

Cada elemento tiene una **posición** (índice) que **empieza en 0**:

| Índice | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Valor | `12.5` | `8` | `30` | `4.5` | `15` |

```js
const precios = [12.5, 8, 30, 4.5, 15]

console.log(precios[0])            // 12.5  → el primero
console.log(precios[2])            // 30
console.log(precios.length)        // 5     → cuántos elementos hay
console.log(precios[precios.length - 1])  // 15 → el último, sin escribir su posición
console.log(precios[5])            // undefined → no existe la posición 5
```

> [!regla] Objetos con punto, arreglos con corchetes
> Para entrar a **una propiedad de un objeto** usas **`.`** (`persona.edad`). Para entrar a **un elemento de un arreglo** usas **`[ ]`** con su posición (`precios[2]`).

### `length` en arreglos y en textos

`length` cuenta **elementos** en un arreglo y **caracteres** en un texto. Es una propiedad que el arreglo trae de fábrica: un arreglo es, en el fondo, **un tipo de objeto**.

```js
console.log(typeof [1, 2, 3])   // "object"
console.log("Carlos".length)    // 6
console.log([4, 5, 6].length)   // 3
```

### Reasignar elementos

```js
const precios = [20, 55, 80]
precios[1] = 45        // cambia la posición 1
console.log(precios)   // [ 20, 45, 80 ]
```

Igual que con los objetos: aunque el arreglo sea `const`, **sus elementos sí se pueden reasignar**.

```quiz
Con `const notas = [14, 9, 17]`, ¿cuánto vale `notas[1]`?
- `14`
- `9` *
- `17`
> Las posiciones empiezan en 0: `notas[0]` es 14, `notas[1]` es 9, `notas[2]` es 17.
```

## Recorrer un arreglo con `for`

La combinación estrella: **`for` + `length`**.

```js
const notas = [14, 9, 17, 12, 20, 12]
let total = 0

for (let i = 0; i < notas.length; i++) {
  console.log(`Nota ${i + 1}: ${notas[i]}`)   // i + 1 para mostrar "humano"
  total += notas[i]
}

console.log(`Total: ${total}`)
console.log(`Promedio: ${total / notas.length}`)
```

Dos detalles que importan:

- Empieza en **`i = 0`** y avanza **mientras `i < notas.length`** (nunca `<=`: la posición `length` no existe).
- Si imprimes posiciones “humanas” (alumno 1, 2, 3…), **suma 1 al imprimir**: `i + 1`. El índice sigue siendo 0.

### Nunca pegues números en la condición

> [!error] El error que más se paga
> `for (let i = 0; i < 6; i++)` funciona **solo si el arreglo tiene exactamente 6 elementos**. Si mañana tiene 7, se pierde uno; si tiene 4, lees posiciones que no existen (`undefined`).
> **Siempre `i < arreglo.length`.** Los números pegados (“quemados”) en el código provocan fallas o bucles infinitos cuando los datos cambian. Usa **variables dinámicas**: que el programa se adapte a los datos.

### Buscar y cortar con `break`

Encontrar el primer elemento que cumple algo y **dejar de buscar**:

```js
const codigos = [4521, 3310, 7788, 1204, 9056, 3310]
const buscado = 3310
let posicion = -1

for (let i = 0; i < codigos.length; i++) {
  if (codigos[i] === buscado) {
    posicion = i
    break                  // ya lo encontré: no sigo buscando
  }
}

console.log(posicion === -1 ? "No encontrado" : `Encontrado en el índice ${posicion}`)
```

### Mayor y menor: ¿con qué empiezo a comparar?

Pista de oro: **empieza con el primer elemento del arreglo**, no con `0`. Si todos los números son negativos, un `0` inicial “ganaría” y te daría una respuesta falsa.

```js
const temperaturas = [-12, -5, -20, -8, -15]
let mayor = temperaturas[0]

for (let i = 1; i < temperaturas.length; i++) {
  if (temperaturas[i] > mayor) mayor = temperaturas[i]
}
console.log(mayor)   // -5
```

## Arreglos de objetos: la estructura estándar

Aquí se juntan las dos ideas. Una **lista de registros**: es la forma más usada de guardar datos reales.

```js
const productos = [
  { nombre: "Arroz", precio: 5, stock: 20 },
  { nombre: "Aceite", precio: 12, stock: 8 },
  { nombre: "Leche", precio: 6, stock: 0 }
]

console.log(productos.length)          // 3
console.log(productos[1])              // el objeto completo de "Aceite"
console.log(productos[1].nombre)       // "Aceite"
console.log(productos[2].stock)        // 0
```

Se lee de izquierda a derecha: `productos` → posición `[1]` → propiedad `.nombre`. Es un **acceso encadenado**.

Recorrerlo es igual que antes; cada `productos[i]` es **un objeto**:

```js
let valor = 0

for (let i = 0; i < productos.length; i++) {
  if (productos[i].stock === 0) {
    console.log(`${productos[i].nombre} - AGOTADO`)
    continue
  }
  console.log(`${productos[i].nombre} - S/ ${productos[i].precio} - stock ${productos[i].stock}`)
  valor += productos[i].precio * productos[i].stock
}

console.log(`Valor del inventario: S/ ${valor}`)
```

## Objetos que contienen arreglos (estructuras anidadas)

Un objeto puede tener, como propiedad, un arreglo, y ese arreglo puede contener otros objetos. Así llegan los datos reales desde una web:

```js
const persona = {
  nombre: "Carla",
  telefonos: [
    { tipo: "FIJO", numero: "014567890" },
    { tipo: "CELULAR", numero: "987654321" }
  ]
}

console.log(persona.telefonos.length)            // 2
console.log(persona.telefonos[1].numero)         // "987654321"
```

> [!tip] La idea que casi todos confunden
> **No** es que los arreglos “estén por encima” de los objetos ni al revés: **los objetos pueden contener arreglos y los arreglos pueden contener objetos**, a la profundidad que haga falta. Para entrar, sigue el camino un paso a la vez.

> [!profundiza] Así se ve en una web real
> Cuando abres la pestaña **Red (Network)** de tu navegador y miras la respuesta de una web, ves exactamente esto: objetos con propiedades, arreglos de teléfonos, objetos de correos… A ese formato de texto se le llama **JSON**, y se parece muchísimo a lo que acabas de escribir. Investiga qué es JSON: es tu tarea de curiosidad.

### Cuando el camino no existe

```js
const liga = {
  nombre: "Liga Barrial",
  equipos: [{ nombre: "Halcones" }, { nombre: "Tigres" }]
}

console.log(liga.equipos[1].capitan)   // undefined → la propiedad no existe: sin error
console.log(liga.equipos[5])           // undefined → esa posición no existe: sin error
console.log(liga.equipos[5].nombre)    // ✖ TypeError: no se puede leer "nombre" de undefined
```

> [!regla] Cuándo falla y cuándo no
> Pedir **una propiedad que no existe** o **una posición que no existe** da `undefined` (silencioso). Pero pedir **algo dentro de ese `undefined`** (`undefined.nombre`) **detiene el programa** con un `TypeError`. Por eso conviene pensar los casos **antes** de escribir código.

## Un `for` dentro de otro `for`

Para recorrer un arreglo que está **dentro de cada elemento** de otro arreglo, el `for` de adentro da **toda su vuelta por cada vuelta del de afuera**. Usa `i` para el de afuera y `j` para el de adentro.

```js
const filas = [1, 2, 3]
const columnas = [10, 20]

for (let i = 0; i < filas.length; i++) {
  for (let j = 0; j < columnas.length; j++) {
    console.log(`${filas[i]} - ${columnas[j]}`)
  }
}
```

Predice antes de probar: ¿cuántas líneas imprime? (3 × 2 = 6).

```quiz
Con `const liga = { equipos: [] }`, ¿qué pasa al ejecutar `liga.equipos.length`?
- Error
- Devuelve `0` *
- Devuelve `undefined`
> `equipos` existe y es un arreglo vacío; su `length` es 0.
```

## Cómo usar el cuaderno de práctica

El cuaderno de esta clase se trabaja **un día, un bloque** (unos 60 a 90 minutos). No pases al siguiente día sin cerrar el anterior.

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | Arreglos: crear, leer y recorrer | E1 a E4 |
| 2 | Arreglos con decisiones | E5 a E8 |
| 3 | Objetos: propiedades y cambios | E9 a E12 |
| 4 | Arreglos de objetos | E13 a E16 |
| 5 | Estructuras anidadas | E17 a E20 |
| 6 | Integradores | E21 a E24 |
| Extra | Descubrimiento | E25 |

**Reglas del juego**

- Recorre siempre con `length`: **ningún número pegado** en la condición del `for`.
- **Todavía no** uses métodos de arreglos ni de objetos (`push`, `pop`, `shift`…), ni otros bucles: **solo `for`**.
- Los datos van en `const`; los contadores y acumuladores, en `let`.
- Los índices empiezan en 0. Si imprimes posiciones “humanas” (alumno 1), ajusta al imprimir.
- Nombres de variables en un solo idioma y sin tildes.

**Antes de programar:** la ruta mínima y tu **predicción** de la salida, a mano. **Después de ejecutar:** la salida debe coincidir **carácter por carácter** (mayúsculas, tildes, espacios, `S/`). Si no coincide, **no cambies la salida esperada**: busca la primera línea que difiere y rastrea tu tabla de estado hasta ahí.

**Bitácora del día (3 líneas, al cerrar):** qué me costó hoy · un error por suposición que cometí, y la línea donde lo vi · un cambio a mi método para mañana.

> [!tip] Prueba también
> Cada variante de los ejercicios ejercita **otra rama** del mismo programa. Una solución que solo funciona con los datos de arriba no está terminada.

## Cómo estudiar esta clase

- **Piensa los casos antes de escribir código.** Una base defectuosa afecta todo lo que construyas encima.
- Crea un archivo de **notas** y otro de **práctica** (por ejemplo `bases.js`) para ejercicios más complejos.
- Dibuja la estructura en papel: cajas para objetos, listas para arreglos.

## Resumen de la clase

- **Objeto**: `{ propiedad: valor }` → se lee con **punto**. Una propiedad inexistente da `undefined`.
- **Arreglo**: `[a, b, c]` → se lee con **corchetes** y posición desde **0**; `length` cuenta elementos.
- Recorre **siempre con `i < arreglo.length`**, sin números pegados.
- Arreglo de objetos: `lista[i].propiedad`. Objeto con arreglo: `objeto.lista[i]`.
- `undefined` es silencioso; `undefined.algo` detiene el programa.
- `const` protege la variable, no el contenido por dentro.

Y ahora la **práctica**: el cuaderno de arreglos y objetos, **un día = un bloque**.
