# Metodología de enseñanza de Carlos

> **Qué es este documento.** La descripción completa de **cómo enseña Carlos a Luis Angel**: cómo explica, cómo
> pregunta, cómo corrige, cómo deja tareas, cómo toma notas y cómo se mide el avance. Sirve para tres cosas:
> 1. **Que Carlos vea su propio método** escrito, con sus fortalezas y puntos a afinar.
> 2. **Que Claude escriba el contenido de stray con la voz y el método de Carlos** (ver §17).
> 3. **Que otra persona pueda enseñar igual** si algún día reemplaza o acompaña a Carlos.
>
> Complementos: [`PEDAGOGIA.md`](PEDAGOGIA.md) (criterios que debe cumplir **el contenido**),
> [`LECCIONES.md`](LECCIONES.md) (cómo se escribe una clase), [`STRAY.md`](STRAY.md) (la app).
> Este documento describe **el método vivo del tutor**; PEDAGOGIA describe **lo que el contenido debe cumplir**.

---

## 0. De dónde sale este documento (fuentes y nivel de certeza)

Se construyó **leyendo**, no inventando. Cada afirmación lleva una marca:

| Marca | Significa |
|---|---|
| 🟢 **Observado** | Aparece en las grabaciones transcritas, en las notas de Meet, en las guías o en los cuadernos de Carlos |
| 🟡 **Inferido** | Patrón que se repite en varias fuentes, pero que Carlos nunca enunció así |
| 🔵 **Declarado** | Carlos lo dijo directamente al pedir la web (mensajes a Claude) |
| ⚠ **Por confirmar** | Dato incierto: Carlos debe validarlo |

**Fuentes usadas**

| Fuente | Qué aporta |
|---|---|
| Sesión 1 (12 oct 2026, ~1 h 49 min): **transcripción completa** + notas de Meet | La forma real de hablar, preguntar y corregir, minuto a minuto |
| Sesiones 2 a 6 (13, 15, 19, 21 y 26 oct 2026): **notas de Meet** (resumen, próximos pasos, detalles) | Temas, ritmo, tipos de corrección, tareas |
| *Guía de resolución de problemas* (22 oct) | El método de resolución y la bitácora |
| *Ejercicios grandes: niveles 1 a 3* y su *Solucionario* | Cómo diseña ejercicios y qué se guarda solo para Carlos |
| *Arreglos y objetos: cuaderno de práctica diaria* (25 ejercicios) | Cómo organiza la práctica por días |
| Tus notas de **Funciones**, **Iteradores y métodos en objetos** y **Arrow functions** | Cómo escribe una explicación: concisa, directa, con huecos para que otros amplíen |
| Mensajes de Carlos al encargar la web | Su intención, sus reglas y su preocupación por no saturar |

> ⚠ Las sesiones 2 a 6 se conocen por las **notas automáticas** de Meet, que pueden contener errores. Carlos debe
> revisar los detalles marcados con ⚠.

---

## 1. Filosofía y objetivos

### 1.1 El objetivo de fondo 🟢
Que Luis **pueda defenderse por sí mismo** programando. No se busca que “sepa palabras”, sino que **resuelva**. Carlos lo
dijo explícitamente en la primera sesión: hoy conviene formar a alguien **útil**, que sepa programar **y** se apoye en la IA,
no que dependa de ella.

### 1.2 Los principios que mandan

| # | Principio | Cómo se ve en la práctica |
|---|---|---|
| 1 | **Lógica antes que arquitectura** 🟢 | La sesión 1 abre con un mapa: *lógica de programación → arquitectura de software*. Se dice que la arquitectura “vendrá en unos años” |
| 2 | **El método importa más que la sintaxis** 🟢 | La Guía abre con: *“Tu problema no es la sintaxis: es el método”* |
| 3 | **Se responde la pregunta, no el código** 🟢 | “Regla madre” de la Guía |
| 4 | **Un error con análisis enseña; uno por suposición, no** 🟢 | Esta distinción reaparece en la bitácora (pregunta 5) |
| 5 | **Práctica por encima de teoría** 🟢 | Sesión 4: aunque falte dominio teórico, *“la experiencia práctica es el factor determinante”* |
| 6 | **Dominar antes de avanzar** 🟢 | Sesión 4: se acuerda **repasar** `switch` **antes** de seguir |
| 7 | **No saturar** 🟢🔵 | Sesión 4: Carlos corta la explicación de `while` y `do while` *“para no saturar”*; en la web lo repite como regla |
| 8 | **Ajustar el ritmo al alumno** 🟢 | Sesión 2: el avance *“se ajustará al ritmo de Luis”* |
| 9 | **Primero lo simple, luego la complejidad por capas** 🟡 | El `if` crece: condición simple → `else if` → respaldo (`else`) → condiciones compuestas → paréntesis |
| 10 | **Honestidad sobre el lenguaje** 🟢 | Repite “*cada lenguaje lo hace distinto*” y avisa cuando algo es una convención |
| 11 | **Ver datos reales** 🟢 | Sesión 6: muestra la pestaña de red del navegador para que Luis vea objetos y arreglos de verdad |
| 12 | **Entender, no memorizar** 🟡 | Pide explicar con palabras propias, repregunta “¿por qué?” incluso tras una respuesta correcta |

### 1.3 Lo que Carlos **no** quiere
- Que Luis **adivine** (“trabajar con las variables correctas en lugar de adivinar o inventar lógicas”). 🟢
- Que se **sature** de teoría. 🟢
- Que se **desvíe** investigando otras ramas: *“solo esta parte, sin irte por otras ramas, porque lo que te bloquea…”* 🟢
- Datos **fijos (“quemados”)** en bucles: da control nulo sobre la información cambiante. 🟢
- Variables **no solicitadas** en un ejercicio. 🟢
- Mezclar **idiomas** en los nombres de variables y olvidar tildes. 🟢

---

## 2. El alumno: perfil y diagnóstico

### 2.1 Perfil 🔵
Luis Angel (usuario `stray`), de secundaria, **principiante** en programación. Entiende por la práctica, pregunta cuando
algo no cierra y se anima a **suponer** cuando no sabe (a veces demasiado: de ahí la regla de “no suponer”).

### 2.2 Los “talones” (diagnóstico) 🟢
De la Guía de resolución, tras revisar sus ejercicios:

| Talón | Cómo se manifiesta |
|---|---|
| **1. Ordenar un programa** | No sabe por dónde empezar y todo se enreda |
| **2. Perder el rastro de los valores** | Una variable cambió y no sabe en qué línea ni por qué |
| **3. Leer el código en vez de la pregunta** | Se pierde entre líneas que nada tienen que ver con lo que se pregunta |

