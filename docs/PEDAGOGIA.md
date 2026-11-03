# Especificación de enseñanza — stray

> **Por qué stray enseña como enseña.** Este documento fija el criterio pedagógico que debe seguir **cualquier** contenido
> (lecciones, ejercicios, chuleta, mensajes de la interfaz). Si algo del contenido contradice este documento, el contenido
> está mal.
> Complementos: [`STRAY.md`](STRAY.md) (la app) y [`LECCIONES.md`](LECCIONES.md) (cómo se escribe una clase).

---

## 1. El alumno y el contexto

| Dato | Valor |
|---|---|
| Alumno | Luis Angel (usuario `stray`), secundaria, **principiante** en programación |
| Intereses útiles para ejemplos | Videojuegos, tiendas y negocios de barrio, deportes |
| Tutor | Carlos (su hermano, desarrollador): explica por **videollamada los domingos** |
| Lenguaje | JavaScript, ejecutado en el navegador y en consola |
| Debilidades detectadas | (1) **Leer y entender** el enunciado, (2) **rastrear** valores de variables, (3) **evaluar** condiciones de adentro hacia afuera |
| Objetivo | **Dominar** (no “pasar”) los fundamentos: poder resolver un problema nuevo con método |

El tutor eligió el orden y el ritmo; **la web nunca se adelanta a él**.

---

## 2. Reglas que no se rompen

### 2.1 No salirse de lo enseñado
Se puede **profundizar** un tema visto (más ejemplos, errores típicos, casos de borde, analogías). **No** se introducen
temas que el tutor no explicó: **saturan**. Si un enunciado necesita algo nuevo, **se cambia el enunciado**.

Se permite un **detalle de apoyo** cuando el tema enseñado **no funciona sin él**, con estas condiciones:
1. Aparece **dentro** del tema (no como tema aparte), en un recuadro `[!profundiza]` o con una explicación breve.
2. Se **avisa al tutor** de que se añadió, para que lo conserve o lo quite.
3. Se limita a lo mínimo (ejemplo: `this` en métodos, `objeto[clave]` en `for in`, `return` en funciones).

> Lista de lo **aún no enseñado** (no usar): métodos de arreglos (`push`, `map`, `filter`, `reduce`…),
> `Object.keys/entries`, `do while`, JSON, clases, `try/catch`, spread/rest, desestructuración, DOM, asincronía.

### 2.2 Respetar al tutor, corregir con cuidado
Las definiciones y ejemplos del tutor se usan **tal cual** cuando son correctos. Si algo es **impreciso o incorrecto**:
se enseña la versión **correcta**, se **avisa al tutor** y se explica en una línea qué cambió. (Ejemplo real: los valores por
defecto solo se activan con `undefined`, no con `null`.)

### 2.3 Un concepto nuevo a la vez
Cada sección introduce **una sola** idea. La siguiente se apoya en la anterior. Si hay dos, se separan.

### 2.4 Dominio antes que avance
No se pasa a un tema nuevo si el actual no está **dominado** (§8). Avanzar con huecos “se paga con intereses” más adelante.

---

## 3. Principios de diseño didáctico

| Principio | Cómo se aplica en stray |
|---|---|
| **Problema primero** | Cada lección empieza mostrando **el dolor** (código repetido, datos sueltos) antes de la herramienta |
| **Predecir antes de ejecutar** | Los ejercicios de predicción bloquean “Ejecutar” hasta comprobar; la lección pide predecir antes de probar |
| **Ver y tocar** | Todo fragmento es **ejecutable y editable**: se aprende cambiando cosas |
| **Equivocarse con red** | Los errores típicos se **muestran a propósito** (con la causa) antes de que el alumno los cometa |
| **Espiral** | Lo nuevo reutiliza lo anterior (la boleta usa funciones **y** parámetros por defecto **y** arreglos de objetos) |
| **Casos de borde siempre** | Cada ejercicio prueba justo debajo / exacto / justo encima; el alumno aprende a **dudar de su primera solución** |
| **Un solo idioma y estilo** | Variables en español sin tildes; `const` para datos y `let` para contadores |
| **Metacognición** | Después de cada ejercicio, una **bitácora** de 6 preguntas (§5) |
| **Retroalimentación inmediata y específica** | Se señala **la primera línea** donde la salida se separa; no se da la respuesta |
| **Esfuerzo recompensado** | XP por método, constancia y bitácora; las pistas cuestan pero **nunca bloquean** |

