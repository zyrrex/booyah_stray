---
id: clase7
clase: 7
title: Funciones
subtitle: Cómo encerrar una tarea en un bloque reutilizable, darle datos de entrada (parámetros) y recibir un resultado (return).
date: 2 nov 2026
icon: bolt
summary: Definir e invocar, parámetros y argumentos, valores por defecto, return, variables locales y funciones que llaman a funciones.
---

## El problema: el mismo código, una y otra vez

Imagina una tienda que, en tres momentos distintos del programa, tiene que mostrar el mismo cartel:

```js
console.log("=== Tienda La Esquina ===")
console.log("Bienvenido")

// ... más código ...

console.log("=== Tienda La Esquina ===")
console.log("Bienvenido")

// ... más código ...

console.log("=== Tienda La Esquina ===")
console.log("Bienvenido")
```

Tres copias idénticas. Si mañana el nombre de la tienda cambia, tienes que **encontrar y corregir las tres**. Si te olvidas de una, el programa queda inconsistente. Y esto es un cartel de dos líneas: imagina un cálculo de 30.

La solución es **encapsular** ese bloque en una pieza con nombre que puedas llamar cuando quieras. Esa pieza se llama **función**.

## Qué es una función

> [!regla] Definición
> Una **función** es un **bloque de instrucciones enfocado en cumplir una tarea específica**. Se escribe una vez y se puede **reutilizar** todas las veces que haga falta, en distintas partes del sistema.

Piensa en una licuadora: sabe hacer **una** cosa (licuar). No la reconstruyes cada vez que quieres un jugo: la **usas**. Una función es lo mismo: un aparato pequeño dentro de tu programa.

## Definición

```js-static
function nombreDeLaFuncion() {
  // cuerpo: el bloque de acciones de la función
  console.log("Hola mundo")
}
```

Cada parte tiene su papel:

| Parte | Qué es |
|---|---|
| `function` | La palabra reservada que dice “aquí voy a **definir** una función” |
| `nombreDeLaFuncion` | El nombre con el que la vas a **llamar** |
| `( )` | Los paréntesis: por ahora vacíos (en un rato ahí van los **parámetros**) |
| `{ ... }` | El **cuerpo**: las instrucciones que hará |

> [!tip] ¿Cómo nombrar una función?
> Sigue las mismas reglas que las variables (un solo idioma, sin tildes, sin espacios). Como una función **hace algo**, su nombre suele ser un **verbo**: `saludar`, `calcularTotal`, `esMayorDeEdad`. Si el nombre tiene varias palabras, la primera va en minúscula y cada palabra siguiente con su inicial en mayúscula (`calcularTotal`): eso se llama *camelCase*.

## Invocación (o llamada)

```js-static
nombreDeLaFuncion()
```

Se escribe el nombre **seguido de paréntesis**. Los paréntesis son lo que dice “ejecútala ahora”.

## Definir no ejecuta nada

Esta es **la idea más importante de la clase**. Mira qué pasa al probar este código:

```js
function saludar() {
  console.log("Hola mundo")
  console.log("Estoy aprendiendo funciones")
}
```

No imprime **nada**. Definir una función es solo **explicar qué hará**; todavía no hace nada. Recién cuando la **invocas** se ejecuta, y de forma directa, todo lo que definiste en el cuerpo. Agrega la llamada y pruébalo:

```js
function saludar() {
  console.log("Hola mundo")
  console.log("Estoy aprendiendo funciones")
}

saludar()
```

Y ahora el beneficio: **una definición, todas las llamadas que quieras**.

```js
function mostrarCartel() {
  console.log("=== Tienda La Esquina ===")
  console.log("Bienvenido")
}

mostrarCartel()
console.log("... el cliente compra algo ...")
mostrarCartel()
console.log("... el cliente compra otra cosa ...")
mostrarCartel()
```

Si cambia el nombre de la tienda, cambias **una sola línea**, en la definición.

```quiz
¿Qué imprime este código? `function decir() { console.log("hola") }`
- `hola`
- Nada: solo se definió la función, nunca se invocó *
- Un error
> Definir no ejecuta. Falta la llamada `decir()`.
```