Vigilados además (se anotan como talones 4, 5 y 6 si se repiten en la bitácora): **confundir AND con OR**, **negar mal una
condición**, **errar por uno en los límites** (`>` contra `>=`).

### 2.3 Errores observados, sesión por sesión 🟢

| Sesión | Error o dificultad |
|---|---|
| 1 | Dificultad inicial para **escribir** una condición compuesta; usar `=` en lugar de `==`; poner **espacios** dentro de nombres de variable; confundir **variables (casos)** con **condiciones**; confusión con “buleano” (término nuevo) |
| 2 | Evaluar un historial como **texto** en lugar de **booleano**; crear **variables no solicitadas**; **llaves** faltantes y orden de `if`/`else if` |
| 3 | **Prioridades** al ordenar precios; **AND** frente a **OR**; **mezcla de inglés y español** en variables; **tildes**; **negación** con nombres de usuario; **tipos string** mal identificados |
| 4 | Confusión inicial con `switch` y `break`; el valor de un contador tras reasignaciones |
| 5 | **Confusión** con la lógica del ejercicio del cajero; dudas con el **alcance** de variables; confusión al decidir **si un valor es verdadero o falso** |
| 6 | Pensar que los **corchetes** de los arreglos “están por encima” de los objetos; **números fijos** en el bucle; **índice** inicial (0 frente a 1) |

### 2.4 Fortalezas observadas 🟢🟡
- **Pregunta** cuando no entiende (“aguanta, una pregunta…”, “¿tú cómo lo ves?”).
- **Participa**: calcula, reasigna y explica en voz alta durante la sesión.
- **Investiga**: busca símbolos, significados y ejemplos por su cuenta.
- **Pide práctica**: “dos ejercicios para asegurarme”.
- **Se autoevalúa**: reconoce cuando no puede (“la verdad no puedo”).
- **Repasa**: planea ver la grabación varias veces (sesión 5).
- **Organiza**: crea archivos propios (`note`, `bases`) para practicar.

---

## 3. Calendario y recorrido (lo que se vio y cuándo)

### 3.1 Cadencia
- **Videollamada** (Meet, a veces Discord) por la noche, de **~1 h a ~1 h 50**, con grabación y notas automáticas. 🟢
- Las seis primeras sesiones cayeron **entre semana, ~20:00–21:30 (GMT-5)**. 🟢
- **Cadencia declarada hacia adelante: los domingos.** 🔵 ⚠ *(confirmar si desde ahora todas son dominicales)*.
- Tras cada sesión: **ejercicios** (esa misma tarde o a la mañana siguiente) y **revisión** en la siguiente sesión. 🟢

### 3.2 Recorrido

| # | Fecha (2026) | Temas | Entrega posterior |
|---|---|---|---|
| 1 | 12 oct | Mapa (lógica→arquitectura); datos; variables (definición, declaración, reasignación); constantes; tipos (string, boolean, number); conversión a booleano; operadores aritméticos, relacionales (`===`), lógicos; tablas de verdad; `if`/`else if`/`else`; ejercicio guiado (paseo de perros) | Ejercicios en un diagrama compartido (draw.io) |
| 2 | 13 oct | Entorno (Node, VS Code, terminal); `let`; `console.log`; `if`/`else` (acceso a eventos); paréntesis; comentarios; ejercicios 1 (descuentos) y 2 (préstamos) | Resolver los 9 ejercicios de condicionales |
| 3 | 15 oct | Revisión de ejercicios 4–12; tipado dinámico (frente a Java); concatenación; **template literals**; `typeof`; precedencia; **módulo**; `switch` | Ejercicios: precedencia, tipos, `typeof`, `switch` |
| 4 | 19 oct | Repaso de `switch`; **ternario** (y anidado); **bucles** (`for`: inicializador, condición, incremento; `+=`, `++`…); `break` y `continue`; repaso del *roadmap* | Ejercicios: template literals, bucles, ternarios, `switch` |
| 5 | 21 oct | Revisión del **cajero**; **alcance** de variables; `while`; textos e **índices**; práctica de booleanos | Practicar `while`/`do while` y funciones |
| 6 | 26 oct | **Objetos**, **arreglos**, `length`, índices desde 0, estructuras anidadas, datos reales en la red del navegador | Investigar JSON; corregir bucle con variables dinámicas; ajustar índice |
| — | 22 oct | **Guía de resolución de problemas** (escrita tras detectar los talones) | Plan jueves–sábado |
| — | 22–25 oct | **Ejercicios grandes** (15, niveles 1–3) + **Solucionario** (solo Carlos) y **cuaderno de arreglos y objetos** (25) | — |
| 7 | _por dictar_ | **Funciones** (nota de Carlos) | 15+ ejercicios en la web |
| 8 | _por dictar_ | **Iteradores** y **métodos en objetos** (nota de Carlos) | 15+ ejercicios en la web |
| 9 | _por dictar_ | **Arrow functions** (nota de Carlos) | 15+ ejercicios en la web |

### 3.3 Hoja de ruta anunciada por Carlos 🟢
Después de los condicionales: **bucles y funciones** (“programación más robusta y reutilizable”), luego **aplicaciones con una
librería de JavaScript** (primero un **temporizador Pomodoro** hecho a mano), y mucho más adelante, **arquitectura**.

---

## 4. Anatomía de una sesión en vivo

### 4.1 Estructura general 🟡 (patrón que se repite)

```
1. APERTURA        ritmo, entorno, qué se revisa hoy                       (2-10 min)
2. REVISIÓN        el alumno presenta la tarea y explica su solución       (20-40 min)
3. MAPA            dónde estamos en el roadmap y qué toca                  (1-3 min)
4. TEORÍA CORTA    un concepto a la vez, con pregunta primero              (5-15 min c/u)
5. PRÁCTICA VIVA   el alumno escribe, Carlos mira y corrige                (10-30 min)
6. CIERRE ORAL     preguntas de repaso (§9.3)                              (5-10 min)
7. TAREA           qué se entrega y para cuándo                            (2-5 min)
```

### 4.2 Ejemplo real: sesión 1 (12 oct, 1 h 49 min) 🟢

