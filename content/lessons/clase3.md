---
id: clase3
clase: 3
title: Textos, template literals, typeof y switch
subtitle: Cómo se comportan los textos al sumarlos, cómo armarlos bien, cómo validar tipos y cómo elegir entre muchos casos.
date: 15 oct 2026
icon: pencil
summary: Tipado dinámico vs estático, concatenación y conversiones, template literals, typeof, módulo y la sentencia switch.
---

## Un poco de contexto: tipado dinámico

En **JavaScript** una variable puede guardar un número hoy y un texto mañana, sin quejarse. Esto se llama **tipado dinámico**.

En **Java**, en cambio, tienes que declarar el tipo de cada variable y no puedes cambiarlo:

```js-static
// Java (solo para comparar, no se ejecuta aquí)
int edad = 12;        // entero
float precio = 4.5f;  // decimal
edad = "hola";        // ✖ error de compilación
```

```js
// JavaScript: esto es válido
let dato = 12
dato = "ahora soy texto"
dato = true
console.log(dato)
```

> [!tip] ¿Qué significa para ti?
> La flexibilidad de JavaScript es cómoda… y peligrosa: nadie te avisa si un dato llega con el tipo equivocado. Por eso hoy aprendes a **comprobar tipos** con `typeof`.

## Concatenación: cuando `+` junta textos

El operador `+` hace **dos cosas distintas** según los datos:

- Con **dos números**: **suma**.
- Si **alguno es un texto**: **une** (concatena) como texto.

```js
console.log(5 + 3)        // 8
console.log("5" + 3)      // "53"  → unió texto con número
console.log("Hola " + "Max")
```

Un `true` se comporta como `1` y un `false` como `0` **cuando se hacen cuentas**; pero si hay un texto de por medio, se escribe literalmente:

```js
let a = 5
let b = "3"
let c = true

console.log(a + b)    // "53"
console.log(a - b)    // 2     → el menos solo sabe restar: convierte "3" a número
console.log(a + c)    // 6     → true vale 1
console.log(b + c)    // "3true"
console.log(a + 2 + b) // "73"  → de izquierda a derecha: 5+2=7, luego "7"+"3"
console.log(b + a + 2) // "352" → ya es texto desde el principio
```

> [!ojo] La regla de oro
> El `+` se evalúa **de izquierda a derecha**. En cuanto aparece un texto, **todo lo que sigue se concatena**. El `-`, `*` y `/` nunca concatenan: intentan convertir a número.

### `NaN`: cuando la cuenta no tiene sentido

```js
console.log("hola" * 5)   // NaN
console.log(typeof NaN)   // "number" (sí, aunque se llame "Not a Number")
```

`NaN` es el resultado de una operación numérica imposible. Si lo ves, algún dato no era lo que creías.

```quiz
¿Qué imprime `console.log("Total: " + 5 + 3)`?
- `Total: 8`
- `Total: 53` *
- `Total: 5 3`
> Desde que aparece el texto `"Total: "`, todo lo demás se concatena: `"Total: 5"` y luego `"Total: 53"`.
```

## Template literals: la forma buena de armar textos

Concatenar con `+` obliga a cuidar espacios y comillas, y es fácil equivocarse. Los **template literals** lo resuelven:

- Se escriben con **comillas invertidas** `` ` ``.
- Las variables y operaciones van dentro de **`${ ... }`**.

```js
const nombre = "Carlos"
const dni = "73940815"
const a = 2
const b = 2

console.log(`Bienvenido ${nombre}`)
console.log(`Usuario registrado con: ${dni}`)
console.log(`${a} + ${b} = ${a + b}`)
```

Dentro de `${}` puedes poner **cualquier expresión**: cálculos, comparaciones, incluso un ternario (clase 4). Y no necesitas espacios manuales ni `+`.

```js
const precio = 22.5
const cantidad = 4
console.log(`Subtotal: S/ ${precio * cantidad}`)
```

> [!profundiza] ¿Debo aprender la concatenación antigua con `+`?
> Aprenderla sirve **para leer código antiguo** que encuentres. Para escribir el tuyo, usa siempre template literals: evitan errores de sintaxis.

> [!ojo] Decimales en JavaScript
> `0.1 + 0.2` no da exactamente `0.3` (da `0.30000000000000004`). Pasa en todos los lenguajes. Si un ejercicio pide un total como `subtotal + igv`, **suma los valores que ya tienes** en vez de usar fórmulas encadenadas como `subtotal * 1.18`, que pueden arrastrar decimales de más.

## `typeof`: ¿qué tipo de dato es este?

`typeof` te responde **con un texto** el tipo de un valor.

```js
console.log(typeof 12)            // "number"
console.log(typeof "12")          // "string"
console.log(typeof true)          // "boolean"
console.log(typeof (3 > 2))       // "boolean"
console.log(typeof (12 + ""))     // "string"
console.log(typeof typeof 5)      // "string"  → typeof devuelve un texto
```

Su uso real: **validar datos de entrada** antes de usarlos, para proteger tu programa.

```js
const tipoTramite = 3          // llegó un número cuando se esperaba un texto