> [!error] Error clásico: olvidar los paréntesis
> `saludar` (sin paréntesis) **no la ejecuta**: solo nombra la función como si fuera un valor. Para ejecutarla necesitas `saludar()`. Si tu función “no hace nada”, revisa primero que la estés **llamando** y con paréntesis.

### Se puede llamar desde un bucle

Una función también se invoca **dentro de un bucle**, tantas veces como pida el programa:

```js
function marcarAsistencia() {
  console.log("✔ Asistencia registrada")
}

for (let i = 0; i < 3; i++) {
  marcarAsistencia()
}
```

> [!profundiza] ¿Importa dónde la defines?
> Una función escrita con `function nombre() { ... }` se puede llamar **incluso antes** de la línea donde la definiste: JavaScript lee las definiciones primero. Es un detalle que no hace falta aprovechar (lo más ordenado es **definir arriba y usar abajo**), pero así no te sorprende cuando lo veas en código ajeno.
>
> ```js
> saludar()   // funciona, aunque la definición esté más abajo
>
> function saludar() {
>   console.log("Hola desde antes de ser definida")
> }
> ```

## El problema de los datos: parámetros

Ahora imagina que quieres una función que **evalúe la edad de una persona**. ¿De dónde saca la edad? Con lo que sabes hasta ahora tendrías que **definir la variable dentro de la función**:

```js
function evaluarEdad() {
  const edad = 20
  console.log(edad >= 18 ? "Mayor de edad" : "Menor de edad")
}

evaluarEdad()
```

Funciona, pero **solo sirve para la edad 20**. Para otra edad tendrías que copiar la función y cambiar ese `20`: justo lo que queríamos evitar.

Para eso existen los **parámetros**: **valores de entrada** que la función recibe cada vez que la llamas. Dentro de la función se comportan como variables, pero quien las llena es **quien llama**.

```js
function evaluarEdad(edad) {
  console.log(edad >= 18 ? "Mayor de edad" : "Menor de edad")
}

evaluarEdad(20)
evaluarEdad(15)
evaluarEdad(18)
```

Una sola función, tres resultados distintos. `edad` es el **parámetro**; el `20`, el `15` y el `18` son los **argumentos**.

> [!regla] Parámetro y argumento (no es lo mismo)
> - **Parámetro**: el nombre que escribes **en la definición**, entre paréntesis (`edad`). Es el “espacio vacío”.
> - **Argumento**: el valor real que pones **al llamar** (`20`). Es lo que llena el espacio.

Una receta dice “*necesitas una fruta*” (parámetro); cuando la usas, le pones “*una naranja*” (argumento).

### Varios parámetros

Se separan con **comas**, y los argumentos se asignan **por posición**: el primero al primer parámetro, el segundo al segundo…

```js
function presentar(nombre, edad) {
  console.log(`${nombre} tiene ${edad} años`)
}

presentar("Ana", 30)
presentar("Luis", 17)
```

> [!ojo] El orden importa
> Si llamas `presentar(30, "Ana")`, el `30` entra en `nombre` y `"Ana"` en `edad`: no da error, pero el resultado no tiene sentido. **Los argumentos se asignan por posición, no por significado.**

```js
function restar(a, b) {
  console.log(a - b)
}

restar(10, 3)   // 7
restar(3, 10)   // -7: no es lo mismo
```

### Si faltan o sobran argumentos

JavaScript **no se queja**. Lo que pasa es esto:

- **Falta** un argumento → ese parámetro vale **`undefined`**.
- **Sobra** un argumento → se **ignora**.

```js
function presentar(nombre, edad) {
  console.log(`${nombre} tiene ${edad} años`)
}

presentar("Ana")               // edad es undefined
presentar("Luis", 17, "extra") // el "extra" se ignora
```

> [!tip] ¿Cuántos argumentos pasar?
> **Los mismos que parámetros**, en el mismo orden. Cuando veas `undefined` en una salida, sospecha de un argumento que faltó.

### Un parámetro puede ser cualquier valor