| Minuto | Qué pasa |
|---|---|
| 00:00 | Prepara el entorno: audio, pantalla doble, grabación |
| 01:14 | Presenta el **mapa** (lógica → arquitectura) y **el diagrama** donde Luis también tendrá permiso de editor |
| 03:41 | **Pregunta primero**: “¿qué es esto?”; de “nombre” llega a **dato** con ejemplos propios de Luis |
| 07:33 | **Variable**: Luis la crea él mismo; Carlos valida (“¿qué has hecho?”) |
| 10:13 | **Reasignación** frente a definición y declaración |
| 20:35 | **Constantes** (Pi, meses) |
| 24:43 | **Tipos de datos** (string, boolean, number) y el consejo de aprender los términos en inglés |
| 34:32 | **Conversión a booleano** (0 falso, número distinto de cero verdadero…) |
| 38:56 | **Aritméticos**, con A=12 y B=3 que Luis calcula |
| 40:07 | **Relacionales** y la diferencia `==` / `===` |
| 46:57 | **Lógicos** con la analogía de la mamá y la cocina; Luis responde cada fila de la tabla |
| 52:50 | Expresiones combinadas con **NOT**; Luis las evalúa |
| 58:08 | Cierra la teoría: *“entiende las tablas de verdad”*; Luis pide dos ejercicios |
| 59:55 | **`if`**: caso de la venta de licor por edad; se añade el acompañante y la identificación |
| 1:15:49 | **Ejercicio**: el paseo de perros; Luis escribe, Carlos depura |
| 1:42:52 | **Evaluación oral** de lo visto |
| 1:48:09 | Cierre: qué le falta, cómo se entregan los ejercicios |

### 4.3 Reglas de la sesión
- **El alumno trabaja más que el tutor** durante la práctica: escribe, ejecuta, explica. 🟢
- **Un concepto a la vez**: se cierra antes de abrir el siguiente. 🟢
- **Pantalla compartida y diagrama/repositorio compartido** para ver lo que el alumno escribe. 🟢
- **Todo se graba** para que el alumno pueda **revisarlo después**. 🟢
- Si la sesión se alarga con ruido (problemas técnicos), se **vuelve al ejercicio**, no se cambia de tema. 🟡

---

## 5. Cómo explica un concepto

### 5.1 El molde de explicación (10 pasos) 🟡
Se reconstruye de las sesiones y de las notas escritas:

| # | Paso | Ejemplo observado |
|---|---|---|
| 1 | **Pregunta primero**, sin definir | “¿Esto qué es?” (señala un nombre) |
| 2 | **Deja que el alumno responda** y lo amplía con “¿qué más?” | Luis: “un nombre… sirve para registrarse” |
| 3 | **Generaliza**: lo concreto → el concepto | “Un nombre, una marca, un número de transacción… todo es un **dato**” |
| 4 | **Nombra** el concepto con una definición simple | “Variable: un dato que puede variar en cualquier gestión” |
| 5 | **Lo hace con el alumno**: que lo escriba él | “Ahora quiero que conviertas esto a una variable” |
| 6 | **Pide que explique** lo que hizo | “Ahora dime qué has hecho” |
| 7 | **Contrasta**: lo contrario, el error, el caso borde | “Si reasigno una constante, ¿qué pasa?” → error |
| 8 | **Cuenta cómo se usa de verdad** | “Así lo hago yo en el día a día, pero lo desarmé para que veas los pasos” |
| 9 | **Avisa si algo varía por lenguaje** | “Aquí va a haber algo contradictorio con algunos lenguajes; te lo explico después” |
| 10 | **Verifica**: “¿está claro?”, “¿te fijas?”, y lo vuelve a preguntar más tarde | Evaluación oral al final |

### 5.2 Dos versiones de un mismo tema: la didáctica y la real 🟢
Carlos enseña **dos formas** y dice cuál es cuál:
- **La didáctica**: desarma el tema en pasos para que se entienda (definir la variable y luego darle valor).
- **La real**: “así lo uso yo como programador” (definir y asignar en una línea).

Así Luis aprende **el porqué** sin quedarse con una versión artificial.

### 5.3 Técnicas de explicación

| Técnica | Qué es | Dónde se ve |
|---|---|---|
| **Analogía de la vida diaria** | Usa una situación que Luis conoce | Cocina y platos (AND/OR); pintar cercas (bucles) |
| **Caso cotidiano de negocio** | Un problema con reglas reales | Venta de licor, discoteca, préstamos, descuentos, cajero |
| **Construcción por capas** | Cada paso agrega una regla | `if` → `else if` → respaldo → condiciones compuestas |
| **Ejecución a mano** | Resolver paso a paso en voz alta | Operadores con A=12 y B=3; incrementos manuales de 250 en 250 |
| **Demostración en vivo** | Mostrar el efecto en un editor | Alcance de `monto`; bucle infinito |
| **Contraste entre lenguajes** | Dónde cambia y dónde no | Tipado dinámico (JS) frente a estático (Java) |
| **Mostrar el mundo real** | Datos reales del navegador | Pestaña de red: objetos con arreglos de teléfonos |
| **Hacer fallar a propósito** | Provocar el error | Reasignar una constante; bucle sin incremento; propiedad inexistente |
| **Preguntar “¿por qué?” siempre** | Aunque la respuesta sea correcta | Tabla del AND: cada fila lleva su “¿por qué?” |
| **Pedir simplificar** | Reducir lo que se escribió | “Esto que hiciste, ¿se puede resumir o no?” (OR con paréntesis) |
| **Decir cuánto importa** | Jerarquizar lo que se aprende | “Casi nunca se usan `while` y `do while`”; “el `if` solo quiere un booleano” |

### 5.4 Qué se enseña con cada concepto (los cuatro compartimentos) 🟡
Casi todo concepto sale con:
1. **Qué es** (definición simple).
2. **Para qué sirve** (el problema que resuelve; ejemplo cotidiano).
3. **Cómo se escribe** (sintaxis y significado de cada parte).
4. **Dónde falla** (error típico, caso borde, “no hagas esto”).

### 5.5 Terminología 🟢
- Se enseñan los **nombres reales** (en inglés cuando son el estándar): *string, boolean, number, template literals,
  break, default, scope, typeof*.
- Motivo declarado: **la documentación técnica está en inglés**.
- Los nombres de **variables del curso**: **un solo idioma** (español), **sin tildes**.
- Se recomienda **no aprender** una forma antigua salvo para **leer código ajeno** (concatenación: útil para leer; los
  template literals, para escribir).

### 5.6 Profundidad: qué se explica y qué se aplaza 🟢
- **Se aplaza** lo que se usa poco o satura: `while` y `do while` (“casi nunca se utilizan”); ternarios anidados (“solo
  para asignaciones directas”); arquitectura (“unos años todavía”); JSON (“investiga qué es”).