if (typeof tipoTramite !== "string") {
  console.log(`ERROR: tipoTramite debe ser string y llegó ${typeof tipoTramite}`)
} else {
  console.log("TRAMITE ACEPTADO")
}
```

> [!error] Error típico
> Validar un monto solo con `monto > 0`. El texto `"250"` también pasa esa condición, porque JavaScript lo convierte. **Primero va `typeof`**, después las demás reglas, en el orden que pide el enunciado y **parando en el primer error**.

```quiz
¿Qué devuelve `typeof ("5" - 2)`?
- `"string"`
- `"number"` *
> El `-` convierte `"5"` a número: `"5" - 2` da `3`, y `3` es un number.
```

## El módulo `%`: el residuo de una división

`a % b` te da **lo que sobra** al dividir `a` entre `b`, sin decimales.

```js
console.log(10 % 3)   // 1  → 10 = 3*3 + 1
console.log(12 % 4)   // 0  → división exacta
console.log(7 % 2)    // 1
```

Dos usos que repetirás mil veces:

- **¿Es par?** → `n % 2 === 0`. Si sobra 1, es impar.
- **¿Es múltiplo de k?** → `n % k === 0`. Ejemplo: múltiplo de 3 → `n % 3 === 0`.

```js
const n = 15
console.log(n % 2 === 0)   // false → impar
console.log(n % 3 === 0)   // true  → múltiplo de 3
console.log(n % 5 === 0)   // true  → múltiplo de 5
```

> [!tip] Precedencia, otra vez
> `*`, `/` y `%` van antes que `+` y `-`. Ante la duda, **paréntesis**.

## `switch`: elegir entre muchos valores exactos

Cuando comparas **una misma variable** contra **muchos valores exactos**, una cadena enorme de `else if` se vuelve pesada. `switch` lo ordena:

```js
const mes = "Febrero"
let mensaje

switch (mes) {
  case "Enero":
    mensaje = "Cumple Papa Walter"
    break
  case "Febrero":
    mensaje = "Nadie cumple"
    break
  case "Marzo":
    mensaje = "Cumple Carlos"
    break
  default:
    mensaje = "Escribe bien tu mes"
}

console.log(mensaje)
```

Las piezas:

- `switch (variable)` evalúa **una variable**, no una condición.
- Cada `case valor:` es un caso. La comparación es **estricta** (como `===`): `"febrero"` en minúscula **no** coincide con `"Febrero"`.
- **`break`** corta el switch al terminar el caso. Sin él, la ejecución **cae** al siguiente caso.
- **`default`** se ejecuta si ningún caso coincide. Si no lo pones y nada coincide, no pasa nada.

### Casos que comparten el mismo resultado

Aquí sirve la caída sin `break`: varios `case` seguidos comparten las mismas acciones.

```js
const edad = 14

switch (edad) {
  case 10:
  case 11:
  case 12:
  case 13:
  case 14:
  case 15:
  case 16:
    console.log("Menor de edad")
    break
  case 18:
  case 19:
    console.log("Mayor de edad")
    break
  default:
    console.log("Ni idea, muy mayor")
}
```

> [!ojo] Un `break` olvidado = bug silencioso
> Si omites `break` donde no querías caer, se ejecutan también los casos siguientes. A veces es justo lo que quieres (arriba); si no, es un error difícil de ver. Cuando lo hagas a propósito, **déjalo escrito en un comentario**.

### ¿`switch` o `if`?

| Usa `switch` | Usa `if` |
|---|---|
| Una variable contra **valores exactos** | **Rangos** (`edad >= 18`, `monto < 1000`) |
| Una acción simple por caso | Condiciones **compuestas** (`&&`, `\|\|`) |
| Muchos casos (nombres de meses, estados) | Varias variables distintas |

```quiz
Quieres calcular una comisión según el monto: "menos de 1000", "de 1000 a 4999", "5000 o más". ¿Qué usas?
- `switch`
- `if / else if` *
> Son rangos, no valores exactos. `switch` compara igualdad exacta.
```

## Resumen de la clase

- JavaScript es de tipado **dinámico**; por eso se valida con `typeof`.
- `+` suma o concatena según los datos; evalúa de **izquierda a derecha**.
- Arma textos con **template literals** `` `Hola ${nombre}` ``.
- `typeof x` devuelve un **texto** con el tipo.
- `%` da el residuo: sirve para pares y múltiplos.
- `switch` + `case` + `break` + `default` para valores exactos.

La **práctica** de esta clase: template literals, typeof y switch.