Un número, un texto, un booleano… y también **un objeto o un arreglo**, que ya conoces de la clase anterior:

```js
function mostrarCliente(cliente) {
  console.log(`${cliente.nombre} (${cliente.edad} años)`)
}

mostrarCliente({ nombre: "Rosa", edad: 34 })

function sumarNotas(notas) {
  let total = 0
  for (let i = 0; i < notas.length; i++) {
    total += notas[i]
  }
  console.log(`Total: ${total}`)
}

sumarNotas([14, 9, 17])
```

Fíjate cómo `sumarNotas` funciona con un arreglo de **cualquier tamaño** gracias a `length`. Una función bien escrita no depende de los datos concretos con los que la probaste.

## Parámetros por defecto (*default parameters*)

Un **parámetro por defecto** es un parámetro con un **valor de respaldo**: si quien llama **no pasa** ese argumento, se usa el valor por defecto. Se escribe con `=` en la definición:

```js
function saludar(nombre = "invitado") {
  console.log(`Hola, ${nombre}`)
}

saludar("Carlos")   // Hola, Carlos
saludar()           // Hola, invitado
```

Es útil cuando **necesitas sí o sí un valor** en la función y no quieres que, si no te lo pasan, aparezca un `undefined` en la salida.

```js
function aplicarDescuento(precio, porcentaje = 10) {
  console.log(precio - precio * porcentaje / 100)
}

aplicarDescuento(200)      // usa 10 %  → 180
aplicarDescuento(200, 25)  // usa 25 %  → 150
```

> [!ojo] ¿Cuándo se usa realmente el valor por defecto?
> **Solo** cuando el argumento **falta** o llega como **`undefined`**. Con **cualquier otro valor** (aunque parezca “vacío”) **se usa ese valor**: `null`, `0`, `""` y `false` **no** activan el respaldo.
>
> ```js
> function mostrar(dato = "sin dato") {
>   console.log(dato)
> }
>
> mostrar()            // "sin dato"   (falta)
> mostrar(undefined)   // "sin dato"   (undefined)
> mostrar(0)           // 0            (el 0 es un valor: se respeta)
> mostrar("")          // (línea vacía)
> mostrar(null)        // null
> ```
> Pruébalo tú mismo en el cuadro de arriba: es de esos detalles que conviene ver con los ojos.

> [!regla] Lo opcional va al final
> Los parámetros con valor por defecto se ponen **después** de los obligatorios: `function f(precio, porcentaje = 10)`. Si pusieras el opcional primero, para saltártelo tendrías que escribir `undefined` a mano.

```quiz
Con `function ver(x = 5) { console.log(x) }`, ¿qué imprime `ver(0)`?
- `5`
- `0` *
- `undefined`
> El valor por defecto solo se usa si falta el argumento o llega `undefined`. El `0` es un valor válido y se respeta.
```

## `return`: devolver un resultado

Hasta ahora nuestras funciones **imprimen**. Pero a menudo lo que quieres es que la función **calcule algo y te lo entregue**, para usarlo después. Eso lo hace **`return`**.

```js
function calcularIGV(precio) {
  return precio * 0.18
}

const igv = calcularIGV(100)
console.log(igv)                    // 18
console.log(calcularIGV(250))       // 45
console.log(`Total: ${100 + calcularIGV(100)}`)   // 118
```

`calcularIGV(100)` se **convierte en el valor que devuelve** (18), y ese valor lo puedes guardar en una variable, imprimir o usar dentro de otra cuenta.

### `console.log` no es `return`

Es **la confusión más común** de este tema. Mira las dos versiones:

```js
function dobleImprimiendo(n) {
  console.log(n * 2)       // solo MUESTRA el valor en pantalla
}

function dobleDevolviendo(n) {
  return n * 2             // ENTREGA el valor a quien llamó
}

const a = dobleImprimiendo(5)   // imprime 10 ...
const b = dobleDevolviendo(5)   // no imprime nada

console.log(a)   // undefined  ← no entregó nada
console.log(b)   // 10
```

