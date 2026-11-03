# stray — guía para Claude

Web estática de aprendizaje de programación que Carlos (el tutor) construye para su hermano Luis Angel (usuario `stray`).
Carlos enseña por videollamada los domingos y deja ejercicios; esta web es la bitácora: lecciones, práctica con
evaluador, XP/rachas/insignias, bitácora de método y un panel de tutor.

> **Antes de escribir contenido nuevo, lee** `docs/PEDAGOGIA.md` y `docs/LECCIONES.md` (el estándar y su checklist).

## Regla que no se rompe

**No salirse de lo ya enseñado.** Al agregar o ampliar una lección, profundiza *solo* lo que Carlos ya explicó
(más ejemplos, errores típicos, casos de borde). Nada de temas nuevos (métodos de arreglos, clases, async…)
mientras Carlos no diga que los vio: satura al alumno. Los ejercicios también deben poder resolverse solo con lo visto.

Estado actual: 9 clases (variables/operadores → condicionales → textos/switch → ternario/bucles → alcance/while →
objetos y arreglos → **funciones** → **iteradores (`for of`, `forEach`, `for in`) y métodos en objetos** →
**arrow functions**). Aún **no** se ven: métodos de arreglos (`push`, `map`, `filter`, `reduce`…), `Object.keys`/`entries`,
`while` en profundidad, `do while`, JSON (solo mencionado), clases, `try/catch`, spread/rest, desestructuración,
DOM, async. Detalles ya enseñados: `this` dentro de métodos (clase 8), `return` y parámetros por
defecto (clase 7), notación de corchetes (clase 8).

Particularidades del evaluador para funciones: el código del alumno corre **después** de los `@datos` (y de
`$append`), así que los ejercicios de función piden definir la función **y llamarla con los datos** e imprimir; las
variantes cambian los datos. El evaluador solo compara la **salida**: no puede comprobar que se usó flecha o `function`.
Evita `this` a nivel superior (el navegador y Node difieren).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Lecciones (públicas) | `content/lessons/*.md` |
| Ejercicios + soluciones (**privado**, gitignored) | `content-private/exercises/*.md` |
| Compilador de contenido (ejecuta soluciones, hashea, sella) | `scripts/build-content.ts` |
| Resultado (se commitea) | `src/generated/bundle.json` |
| Llave de tutor y código de rescate (**no commitear**) | `.admin-key` |
| Formato de lecciones y ejercicios | `docs/CONTENIDO.md` |
| Qué es la app, arquitectura, gamificación, evolución a BD | `docs/STRAY.md` |
| Cómo se diseña una lección y su serie de ejercicios (estándar + checklist) | `docs/LECCIONES.md` |
| Criterio pedagógico, voz, método, reglas de alcance | `docs/PEDAGOGIA.md` |
| UI | `src/components`, `src/pages`, estilos en `src/styles.css` |
| Estado/progreso/XP/insignias | `src/lib/store.ts`, `src/lib/gamify.ts` |
| Acceso (alumno / tutor) | `src/lib/auth.ts`, `src/components/Gate.tsx` |
| Motor de ejecución | `src/engine/*` (Web Worker con timeout de 2 s) |

## Flujo para agregar una clase nueva

1. Escribe `content/lessons/claseN.md` (frontmatter `id: claseN`, `clase: N`). Estilo: cercano, en español, con
   fragmentos ```` ```js ```` ejecutables, `quiz`, callouts (`> [!ojo]`…) y errores típicos que Carlos mencionó.
2. Escribe `content-private/exercises/claseN.md` con ids `sN-…`. Cada ejercicio de código lleva **solución, casos
   variados con bordes y `@check`**. Si el material trae salidas esperadas (PDF), ponlas en `$expect`.
3. Actualiza `content/lessons/chuleta.md` con lo nuevo.
4. `npm run validate` (debe terminar en `✔` y 0 advertencias) → `npm run build:all` → mira el panel de tutor →
   *Validar contenido*.
5. No hagas commit/push salvo que Carlos lo pida. Si va a un repo público, `content-private/` y `.admin-key`
   **jamás** se suben.

## Convenciones de código y contenido

- Variables en español **sin tildes** en los ejercicios; textos de salida con tildes normales.
- La evaluación compara la salida **línea a línea** (se ignoran espacios al final). El enunciado debe fijar el formato
  exacto de salida. Cuida decimales de coma flotante en los casos (usa números que den exactos).
- Los datos de un caso son una sola línea `const x = …` (variantes por clave) o usa `$append` / `$data`.
- Las soluciones de referencia solo usan lo que ya se enseñó.
- Las rutas son con `#` (hash) para funcionar en cualquier hosting estático.
- Todo el texto de la interfaz está en español.

## Seguridad (honesta)

Es estática: el acceso es una puerta cosmética. Lo protegido de verdad: soluciones/explicaciones cifradas (AES-GCM) con
la llave de tutor, y respuestas esperadas solo como hashes. **Nunca** pongas soluciones ni salidas esperadas en claro en
`content/` ni en el bundle público.