- **Se deja como curiosidad** guiada: “investiga JSON”, pero **sin desviarse**.
- **Se avisa** cuando algo es una convención o cambia con el lenguaje.

---

## 6. La técnica de preguntar (método socrático práctico)

### 6.1 Tipos de pregunta que usa 🟢

| Tipo | Ejemplo | Para qué |
|---|---|---|
| **Abrir** | “¿Esto qué es?” | Descubrir qué sabe |
| **Ampliar** | “¿Qué más?” | Sacar más ideas antes de nombrarlas |
| **Aplicar** | “Ahora conviértelo a una variable” | Que lo haga |
| **Verificar** | “Dime qué has hecho” | Que lo explique |
| **Provocar** | “¿Estás seguro?” | Que revise antes de confirmarle |
| **Justificar** | “¿Por qué?” | Que el criterio quede dicho |
| **Anticipar** | “¿Qué me va a arrojar aquí?” | Predecir antes de ejecutar |
| **Reducir** | “¿Se puede resumir o no?” | Mejorar la solución |
| **Comparar** | “¿Qué dijimos sobre eso?” (cuando usa `=` en lugar de `==`) | Reutilizar lo aprendido |
| **Evaluar** | “¿Qué tipos de datos existen? ¿Qué sentencias de control?” | Comprobar al cierre |
| **Cuantificar** | “¿Esto está claro?”, “¿Te fijas?” | Medir comprensión |

### 6.2 Cómo reacciona ante cada respuesta 🟢🟡

| Respuesta del alumno | Reacción |
|---|---|
| **Correcta y con razón** | “Exacto”; avanza |
| **Correcta sin razón** | “¿Por qué?” |
| **Correcta por suerte** | Cambia el caso hasta que falle y vuelve a preguntar |
| **Incorrecta** | No da la respuesta: pregunta lo que **sí** sabe (“¿qué dijimos sobre `==`?”) |
| **“No sé”** | Reformula, baja un escalón o reescribe el caso con valores concretos |
| **Insegura** | “Como te salga”: pide que lo intente y lo corrige después |
| **Pregunta propia** | La responde **en el momento** (“aguanta, una pregunta”), aunque rompa el orden |

### 6.3 Reglas de la pregunta
1. **Una pregunta a la vez**.
2. Preguntar **antes** de explicar cuando se pueda.
3. **Esperar**: dejar que Luis intente antes de ayudar.
4. **No confirmar de inmediato**: un “¿estás seguro?” obliga a revisar.
5. **Cerrar con una pregunta que mide**, no con “¿entendiste?” a secas.

---

## 7. Práctica en vivo y retroalimentación

### 7.1 Cómo funciona la práctica en sesión 🟢
1. Carlos **plantea el caso** con voz (“soy paseador de perros: dos razas, edad entre 2 y 7, indumentaria…”).
2. Luis **escribe** su solución mientras Carlos mira (pantalla compartida).
3. Carlos **depura con él**: lee cada línea, pregunta, señala.
4. Se **simulan casos**: se cambian los datos de entrada (raza, edad, indumentaria) para **probar cada rama**.
5. Se **valida** y se pide **resumir/mejorar**.

### 7.2 Catálogo de correcciones (error → qué hace Carlos) 🟢

| Error | Corrección de Carlos |
|---|---|
| Usar `=` en vez de `==` | Pregunta “¿qué dijimos sobre eso?” y le hace decir la diferencia |
| Variables con espacio | “Pónmelas como si fuesen una sola” |
| Condición donde va un valor | “¿Qué te importa aquí: un valor o una condición?” → separa **datos de entrada** de **control** |
| Evaluar texto en lugar de booleano | “Trátalo como un booleano: es más sencillo que manejar texto” |
| Condiciones repetidas | “¿No sería mejor hacer uno solo?” → agrupa con paréntesis |
| Variables no pedidas | “No definas variables adicionales que no fueron solicitadas” |
| Llaves y sintaxis del `if` | Repite la estructura: instrucción → paréntesis (condición) → llaves (acciones) |
| Números fijos en bucles | Explica por qué quita el control; exige variables dinámicas |
| Índice 0 frente a 1 | Obliga a ajustar al imprimir (`i - 1`) o a empezar en 0 |
| Mezcla de idiomas / tildes | Lo marca en la revisión y vuelve a la **norma del curso** |
| Confusión de AND con OR | Regresa a la **analogía de la cocina** y repite la tabla |
| Confunde variable con condición | Pide ejecutar con valores simulados (“el caso inicial es…”) |

### 7.3 Principios de retroalimentación 🟢🟡
- **Corregir el razonamiento**, no solo el resultado.
- **Mostrar dónde** se separó lo esperado de lo obtenido.
- **No dar la solución completa**: guiar con preguntas.
- **Reconocer lo bien hecho** (“eso está bien, lo demás está bien”) y concretar lo que falta.
- **Pedir que se corrijan solos** (“revisa los errores de la consola y pon las llaves que faltan”).
- **Revisar casos**: cada rama, cada borde.
- **Reglas de estilo**: indentación, comentarios multilínea, extensión `indent-rainbow`.

### 7.4 La corrección fuera de sesión 🟢
- Luis **presenta** sus ejercicios en la sesión siguiente y **explica su solución**.
- Carlos **detecta patrones de error** (prioridades, AND/OR, idiomas, tildes, negación).
- Cuando hay un fallo conceptual (ej.: el historial como texto), se **repasa el concepto**, no solo la línea.

---

## 8. Entorno de trabajo

| Elemento | Cómo se usa | Fuente |
|---|---|---|
| **Videollamada** (Meet; a veces Discord) | Con grabación y notas automáticas; si hay retraso de audio, se cambia de medio | 🟢 |
| **Pantalla compartida** | Carlos comparte su editor; el alumno ve el efecto | 🟢 |
| **Diagrama compartido** (draw.io) | Permiso de **editor** para Luis; ahí quedan los ejercicios y su trabajo | 🟢 |
| **Repositorio compartido “mentoría”** | Material de trabajo y entrega | 🟢 |
| **Node.js** | Explicado como **intérprete** (“traductor”) para ejecutar JavaScript | 🟢 |
| **VS Code** | Editor principal; terminal integrada (`Ctrl+J`) | 🟢 |
| **Terminal** | `cd` (cambiar carpeta), `cls` (limpiar), `node archivo.js` (ejecutar) | 🟢 |
| **Edición avanzada** | Cursores múltiples, `Ctrl+D`, comentarios `//` y `/* */` | 🟢 |
| **Extensiones** | `indent-rainbow` (legibilidad) y un tema | 🟢 |
| **Editor JS en línea** | Para demostraciones rápidas (alcance de variables) | 🟢 |
| **Pestaña de red del navegador** | Para ver datos reales (objetos/arreglos) | 🟢 |
| **Archivos de práctica del alumno** | Uno de notas (`note`) y otro de ejercicios (`bases`) | 🟢 |
| **Grabación de la sesión** | El alumno la repasa varias veces | 🟢 |