---

## 4. Secuencia de una clase (del domingo a la web)

```
Domingo        Tutor explica (videollamada) ─┐
                                             ▼
Lunes          Tutor le pasa el material a Claude: notas, ejemplos, definiciones, qué ve el alumno
                                             ▼
               Claude redacta lección + ejercicios (docs/LECCIONES.md), SOLO con lo enseñado
                                             ▼
               npm run validate · revisión del tutor en el panel · build · commit · deploy
                                             ▼
Semana         Alumno: lee la lección → practica por bloques → bitácora → sube de nivel
                                             ▼
Siguiente      Tutor revisa progreso (código de sincronización) y ajusta la próxima clase
domingo
```

**Cadencia.** Una clase nueva por semana. La práctica de una clase ocupa **4–6 bloques** de 60–90 minutos.

---

## 5. El método que se enseña (y que toda la web refuerza)

La guía de resolución de problemas (`content/lessons/metodo.md`) es el **eje**: stray no enseña solo sintaxis, enseña
**cómo pensar**.

### 5.1 Ruta mínima (antes de escribir código)
1. La **pregunta** en una línea.
2. **Entradas y salida**.
3. **Reglas** numeradas y su **prioridad**.
4. **Esqueleto** en comentarios.
5. Código **de a una regla**, ejecutando cada vez.
6. **Casos de borde** y un caso por rama.

### 5.2 Las herramientas
Lectura dirigida · **tabla de estado** · evaluar de adentro hacia afuera · descomponer antes de escribir ·
**predice, ejecuta, compara** · casos de borde · **protocolo de bloqueo**.

### 5.3 La bitácora (6 preguntas, al cerrar cada ejercicio)
1. ¿Cuánto tardé en empezar y qué hice los primeros 2 minutos?
2. ¿En qué paso me bloqueé: entender, ordenar, rastrear o probar?
3. ¿Qué hice para salir y funcionó?
4. Mi predicción contra el resultado real: ¿coincidieron? Si no, ¿en qué fila de mi tabla?
5. ¿Qué error fue por **análisis** y cuál por **suposición**?
6. Un **cambio concreto** a mi método para el próximo ejercicio.

> La distinción **análisis vs. suposición** es central: el error por suposición (“creí que…”) se corrige **rastreando**,
> no estudiando más.

---

## 6. Voz y estilo del contenido

| Aspecto | Criterio |
|---|---|
| **Trato** | Tú. Cercano, sin infantilizar ni sermonear |
| **Estructura de explicación** | “Esto es X → sirve para Y → mira cómo → ojo con Z” |
| **Frases** | Cortas. Una idea por frase |
| **Definiciones** | Con las **palabras del tutor** cuando existan; luego, una analogía |
| **Analogías** | Cotidianas y concretas: licuadora (función), receta (parámetros), llave de la casa (referencia), cartel de la tienda |
| **Tecnicismos** | Se definen en la misma frase donde aparecen; el nombre técnico real **se enseña** (no se evita) |
| **Ejemplos** | Contextos que le suenen: tienda, delivery, juego, colegio, liga barrial |
| **Errores** | Se nombran **sin dramatismo**: “el error clásico”, “la trampa” |
| **Humor** | Ligero y ocasional; nunca a costa del alumno |
| **Idioma** | Español; cada palabra técnica en inglés solo si es la que verá en el código (`forEach`, `callback`) |
| **Mensajes de la interfaz** | Breves, con la pista de **qué mirar**, no el qué corregir |

---

## 7. Cómo debe sentirse la práctica

