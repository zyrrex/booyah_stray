---
id: clase2
clase: 2
title: Condicionales y tu entorno de trabajo
subtitle: Instalar Node, usar la terminal y hacer que tu programa decida con if, else if y else.
date: 13 oct 2026
icon: terminal
summary: Entorno (Node, VS Code, terminal), console.log, comentarios y la sentencia if / else if / else con condiciones compuestas.
---

## Tu entorno de trabajo

Hasta ahora pensaste con datos y operadores. Hoy empiezas a **ejecutar** tus ideas en tu propia computadora. Necesitas tres herramientas:

- **Node**: un *intérprete*, una especie de traductor que entiende JavaScript y lo ejecuta fuera del navegador.
- **Visual Studio Code**: el editor donde escribes tu código.
- **La terminal**: una ventana donde le das órdenes escritas a la computadora.

> [!tip] ¿Qué hace Node exactamente?
> Tu archivo `.js` es solo texto. Node lo lee, lo traduce y lo ejecuta línea por línea. Sin Node (o sin un navegador), ese texto no hace nada.

### Comandos de terminal que vas a usar siempre

| Comando | Para qué sirve |
|---|---|
| `Ctrl + J` | Abrir/cerrar la terminal integrada de VS Code |
| `cd carpeta` | Entrar a una carpeta (cambiar de directorio) |
| `cls` | Limpiar la pantalla (en Mac/Linux: `clear`) |
| `node archivo.js` | **Ejecutar** un archivo de JavaScript |

Dos palabras que no debes mezclar: **directorio** es una *carpeta*; **fichero** es un *archivo*. Para ejecutar un programa, la terminal tiene que estar **dentro de la carpeta correcta** (o indicar la ruta).

> [!error] Error típico
> Escribir `node practica.js` y recibir *Cannot find module*: casi siempre es que la terminal está en otra carpeta. Revisa dónde estás antes de dudar de tu código.

### Ver resultados: `console.log`

`console.log(...)` **imprime** lo que le pases. Es tu linterna: te muestra el valor de una variable en ese momento.

```js
let nombre = "Max"
let edad = 8

console.log(nombre)
console.log("Edad:", edad)
console.log(`Hola ${nombre}`)   // lo entenderás a fondo en la clase 3
```

### Comentarios: notas para humanos

```js
// Esto es un comentario de UNA línea: JavaScript lo ignora

/*
   Esto es un comentario
   de VARIAS líneas.
   Sirve también para apagar código temporalmente.
*/

console.log("esto sí se ejecuta")
```

> [!tip] Atajos que te ahorran tiempo en VS Code
> **Ctrl + D** selecciona la siguiente coincidencia de lo que tienes marcado (borras o cambias varias a la vez). Con **Alt + clic** colocas varios cursores. Instala la extensión *indent-rainbow*: colorea la sangría y te ayuda a ver qué está dentro de qué.

## Decidir: la sentencia `if`

Hasta ahora tu programa hace siempre lo mismo. Con `if` hace **cosas distintas según los datos**.

> [!regla] La forma, siempre igual
> **instrucción** → `(condición)` → `{ acciones }`
> La condición va en **paréntesis**; las acciones, en **llaves**.

```js
const edad = 20

if (edad > 18) {
  console.log("VENDER LICOR")
} else {
  console.log("NO VENDER LICOR")
}
```

Lo que hay entre paréntesis puede ser tan complejo como quieras, pero al final **debe resolverse a `true` o `false`**. Si da `true`, entra al bloque del `if`; si no, pasa al siguiente.

| Parte | Significa |
|---|---|
| `if (condición) { ... }` | **si** se cumple, haz esto |
| `else if (condición) { ... }` | **si no**, pero **si** se cumple esta otra, haz esto |
| `else { ... }` | en **cualquier otro caso**, haz esto (no lleva condición) |

```js
const edad = 16
const tieneAcompanante = true

if (edad >= 18) {
  console.log("Entra")
} else if (edad >= 16 && tieneAcompanante) {
  console.log("Entra con acompañante")
} else {
  console.log("No entra")
}
```

### El orden importa (y mucho)

JavaScript revisa los `if` **de arriba hacia abajo y se queda con el primero que se cumple**. Todo lo demás se ignora. Por eso la regla que *manda sobre las otras* va primero.

```js
const compra = 600
const frecuente = true

if (compra > 200 && frecuente) {
  console.log("20% de descuento")
} else if (compra > 500) {
  console.log("10% de descuento")
} else {
  console.log("pago completo")
}
// Aunque compra > 500 también era verdad, ya se usó la primera.
```