**Enseñanza del entorno (sesión 2):** distingue **directorios** (carpetas) y **ficheros** (archivos); explica por qué hay que
**estar en la carpeta correcta** para ejecutar; muestra que Node **traduce**.

---

## 9. Evaluación y seguimiento del avance

### 9.1 Evaluación continua 🟢🟡
| Mecanismo | Qué mide |
|---|---|
| **Predicción antes de ejecutar** | Comprensión real del flujo |
| **Explicar su solución en sesión** | Razonamiento propio |
| **Casos propios** (2 que caigan en ramas distintas) | Autonomía y cobertura |
| **Bitácora de 6 preguntas por ejercicio** | Metacognición |
| **Revisión del *roadmap*** | Progreso global (sesión 4) |
| **Evaluación oral al final de la sesión** | Retención |

### 9.2 Criterios para avanzar 🟢
- **De los ejercicios leves a los grandes:** **7 de 8** ejercicios leves correctos **y** poder **explicar en voz alta** la tabla
  de estado de D2 o D8. *“No importa cuánto tardes.”*
- **De nivel a nivel:** se pasa cuando se **entrega el anterior con bitácora**, **no** cuando todo sale perfecto.
- **Por tema:** se **repasa** antes de avanzar si hay dudas (sesión 4).
- **Se ve cómo piensa**, no si sale perfecto (sábado por la noche del plan: ejercicio narrado en voz alta).

### 9.3 Banco de preguntas de cierre (sesión 1) 🟢
1. ¿Qué tipos de datos existen? (string, boolean, number)
2. ¿Qué sentencias de control existen? (`if`, `else if`, `else`) ¿Para qué sirven?
3. ¿Cuál es el negativo de verdadero? ¿Y falso o falso? ¿Falso o verdadero? ¿Verdadero y falso?
4. `10 == "10"` ¿verdadero o falso? ¿Y con `===`?
5. ¿Cuántas fases tiene una variable? (definición, asignación, **reasignación**)
6. ¿Una variable se puede reasignar? ¿Una constante? ¿Por qué no?
7. ¿Con qué se **compara** y con qué se **asigna**? (`==`/`===` frente a `=`)

### 9.4 Qué hace con el resultado 🟢
- **Concreta lo que falta**: “falta pensar más casos; lo demás está bien”.
- **Reafirma lo bien hecho**.
- **Ajusta la tarea siguiente** al hueco encontrado.
- **No deja avanzar** con huecos: se repasa antes.

---

## 10. Ejercicios y tareas: cómo los diseña

### 10.1 Principios 🟢
| Principio | Detalle |
|---|---|
| **Casos de la vida real** | Cine, farmacia, bodega, estacionamiento, cajero, paseo de perros, venta con edad |
| **El nivel baja la ayuda, no la dificultad** | “El nivel cambia cuánto del método te damos hecho” |
| **Con andamio → sin red** | Nivel 1: ruta paso a paso + esqueleto con huecos; Nivel 2: solo la ruta mínima; Nivel 3: ninguna, con trampas |
| **Salida exacta** | El resultado debe coincidir **carácter por carácter** |
| **Casos de borde** | Cada variante ejercita **otra rama** |
| **Solo lo enseñado** | “Todavía no uses métodos de arreglos… solo `for`” |
| **Predecir primero** | “Si programas sin haber predicho, el ejercicio no cuenta” |
| **Pistas, no soluciones** | Y antes de preguntar, aplicar el protocolo de bloqueo |
| **Solucionario privado** | “Solo para ti: no lo compartas con tu hermano”; salidas **verificadas ejecutando el código en Node** |

### 10.2 Entregables por ejercicio 🟢
1. El **código**.
2. Lo que **imprime** con los datos dados.
3. **Dos casos propios** que caigan en ramas distintas.
4. La **bitácora de 6 preguntas**.

### 10.3 Estructura de un ejercicio grande 🟢
- **Título** y contexto.
- **Datos** (variables `const`/`let`).
- **Ruta** (nivel 1) con esqueleto de huecos: `// R1. ... -> ______`.
- **Preguntas de orden** (“¿R1 va antes o después de calcular la compra? ¿Por qué?”).
- **Tabla de estado** a mano.
- **Casos propios**.

### 10.4 Estructura del solucionario (para Carlos) 🟢
Cada solución trae: **salida**, **traza** (paso a paso), **casos** de comprobación, **trampa** (el error típico) y **talón** (qué
debilidad entrena).

### 10.5 Cuaderno de práctica diaria 🟢
- **Un día, un bloque** de 4 ejercicios (60–90 minutos); **no se pasa al siguiente sin cerrar el anterior**.
- **Antes**: la ruta mínima y la predicción a mano.
- **Después**: comparar con la **salida esperada**; si no coincide, **no cambiar la salida**: buscar la **primera línea** que
  difiere y rastrear la tabla de estado.
- **Reglas del juego** (ej. arreglos): recorrer con `length`, sin números pegados; sin `push`/`pop`; datos en `const`;
  contadores en `let`; índices desde 0; variables en un solo idioma y sin tildes.
- **Bitácora del día** (3 líneas): qué me costó, un error por suposición y la línea donde lo vi, un cambio a mi método.
- **Día extra de descubrimiento** (ej. E25): una pregunta abierta para investigar.

### 10.6 Plan de un fin de semana (la Guía) 🟢

| Momento | Qué hace Luis | Resultado |
|---|---|---|
| Jueves | Lee la guía y hace D1–D8 **a mano**; ejecuta y compara | Criterio cumplido |
| Viernes | Completa **Mi método, v1** | Primer método propio |
| Sábado mañana | 3 ejercicios grandes **con la guía**, bitácora cada uno | Método v2 |
| Sábado tarde | 3 ejercicios grandes **con su método v1** | Ajustes |
| Sábado noche | 1 ejercicio **narrando en voz alta** | Se ve cómo piensa |
| Sesión | Resuelve un ejercicio en vivo explicando cada paso | Evaluación |

---

## 11. La Guía de resolución de problemas (el método central)

### 11.1 Regla madre 🟢
> **Se responde la pregunta, no el código.** Antes de contestar, pregúntate: *¿esto lo vi en el código o lo supuse?*

