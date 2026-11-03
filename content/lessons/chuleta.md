---
id: chuleta
clase: 0
title: Chuleta
subtitle: Todo lo visto en un solo lugar para consultar rápido. Si algo no se entiende, vuelve a su clase.
date: siempre
icon: list
summary: Sintaxis, operadores, tablas de verdad y errores típicos de las clases 1 a 9.
---

## Variables y tipos

| Quiero | Escribo | Clase |
|---|---|---|
| Crear y dar valor | `let edad = 17` | 1 |
| Cambiar el valor | `edad = 18` | 1 |
| Valor que nunca cambia | `const PI = 3.1416` | 1 |
| Saber el tipo | `typeof edad` → `"number"` | 3 |

| Tipo | Ejemplos |
|---|---|
| `string` | `"Carlos"`, `'c'`, `"9"` |
| `boolean` | `true`, `false` |
| `number` | `12`, `12.4`, `-12` |

**Falsos** en un `if`: `false`, `0`, `""`. **Verdaderos**: casi todo lo demás (incluso `-3` y `"0"`).

Nombres: en español, sin tildes, sin espacios, que digan qué guardan.

## Operadores

| Aritméticos | | Relacionales | |
|---|---|---|---|
| `+` suma / une textos | `5 + 3` | `>` `<` `>=` `<=` | comparar |
| `-` `*` `/` | resta, multiplica, divide | `==` igual valor | `12 == "12"` → true |
| `%` residuo | `10 % 3` → 1 | `===` igual valor y tipo | `12 === "12"` → false |
| paréntesis `( )` | van primero | `!=` / `!==` | diferente |

### Lógicos

| P | Q | `P && Q` | `P \|\| Q` | `!P` |
|---|---|---|---|---|
| V | V | V | V | F |
| V | F | F | V | F |
| F | V | F | V | V |
| F | F | F | F | V |

`&&` = **todas** deben cumplirse. `||` = **basta una**. `!` = **invierte**.
`!(a || b)` equivale a `!a && !b`.

Precedencia: paréntesis → `* / %` → `+ -` → comparaciones → `!` → `&&` → `||`.
(Ante la duda, paréntesis.)

## Decidir

```js-static
if (condicion) {
  // acciones
} else if (otraCondicion) {
  // acciones
} else {
  // en cualquier otro caso
}
```

```js-static
switch (variable) {
  case "A":
  case "B":                // A y B comparten el resultado
    resultado = 1
    break                  // sin break se "cae" al siguiente case
  case "C":
    resultado = 2
    break
  default:
    resultado = 0
}
```

```js-static
const resultado = condicion ? valorSiVerdadero : valorSiFalso
```

| Usa | Cuando |
|---|---|
| `if` | rangos, condiciones compuestas, varias acciones |
| `switch` | una variable contra valores **exactos** |
| ternario | **asignar** un valor directo |

## Repetir

```js-static
for (let i = 0; i < 5; i++) {   // inicializador; condición; incremento
  // se ejecuta con i = 0, 1, 2, 3, 4
}

while (condicion) {              // tú manejas el contador/bandera
  // ...
}
```

| Instrucción | Efecto |
|---|---|
| `break` | sale del bucle **ahora mismo** |
| `continue` | salta **solo esta vuelta** |
| `i++` / `i--` | sube / baja de a 1 |
| `i += 5` · `i -= 2` · `i *= 2` | reasignación abreviada |

**Antes de ejecutar un bucle:** ¿la condición puede volverse falsa? ¿mi incremento la acerca?

## Textos y plantillas

```js-static
const nombre = "Carlos"
`Hola ${nombre}, 2 + 2 = ${2 + 2}`    // template literal: comillas invertidas
nombre.length          // 6
nombre[0]              // "C"  (posiciones desde 0)
nombre[nombre.length - 1]   // último carácter
nombre.toUpperCase()   nombre.toLowerCase()
nombre.startsWith("Ca")   nombre.endsWith("s")
nombre.concat("!")        nombre.charAt(3)
(12.23434).toFixed(3)  // "12.234"
```

`+` evalúa de izquierda a derecha: `"Total: " + 5 + 3` → `"Total: 53"`.

## Objetos y arreglos

```js-static
const cliente = { nombre: "Rosa", edad: 34 }   // objeto: propiedad: valor
cliente.nombre          // "Rosa"   (punto)
cliente.edad = 35       // reasignar
cliente.telefono = "9"  // agregar
cliente.otraCosa        // undefined (no existe, sin error)

const precios = [12.5, 8, 30]                  // arreglo: lista ordenada
precios[0]              // 12.5   (corchetes, desde 0)
precios.length          // 3
precios[precios.length - 1]   // último
precios[1] = 10         // reasignar un elemento

const productos = [{ nombre: "Arroz" }, { nombre: "Aceite" }]
productos[1].nombre     // "Aceite"   (arreglo de objetos)

for (let i = 0; i < productos.length; i++) { /* productos[i] */ }
```