```quiz
Si dos condiciones de una cadena `if / else if` se cumplen a la vez, ¿cuál se ejecuta?
- La última
- Las dos
- La primera que aparece *
> Se revisan de arriba hacia abajo y, apenas una se cumple, el resto se ignora.
```

## Condiciones compuestas y paréntesis

Con `&&`, `||` y `!` armas reglas del mundo real. Los **paréntesis agrupan** y dan prioridad, igual que en matemáticas.

Regla del portero: *“Entran los mayores de 18 solo si traen DNI. Los de 16 y 17 entran solo si vienen con un acompañante mayor de 21 con DNI.”*

```js
const edad = 17
const dni = false
const acompananteEdad = 25
const dniAcompanante = true

if (edad > 18 && dni == true) {
  console.log("DEJAR ENTRAR")
} else if ((edad == 16 || edad == 17) && (acompananteEdad > 21 && dniAcompanante == true)) {
  console.log("DEJAR ENTRAR")
} else {
  console.log("NO DEJAR ENTRAR")
}
```

Observa que `(edad == 16 || edad == 17)` va **entre paréntesis**: queremos decir “de 16 **o** 17, **y además** lo del acompañante”. Sin paréntesis, `&&` se evalúa antes que `||` y el significado cambia.

> [!ojo] Fíjate en el enunciado
> “Mayor de 21” **excluye** el 21 (`> 21`). “21 o más” **lo incluye** (`>= 21`). La mitad de los errores en condicionales vienen de leer mal estas palabras. Usa la herramienta 6 de la guía: prueba el valor justo debajo, el exacto y el justo encima.

### Evitar repetir código

Si dos ramas hacen **lo mismo**, puedes juntar sus condiciones con `||` en una sola, en vez de repetir el `console.log`:

```js
const edad = 20
const dni = true
const esVip = true

if ((edad > 18 && dni) || esVip) {
  console.log("ENTRA")
} else {
  console.log("NO ENTRA")
}
```

## Cómo atacar un problema de condicionales

Un enunciado largo da miedo, pero se desarma en pasos. Practícalo con este: *un paseador de perros acepta razas Rottweiler (“R”) o Pitbull (“P”) de entre 2 y 7 años, y solo pasea si el dueño trae la indumentaria.*

1. **Una línea**: ¿paseo al perro o no?
2. **Entradas**: raza, edad, indumentaria. **Salida**: `PASEAR PERRO` o `NO PASEAR PERRO`.
3. **Reglas**: (a) raza R o P; (b) edad entre 2 y 7; (c) con indumentaria.
4. **Prioridad**: todas deben cumplirse → se juntan con `&&`.

```js
const razaPerro = "R"
const edadPerro = 4
const indumentaria = true

if ((razaPerro == "R" || razaPerro == "P") && (edadPerro >= 2 && edadPerro <= 7) && indumentaria == true) {
  console.log("PASEAR PERRO")
} else {
  console.log("NO PASEAR PERRO")
}
```

> [!tu] Hazlo tú
> Cambia la raza a `"B"`, luego la edad a `1` y a `7` y a `8`, luego `indumentaria` a `false`. Predice **antes** de ejecutar. Esos son tus *casos de borde*.

### Errores que viste en clase

- **`=` en vez de `==`** dentro del paréntesis (asignar en lugar de comparar).
- **Llaves que faltan o sobran.** Si la terminal marca `Unexpected token`, cuenta tus `{` y tus `}`.
- **Crear variables que el ejercicio no pidió.** Trabaja con los datos que te dan: son tus *casos de uso*. Las sentencias `if` son los *controles de evaluación*.
- **Evaluar un texto donde va un boolean.** Si `historial` vale `"BUENO"`, la condición correcta es `historial == "BUENO"`, no `if (historial)`.

```quiz
En `if (edad = 18)` ¿cuál es el error?
- Faltan las llaves
- Se asigna con `=` en vez de comparar con `==` *
- `edad` debería ser texto
> Un solo `=` asigna. Para comparar usa `==` (o `===`).
```

## Resumen de la clase

- Node ejecuta tu JavaScript; la terminal te permite correrlo con `node archivo.js`.
- `console.log` imprime; `//` y `/* */` comentan.
- `if (condición) { ... } else if (condición) { ... } else { ... }`: se evalúa de arriba abajo y gana el primero que se cumple.
- Los paréntesis agrupan condiciones y definen su prioridad.
- Lee el enunciado con lupa (`>` contra `>=`) y **prueba los bordes**.

Ahora, a la **práctica**: 12 condicionales de la vida real. Recuerda la ruta mínima antes de teclear.