### 11.2 Las siete herramientas

| # | Herramienta | En una línea |
|---|---|---|
| 1 | **Lectura dirigida** | Lee la pregunta y busca solo lo que nombra; sube hasta la **primera asignación** de esa variable |
| 2 | **Tabla de estado** | Una columna por variable, una fila por línea ejecutada; **nunca borres el valor anterior** |
| 3 | **Evaluar de adentro hacia afuera** | Reemplaza valores, resuelve el paréntesis más interno, una línea por paso |
| 4 | **Descomponer antes de escribir** | Pregunta en una línea → entradas y salida → reglas numeradas → prioridad → esqueleto en comentarios → relleno de a una → prueba |
| 5 | **Predice, ejecuta, compara** | Predicción a mano antes de ejecutar; si no coincide, **primera fila** donde se separan |
| 6 | **Casos de borde** | Un caso por rama y valores límite (`>` frente a `>=`) |
| 7 | **Protocolo de bloqueo** | Qué hacer antes de pedir ayuda (ver metodo.md de la web) |

### 11.3 Reglas de oro
- **Copia, no enlace**: `b = a` copia el valor; si `a` cambia después, `b` no se entera.
- **No borrar filas** de la tabla de estado.
- Si **no puedes escribir las reglas**, no entendiste el enunciado: vuelve al paso 1.
- **Un error por suposición no enseña**: es suerte.

### 11.4 Bitácora (5 minutos por ejercicio) 🟢
1. ¿Cuánto tardé en empezar y qué hice los primeros 2 minutos?
2. ¿En qué paso me bloqueé: entender, ordenar, rastrear o probar?
3. ¿Qué hice para salir y funcionó?
4. Mi predicción contra el resultado real: ¿coincidieron? Si no, ¿en qué fila de mi tabla?
5. ¿Qué error fue por **análisis** y cuál por **suposición**?
6. Un **cambio concreto** a mi método para el próximo ejercicio.

### 11.5 “Mi método” (versión 1, 2, 3…) 🟢
Cada 3 ejercicios se reescribe, completando con palabras propias:
1. Lo primero que hago al leer un enunciado es…
2. Para no perder el rastro de los valores uso…
3. Cuando me bloqueo hago…
4. Antes de dar por buena una solución verifico…
5. De la guía hay algo que no me sirve y lo cambio por…

> Carlos lo plantea como **método propio**: *“quedarte con las herramientas, cambiarlas o descartarlas es tu decisión,
> siempre que sepas por qué”*.

---

## 12. Notas: qué se anota, quién y para qué

### 12.1 Los tipos de nota

| Nota | Quién | Contenido | Uso |
|---|---|---|---|
| **Notas automáticas de Meet** (resumen, próximos pasos, detalles con marcas de tiempo) | La herramienta | Temas, pasos por persona, minutos | **Memoria de la sesión**; Carlos las revisa (hay errores) |
| **Notas de clase de Carlos** | Carlos | Explicación concisa y directa del tema | **Materia prima** para que Claude la amplíe en la web |
| **Notas del alumno** | Luis (archivo `note`) | Lo que entendió | Repaso personal |
| **Archivo de práctica** | Luis (archivo `bases`) | Ejercicios complejos | Práctica |
| **Bitácora por ejercicio** | Luis (en la web) | 6 preguntas | Metacognición |
| **Bitácora del día** | Luis | 3 líneas | Cierre del día |
| **Diagrama compartido** | Ambos | Mapa de lo visto, ejercicios | Revisión rápida del tutor |
| **Solucionario** | Carlos | Soluciones, trampas, talón | **Privado**: no se comparte |
| **Próximos pasos** (Meet) | Ambos | Tareas asignadas por persona | Seguimiento |

### 12.2 El formato de una nota de clase de Carlos 🟢
Observado en *Funciones*, *Iteradores y métodos* y *Arrow functions*:

```
# Tema
"Qué es" en 1–3 frases, con el motivo ("¿por qué las usamos?")      ← el problema, en palabras simples
Sus denominaciones / partes                                         ← vocabulario
## Definición   (código mínimo)
## Invocación / uso (código mínimo)
## Explicación                                                       ← qué pasa realmente
## Temas relacionados y "mid level"                                  ← lo que sigue de forma natural
### Sub-tema 1 (con "// bloque de código con…" como marcador)
### Sub-tema 2 …
Instrucciones para quien amplíe: "Haz un ejemplo de cada uno y agrega una explicación concisa y directa"
```

**Rasgos de estas notas**
- **Concisas y directas**: la idea central en pocas líneas.
- **Dejan huecos a propósito**: marcadores (`// bloque de código con…`) y peticiones (“haz un ejemplo de cada uno”).
- **Delegan los ejemplos**: Carlos pone el concepto; **Claude** pone los ejemplos, los errores típicos y los ejercicios.
- **Conectan con lo anterior**: “como ves…”, “es literal una función pero…”.
- **Nombran lo coloquial**: “sin asco”, “literal”, “xd”: son tono, no contenido.
- **Dicen para qué sirve** y por qué importa (reutilización, ahorro de reescritura).

### 12.3 Flujo de notas a contenido 🔵

```
Clase del domingo ──► nota concisa de Carlos ──► Claude amplía (ejemplos, errores, 15+ ejercicios)
                                                 │       SOLO sobre lo explicado
                                                 ▼
                              validación en el panel de tutor ──► publicación ──► práctica del alumno
```

---

## 13. Gestión del ritmo y de la carga

### 13.1 Señales de que se va bien 🟡
- Luis **responde sin mirar** y con razón.
- Pide **más ejercicios** por iniciativa propia.
- Detecta **sus propios errores** al releer.
- Explica con **sus palabras** sin leer.

### 13.2 Señales de sobrecarga 🟢🟡
- Confusión repetida sobre el mismo tema.
- Frases como “la verdad no puedo”, “no entiendo tu pregunta”.
- Dudas que **no se resuelven** tras reexplicar dos veces.
- Pérdida de hilo cuando se mezclan temas.

### 13.3 Qué hace Carlos ante ello 🟢
| Situación | Acción |
|---|---|
| Hay dudas sobre lo anterior | **Repasar antes de avanzar** (acuerdo en la sesión 4) |
| Hay confusión | **Explicar paso a paso** (sesión 5) y revisar la grabación |
| Hay tema que sobra | **Cortarlo** (se omiten `while`/`do while` en profundidad) |
| El alumno quiere investigar | Que investigue **solo esa parte**, **sin salirse** de la rama |
| El ritmo no encaja | **Ajustar** el ritmo al del alumno |
| Hay muchos conceptos nuevos | **Aplazar** y avisar que se verá más adelante |