`undefined.algo` **detiene** el programa con `TypeError`.

## Funciones

```js-static
function calcularTotal(precio, cantidad = 1) {   // parámetros (cantidad tiene valor por defecto)
  return precio * cantidad                        // devuelve y TERMINA la función
}

calcularTotal(10, 3)    // invocar: argumentos por posición → 30
calcularTotal(10)       // falta cantidad → usa el 1 → 10
```

- **Definir no ejecuta**; invocar (`nombre()`) sí. Sin paréntesis no se ejecuta.
- **Parámetro** = hueco de la definición · **argumento** = valor al llamar. Por **posición**.
- Falta un argumento → `undefined` · sobra → se ignora.
- El valor por defecto solo se usa si el argumento **falta** o es `undefined` (`0`, `""`, `null` y `false` **no**).
- `console.log` **muestra**; `return` **entrega**. Sin `return` → `undefined`.
- Lo declarado dentro de la función **solo existe dentro**.
- Números y textos **se copian** al entrar; objetos y arreglos **no** (cambiarlos adentro cambia el original).

## Iteradores

```js-static
for (const nota of notas) { }                        // valores de un arreglo (break / continue sirven)
for (const letra of "hola") { }                      // letra por letra
notas.forEach(function (nota, indice) { })           // una función por elemento (sin break)
for (const clave in objeto) { objeto[clave] }        // claves de un objeto → valor con corchetes
```

| Quiero… | Uso |
|---|---|
| valores de un arreglo, con `break`/`continue` | `for of` |
| ejecutar una función por elemento, con índice | `forEach` |
| propiedades de un objeto | `for in` |
| control total del índice (atrás, de 2 en 2…) | `for` clásico |

- `objeto.clave` busca una propiedad **llamada** `clave` · `objeto[clave]` usa **lo que vale** la variable.
- `objeto[clave] = valor` también **crea** o cambia propiedades.
- No uses `for in` con arreglos (da los índices como texto).

## Métodos en objetos

```js-static
const cuenta = {
  saldo: 500,
  depositar: function (monto) { this.saldo += monto },   // this = el objeto dueño
  mostrar: function () { return `Saldo: ${this.saldo}` }
}
cuenta.depositar(100)    // objeto.metodo(argumentos)
cuenta.mostrar()
```

- **Método** = función que pertenece a un objeto. Leer `cuenta.mostrar` no lo ejecuta; `cuenta.mostrar()` sí.
- Propiedad inexistente → `undefined` · método inexistente al llamarlo → `TypeError`.
- Propiedades propias dentro del método: **`this.propiedad`**.

## Arrow functions

```js-static
const sumar = (a, b) => a + b            // sin llaves: return implícito
const saludar = (nombre) => {            // con llaves: hay que escribir return
  return `Hola, ${nombre}`
}
const bienvenida = () => console.log("Hola")      // sin parámetros: () obligatorios
const punto = (x, y) => ({ x: x, y: y })          // objeto con return implícito: entre paréntesis
notas.forEach((nota, indice) => console.log(indice, nota))
```

- Llaves **sin** `return` → devuelve `undefined`.
- Una flecha en `const` **no** se puede llamar antes de definirla.
- Método que usa `this` → `function`, **no** flecha.

## Errores típicos (revisa esto primero)

| Síntoma | Casi seguro es… |
|---|---|
| El `if` entra siempre | usaste `=` en vez de `==` |
| `x is not defined` | nombre mal escrito o variable fuera de su bloque `{ }` |
| `Unexpected token` | falta o sobra una llave, paréntesis o comilla |
| `Assignment to constant variable` | reasignaste un `const` |
| Bucle que nunca termina | la condición no puede volverse falsa |
| `"53"` en vez de `8` | uno de los datos es un texto |
| `undefined` | posición o propiedad que no existe |
| `NaN` | cuenta con un dato que no es número |
| Falla justo en el borde | `>` contra `>=` |
| Resultado distinto al esperado | el **orden** de tus `if`, `break` o `continue` |
| La función “no hace nada” | no la **invocaste** (faltan los `()`) |
| `undefined` en vez del resultado | usaste `console.log` en lugar de `return` (o llaves sin `return` en una flecha) |
| `undefined` dentro de un `for in` | usaste `objeto.clave` en vez de `objeto[clave]` |
| `x.forEach is not a function` | `x` no es un arreglo |
| `x.metodo is not a function` | el método no existe o está mal escrito |
| El método ve `undefined` en sus datos | falta el **`this.`** |
| `Cannot access 'x' before initialization` | llamaste una flecha antes de definirla |

## Tu ruta mínima

1. La pregunta en **una línea**.
2. **Entradas y salida**.
3. **Reglas** numeradas y su **prioridad**.
4. **Esqueleto** en comentarios.
5. Código **de a una regla**, ejecutando cada vez.
6. **Casos de borde** y un caso por rama.