| | `console.log(x)` | `return x` |
|---|---|---|
| ¿Qué hace? | Muestra `x` en pantalla | Entrega `x` a quien llamó |
| ¿Puedo usar el valor después? | No | **Sí** (variable, cuenta, otra función…) |
| ¿Termina la función? | No | **Sí** |

> [!regla] Una función sin `return` devuelve `undefined`
> Si no escribes `return`, la función termina y entrega `undefined`. Por eso `const a = dobleImprimiendo(5)` guardó `undefined`.

### `return` termina la función

En cuanto se ejecuta un `return`, la función **se detiene** y lo que haya debajo **no se ejecuta**. Funciona parecido al `break` de los bucles, pero sale de **toda la función**.

```js
function clasificarEdad(edad) {
  if (edad < 0) {
    return "Edad inválida"      // aquí termina: no se evalúa lo de abajo
  }
  if (edad >= 18) {
    return "Mayor de edad"
  }
  return "Menor de edad"
}

console.log(clasificarEdad(-3))   // "Edad inválida"
console.log(clasificarEdad(20))   // "Mayor de edad"
console.log(clasificarEdad(10))   // "Menor de edad"
```

Esta forma —**descartar primero los casos especiales con `return`** y dejar el caso normal al final— es muy usada: evita muchos `else` anidados.

> [!error] Código después del `return`
> ```js-static
> function sumar(a, b) {
>   return a + b
>   console.log("Listo")    // jamás se ejecuta
> }
> ```

### Funciones que responden verdadero o falso

Muy comunes. Por costumbre su nombre empieza con **`es`** o **`tiene`**:

```js
function esPar(n) {
  return n % 2 === 0
}

console.log(esPar(4))   // true
console.log(esPar(7))   // false

if (esPar(10)) {
  console.log("El 10 es par")
}
```

Como `esPar(10)` **vale** `true`, la puedes poner directo dentro de un `if`.

### Devolver varios valores: un objeto

`return` devuelve **un solo valor**. Si necesitas entregar varias cosas, junta todo en **un objeto** (que ya conoces):

```js
function resumirNotas(nota1, nota2) {
  return {
    total: nota1 + nota2,
    promedio: (nota1 + nota2) / 2
  }
}

const resumen = resumirNotas(14, 18)
console.log(resumen.total)      // 32
console.log(resumen.promedio)   // 16
```

## Variables dentro de la función: ámbito local

Esto se conecta con el **alcance** que viste en la clase 5. Lo que declaras **dentro** de una función (incluidos sus parámetros) **solo existe dentro de ella**:

```js
function calcular(base) {
  const resultado = base * 2
  return resultado
}

console.log(calcular(5))
console.log(resultado)   // ✖ ReferenceError: resultado no existe aquí afuera
```

Y cada llamada empieza **de cero**: sus variables nacen al entrar y desaparecen al salir. Dos llamadas no se pisan.

```js
let total = 100          // variable de afuera

function probar() {
  let total = 5          // otra variable, local: tapa a la de afuera
  return total
}

console.log(probar())    // 5
console.log(total)       // 100: la de afuera no cambió
```

> [!tip] Una función **puede leer** lo de afuera… pero no conviene depender de eso
> Si dentro de una función usas una variable externa, funciona. Aun así lo más limpio es que **todo lo que necesite entre por parámetros** y **todo lo que produzca salga por `return`**. Así la función se puede probar y reutilizar en cualquier parte.

## Funciones que llaman a funciones

Una función puede **invocar a otra**. Es la forma natural de dividir un problema grande en tareas pequeñas, cada una con **una sola responsabilidad**:

```js
function calcularIGV(monto) {
  return monto * 0.18
}

function calcularTotal(monto) {
  return monto + calcularIGV(monto)
}

console.log(calcularTotal(100))   // 118
console.log(calcularTotal(250))   // 295
```

> [!tip] Una función, una tarea
> Si te cuesta ponerle nombre a una función porque “hace esto y también aquello”, probablemente son **dos funciones**. Funciones chicas = fáciles de entender, de probar y de reutilizar.

También puedes **combinar** llamadas: `calcularTotal(calcularTotal(100))` primero resuelve la de adentro y usa su resultado como argumento de la de afuera.