---

## 14. Relación y tono

### 14.1 Tono 🟡
- **Cercano y directo**, de hermano mayor; humor ligero y coloquial.
- **Exigente con el razonamiento**, pero **sin humillar**: ante un error pregunta, no sentencia.
- **Honesto**: dice cuándo algo es una convención o cuándo se equivocó (“ahí me había equivocado”).
- **Cálido con el avance**: reconoce lo logrado (“la mayor parte ya la tienes”).

### 14.2 Expectativas 🟡
- **Altas en método** (predecir, rastrear, justificar).
- **Flexibles en ritmo** (se ajusta a Luis).
- **Compartidas**: Luis **también edita** el diagrama y pide ejercicios.

### 14.3 Motivación 🟢
Carlos conecta el estudio con un **propósito real**: convertirse en alguien **útil**, defenderse solo, y apoyarse en la IA
**sin depender** de ella.

---

## 15. Voz y estilo (cómo suena Carlos)

### 15.1 Rasgos 🟢
| Rasgo | Ejemplo de uso |
|---|---|
| **Confirmaciones frecuentes** | “¿Está claro?”, “¿Te fijas?”, “¿Comprendes?”, “Ya.” |
| **Muletillas didácticas** | “A ver…”, “Entonces, como ves…”, “Simple y llanamente…”, “Literal…”, “Al fin y al cabo…” |
| **Pregunta + espera** | “¿Qué me va a arrojar aquí?” |
| **Reformulación** | “O sea, el nombre de la variable, ¿cuál es?” |
| **Instrucción corta** | “Hazlo.”, “Pon el valor.”, “Dime qué has hecho.” |
| **Aviso de contexto** | “Te explico después”, “Esto depende del lenguaje” |
| **Cierre con síntesis** | “Para que una condición sea verdadera, ambos valores tienen que ser verdaderos” |

### 15.2 Qué debe imitar el contenido escrito
- **Frases cortas y directas**, en segunda persona.
- **La idea central primero**, el detalle después.
- **Preguntas retóricas** que anticipen la duda (“¿por qué las usamos?”).
- **Cierres de verificación** (“¿Te fijas?”).
- **Humor ligero**, sin excesos.
- **No** copiar groserías ni muletillas vulgares: son del habla oral, no del material.

### 15.3 Banco de analogías y casos de Carlos 🟢
| Tema | Analogía o caso |
|---|---|
| Dato | Un nombre, una marca, un estado, un número de transacción |
| Variable | Un dato que **puede variar** en una gestión; **existe por y para sí misma** |
| Constante | Pi, los meses |
| Booleano | Un **interruptor** (switch): sí/no, 0/1 |
| AND / OR | La mamá: *“lava la cocina **y** los platos”* frente a *“o…”* |
| NOT | El opuesto |
| `if` | Venta de licor por edad; acompañante; identificación; **valor de respaldo** |
| Acceso | Discoteca / eventos con VIP y mayores acompañantes |
| Dinero | Descuentos por monto, cliente frecuente, cupones; préstamos (historial, ingresos, deudas) |
| `typeof` | Validar el **tipo de trámite** de una entrada para no corromper transacciones |
| `switch` | Convocatoria de fútbol por edades; tipos de cuenta (ahorros, sueldo, corriente) |
| Bucle | **Pintar cercas** según los postes |
| Bucle infinito | Transacciones bancarias que nunca terminan de depositar |
| `break` / `continue` | Búsqueda de una palabra en una colección: cortar frente a saltar la actual |
| Alcance | Una `monto` dentro de un `if` y otra afuera |
| Cadenas | “Carlos”: la **C** en la posición 0 |
| Objetos | Datos de la persona (edad, estudios, pasatiempo) |
| Anidados | Pestaña de **red** del navegador con teléfonos y correos |
| Cajero | Seis intentos; múltiplos de 3 en mantenimiento; límite diario |
| Funciones | Evaluar la **edad** de una persona sin repetir código |

---

## 16. Puntos fuertes y afinaciones sugeridas

### 16.1 Fortalezas de la metodología 🟢🟡
1. **El alumno hace**: escribir y explicar en vivo, no solo escuchar.
2. **Predicción antes de ejecución**: entrena el modelo mental.
3. **Diagnóstico real**: la Guía nace de los errores observados, no de teoría genérica.
4. **Andamio decreciente**: nivel 1 con ruta, nivel 3 sin ayuda.
5. **Casos de la vida real**: facilitan recordar.
6. **Solucionario con traza y trampa**: permite corregir **con criterio**, no solo con respuesta.
7. **Bitácora con distinción análisis/suposición**: mejora el método, no solo el resultado.
8. **Control de carga**: sabe cortar y repasar.
9. **Grabación y diagrama compartidos**: memoria de la sesión.
10. **Método propio del alumno** (versiones 1, 2, 3…).

### 16.2 Afinaciones sugeridas (para decidir, no para imponer) 🟡
| # | Observación | Sugerencia |
|---|---|---|
| 1 | Se usa **definición / declaración / asignación** con un sentido didáctico propio; en JavaScript, `let x` **declara** y `= valor` **inicializa/asigna**. Carlos ya avisó: *“aquí va a haber algo contradictorio con algunos lenguajes”* | Mantener la distinción como **recurso pedagógico** y **añadir una frase** con el término de JavaScript, para que Luis lo reconozca al leer documentación |
| 2 | El índice 0 se explica como norma *“por los valores binarios”* | Dar una explicación **corta y fiel** (el índice es la **distancia** desde el inicio) cuando Luis pregunte más |
| 3 | Sesiones largas (hasta ~1 h 50) con tramos de **ruido técnico** (audio, pantalla) | Preparar el entorno **antes** y reservar los últimos 10 min **siempre** para cierre oral y tarea |
| 4 | Las **notas automáticas** contienen errores (nombres de herramientas, términos) | Revisarlas **el mismo día** y anotar correcciones junto al video |
| 5 | La práctica en vivo mezcla **entender el enunciado** con **escribir código** | Antes de escribir, pedir **la ruta mínima** en voz alta (pregunta, entradas/salida, reglas): es lo que su propia Guía recomienda |
| 6 | Cuando Luis dice “no sé cómo escribirlo”, a veces Carlos termina **dictando** la sintaxis | Pedir antes **la regla en español** y que **él** la traduzca a código; dictar solo si pasan 2 intentos |
| 7 | La retroalimentación de la tarea llega **en la sesión siguiente** | Para ejercicios críticos, **un mensaje corto** con “primer error a revisar” antes de la sesión |
| 8 | Ejercicios largos sin **criterio de entrega** claro en las primeras sesiones | Usar siempre el **formato de entrega** de los ejercicios grandes (código + salida + 2 casos propios + bitácora) |

