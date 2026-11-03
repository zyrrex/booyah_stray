# stray — guía para Claude

Web estática de aprendizaje de programación que Carlos (el tutor) construye para su hermano Luis Angel (usuario `stray`).
Carlos enseña por videollamada los domingos y deja ejercicios; esta web es la bitácora: lecciones, práctica con
evaluador, XP/rachas/insignias, bitácora de método y un panel de tutor.

## Regla que no se rompe

**No salirse de lo ya enseñado.** Al agregar o ampliar una lección, profundiza *solo* lo que Carlos ya explicó
(más ejemplos, errores típicos, casos de borde). Nada de temas nuevos (funciones, métodos de arreglos, clases, async…)
mientras Carlos no diga que los vio: satura al alumno. Los ejercicios también deben poder resolverse solo con lo visto.

Estado actual: 6 clases (variables/operadores → condicionales → textos/switch → ternario/bucles → alcance/while →
objetos y arreglos). Aún **no** se ven: funciones, métodos de arreglos (`push`, `map`…), `while` en profundidad,
`do while`, JSON (solo mencionado), clases, DOM.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Lecciones (públicas) | `content/lessons/*.md` |
| Ejercicios + soluciones (**privado**, gitignored) | `content-private/exercises/*.md` |
| Compilador de contenido (ejecuta soluciones, hashea, sella) | `scripts/build-content.ts` |
| Resultado (se commitea) | `src/generated/bundle.json` |
| Llave de tutor y código de rescate (**no commitear**) | `.admin-key` |
| Formato de lecciones y ejercicios | `docs/CONTENIDO.md` |
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