- **Sensación de progreso**: bloques cortos, barra de XP, racha visible, insignias por **hábitos** (sin muletas,
  al primer intento, bitácoras).
- **Sin humillación**: un fallo muestra **dónde** se separó, no “incorrecto” a secas; sin penalizar el error de código
  (solo en predicción, y suave).
- **Foco**: una tarea a la vez; sin popups que interrumpan la lectura; modo claro/oscuro; tipografía legible.
- **Autonomía**: puede probar **sus propios casos** (con bonificación) y reiniciar el código.
- **Honestidad**: si algo no puede comprobar la web (la forma del código), el enunciado lo dice.

### Señales de sobrecarga (el tutor las vigila)
- Bitácoras que repiten “no entendí” sobre el **mismo** tema.
- Muchos ejercicios abandonados **antes** de la primera ejecución.
- Uso de pistas > 50 % en un bloque entero.
- Rachas que se cortan justo en una clase nueva.

**Respuesta:** frenar contenido nuevo, **reforzar** el tema (ejercicios con sus propios errores) y simplificar.

---

## 8. Dominio: cuándo se pasa de tema

Un tema se da por **dominado** cuando el alumno, **sin ayuda**:

1. **Predice** correctamente la salida de un código del tema (ejercicio de predicción al primer o segundo intento).
2. **Resuelve** un ejercicio de código del tema **sin pistas**.
3. **Explica** con sus palabras qué hace y cuándo usarlo (en la clase del domingo, al tutor).
4. **Encuentra** el error de un código roto del tema.
5. **Lo usa** dentro de un ejercicio de **otra** clase (transferencia).

Indicadores en la web: ejercicios “resuelto sin pistas”, “al primer intento”, bitácoras coherentes y la insignia de la clase.

---

## 9. Qué se enseña en cada etapa (criterio de profundidad)

| Etapa | Qué se busca | Qué se evita todavía |
|---|---|---|
| **Fundamentos (clases 1–3)** | Modelo mental de variables, tipos y condiciones; **leer** código | Abstracciones |
| **Control de flujo (4–5)** | Bucles, rastreo con tabla de estado, alcance | Optimización |
| **Datos (6)** | Estructuras para modelar cosas reales (objetos, arreglos) | Métodos de colecciones |
| **Abstracción (7–9)** | Funciones y callbacks para **no repetirse**; iteradores | Programación funcional avanzada |

> Las **siguientes** etapas (métodos de arreglos, asincronía, DOM, clases) **no existen** hasta que el tutor las enseñe.

---

## 10. Decisiones didácticas ya tomadas (para no re-discutirlas)

| Decisión | Motivo |
|---|---|
| Se muestra la salida esperada (`@mostrar`) en la mayoría de ejercicios de código | El cuaderno original ya la traía y orienta a quien se bloquea |
| Las pistas cuestan 10 % del XP (máx. 50 %) y **no bloquean** | Pedir ayuda no debe castigarse hasta el punto de evitarla |
| La predicción baja XP con los intentos; el código no | Predecir es adivinar menos; en código se aprende iterando |
| El evaluador compara **línea a línea** con la salida exacta | Entrena precisión y lectura del enunciado |
| `console.log` y `return` se enseñan **separados y contrastados** | Es la confusión más frecuente con funciones |
| `for` clásico se mantiene aunque existan iteradores | Controlar el índice sigue siendo necesario |
| Flechas y `function` se enseñan **como equivalentes con diferencias**, no como “mejor/peor” | En código real se mezclan |

---

## 11. Qué hacer ante dudas

1. **Si el tutor no ha dicho que lo vio**, no está visto.
2. **Si algo es impreciso**, se enseña lo correcto y se avisa.
3. **Si un detalle de apoyo es inevitable**, se incluye mínimo y se avisa (§2.1).
4. **Si hay que elegir entre completo y claro**, gana **claro**.
5. **Si un ejercicio puede tener dos lecturas**, el enunciado está mal: se reescribe.