---

## 17. Cómo debe usar Claude este método al escribir contenido

### 17.1 Resumen operativo para Claude

```
Eres el redactor de stray. Escribes con la voz y el método de Carlos (docs/METODOLOGIA.md).
1. Parte SIEMPRE de la nota de Carlos. Respétala; no la contradigas.
2. Amplía SOLO lo explicado: más ejemplos, errores típicos, casos de borde, analogías.
3. No introduzcas temas no enseñados. Si es imprescindible un detalle de apoyo, hazlo mínimo y AVÍSALO.
4. Si algo de la nota es impreciso, enseña lo correcto y AVISA a Carlos.
5. Usa el molde de explicación (§5.1) y los cuatro compartimentos (§5.4).
6. Cada concepto: ejemplo ejecutable, error típico, pregunta rápida.
7. Ejercicios: mínimo 15, con predicción, rastreo, bordes y 2 integradores (docs/LECCIONES.md).
8. Voz: frases cortas, segunda persona, preguntas retóricas, cierres de verificación. Sin groserías.
9. Lenguaje: términos reales (en inglés cuando es el estándar); variables en español, sin tildes.
10. Nunca publiques sin `npm run validate` en cero advertencias.
```

### 17.2 Correspondencia método → web

| Elemento del método | Dónde vive en stray |
|---|---|
| Explicación con analogías | Lecciones (`content/lessons`), recuadros `[!regla]`, `[!tip]`, `[!ojo]`, `[!error]` |
| “Pregunta primero” | Preguntas rápidas (`quiz`) y ejercicios de predicción |
| Práctica en vivo con casos | Ejercicios de código con casos de prueba y “mis propios casos” |
| Dos versiones (didáctica y real) | Secciones “Primero…” y “Cómo se hace de verdad” en la lección |
| Corrección con “primera línea que difiere” | Comparación línea a línea del evaluador |
| Tabla de estado, lectura dirigida | `Método` y ejercicios de predicción |
| Bitácora de 6 preguntas | Ventana al resolver un ejercicio; sección **Bitácora** |
| “Mi método” v1, v2… | Sección **Método** (versiones guardadas) |
| Evaluación oral al cierre | Preguntas rápidas y ejercicios de opción múltiple; la oral sigue en la videollamada |
| Solucionario privado | Contenido cifrado en el bundle; solo en el panel de tutor |
| Revisión del progreso | Código de sincronización y panel de tutor |
| Roadmap | **Mapa de clases** |
| Racha, constancia | XP, rachas e insignias |

### 17.3 Lo que la web **no** reemplaza
- La **explicación del tutor** en la videollamada.
- La **evaluación oral** y la **conversación** sobre el porqué.
- La **detección de patrones** de error con el alumno presente.
- La **motivación personal** y el vínculo.

---

## 18. Plantillas

### 18.1 Guion de una sesión (para Carlos)

```
ANTES
[ ] Entorno listo (audio, pantalla, editor, grabación)
[ ] Tarea del alumno revisada de antemano (patrones de error)
[ ] 1 analogía y 1 caso real preparados para el tema de hoy
[ ] 3 preguntas de cierre listas

DURANTE
[ ] Apertura: ¿cómo va el ritmo? ¿alguna duda de lo anterior?
[ ] Revisión: el alumno presenta y explica; yo pregunto, no corrijo de entrada
[ ] Mapa: dónde estamos y qué sigue
[ ] Concepto 1: pregunta → definición → lo hace él → "dime qué has hecho" → contraste/error
[ ] Práctica viva: caso con voz, él escribe, simulamos ramas, resumimos
[ ] Cierre oral (§9.3)
[ ] Tarea: qué, cuándo, cómo se entrega

DESPUÉS
[ ] Revisar y corregir las notas automáticas
[ ] Mandar la nota concisa del tema a Claude (con huecos para ejemplos y ejercicios)
[ ] Anotar patrones de error nuevos (¿talón nuevo?)
[ ] Ajustar el ritmo de la próxima clase
```

### 18.2 Nota de clase (para pasar a Claude)

```
# <Tema>
<Qué es, en 1–3 frases. ¿Por qué lo usamos?>

## Definición
<código mínimo>

## Uso / invocación
<código mínimo>

## Explicación
<qué pasa realmente>

## Temas relacionados
### <sub-tema 1>
// bloque de código con <qué mostrar>
### <sub-tema 2>
// bloque de código con <qué mostrar>

PEDIDO A CLAUDE: ejemplos concisos de cada uno, errores típicos, 15+ ejercicios.
Solo estos temas. No te vayas a otros lados.
```

### 18.3 Retroalimentación de un ejercicio

```
✔ Lo que está bien: <1 línea concreta>
? La primera línea donde tu salida se separa de lo esperado: <línea>
→ Pregunta guía: <una sola pregunta que lo lleve al error>
✎ Para la bitácora: ¿fue análisis o suposición?
```

---

## 19. Glosario del método

| Término | Significado |
|---|---|
| **Gestión** | Cualquier tarea que se hace con un dato (en el habla de Carlos) |
| **Caso de uso / caso a simular** | Un conjunto de valores de entrada con los que se prueba una rama |
| **Control (de evaluación)** | La condición que decide por dónde pasa el programa |
| **Valor de respaldo** | El `else` o valor por defecto cuando nada más se cumple |
| **Datos quemados** | Números o textos escritos “a mano” en lugar de variables; evitarlos |
| **Talón** | Debilidad recurrente del alumno que tiene una herramienta asignada |
| **Ruta mínima** | Los 6 pasos previos a escribir código |
| **Tabla de estado** | Seguimiento fila a fila del valor de cada variable |
| **Lectura dirigida** | Leer solo lo que la pregunta nombra |
| **Error por análisis / por suposición** | El primero enseña (sabes en qué paso te equivocaste); el segundo no |
| **Andamio** | La ayuda que trae un ejercicio (ruta, esqueleto); disminuye con el nivel |
| **Mid level** | Los temas de continuación natural de un concepto (en las notas de Carlos) |
| **Bitácora** | Registro breve y reflexivo después de cada ejercicio |
| **Solucionario** | Soluciones con traza y trampa; solo para Carlos |