## Pasar objetos y arreglos: ojo, no se copian

Aquí hay una diferencia que sorprende:

- Los **números, textos y booleanos** se **copian** al entrar a la función. Cambiar el parámetro adentro **no toca** la variable de afuera.
- Los **objetos y arreglos NO se copian**: la función recibe **el mismo objeto**. Si lo modificas por dentro, **cambia el original**.

```js
function sumarUno(n) {
  n = n + 1
  return n
}

function subirPrecio(producto) {
  producto.precio = producto.precio + 1
}

let cantidad = 5
sumarUno(cantidad)
console.log(cantidad)          // 5: se copió, el original no cambió

const arroz = { nombre: "Arroz", precio: 5 }
subirPrecio(arroz)
console.log(arroz.precio)      // 6: era el mismo objeto, sí cambió
```

> [!tip] Piensa en una llave
> Al pasar un número, entregas **una fotocopia**. Al pasar un objeto, entregas **la llave de la misma casa**: cualquier cambio que hagas adentro lo verá todo el que tenga esa llave.

Cuando quieras que una función **no** altere los datos, solo **léelos** (`producto.precio`) y devuelve un valor con `return`.

## Cuaderno de errores típicos

| Síntoma | Casi seguro es… |
|---|---|
| La función “no hace nada” | no la **invocaste** (falta `nombre()`) |
| Sale `undefined` en vez del resultado | usaste `console.log` en lugar de `return`, o te faltó el `return` |
| Sale `undefined` dentro del texto | faltó un argumento |
| Resultados raros con varios parámetros | pasaste los argumentos en **otro orden** |
| `x is not defined` | usaste afuera una variable que nació **dentro** de la función |
| `nombre is not a function` | escribiste `nombre()` pero `nombre` no es una función (revisa mayúsculas y errores de tipeo) |
| Lo de debajo del `return` no corre | `return` **termina** la función |
| El objeto cambió “solo” | lo modificaste dentro de una función: objetos y arreglos **no se copian** |

## Cómo usar el cuaderno de práctica

El cuaderno de esta clase se trabaja **por bloques**. No pases al siguiente hasta cerrar el anterior.

| Día | Tema | Ejercicios |
|---|---|---|
| 1 | Definir e invocar | F1 a F3 |
| 2 | Parámetros y argumentos | F4 a F7 |
| 3 | Valores por defecto y `return` | F8 a F12 |
| 4 | Funciones con datos reales | F13 a F16 |
| 5 | Cajero e integrador (la boleta) | F17 y F18 |

**Reglas del juego**

- **Todavía no** uses métodos de arreglos (`push`, `map`…) ni otras formas de escribir funciones: solo `function nombre() { }`.
- Cada función hace **una cosa** y tiene **nombre de verbo** (o `es…` si responde verdadero/falso).
- Si una función calcula algo para usarlo después, **devuélvelo con `return`**; imprime **afuera**, al llamarla.
- Antes de programar: la **ruta mínima** y la **predicción** de la salida, a mano.

> [!tip] Prueba la función con varios argumentos
> Cada caso de prueba del evaluador llama a **tu función con otros datos**. Una función que solo anda con el ejemplo de arriba no está terminada.

## Resumen de la clase

- **Función** = bloque con nombre que cumple una tarea y se **reutiliza**.
- **Definir** (`function nombre() { }`) no ejecuta; **invocar** (`nombre()`) sí.
- **Parámetros** son los huecos de la definición; **argumentos**, los valores al llamar. Se asignan **por posición**.
- Falta un argumento → `undefined`; sobra → se ignora.
- **Valor por defecto** (`function f(x = 5)`): solo cuando el argumento falta o es `undefined`.
- **`return`** entrega un valor y **termina** la función. Sin `return` → `undefined`. **`console.log` no es `return`.**
- Lo declarado dentro de una función **solo existe dentro** de ella.
- Las funciones pueden **llamar a otras funciones**.
- Objetos y arreglos pasan **sin copiarse**: cambiarlos adentro cambia el original.

Y ahora la **práctica** de funciones, bloque por bloque.
