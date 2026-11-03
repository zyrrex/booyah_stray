# stray — cuaderno de práctica

Web estática de aprendizaje de programación (JavaScript, lógica) para Luis Angel. Reúne las clases ya vistas, la práctica
con **evaluador de código en el navegador**, XP/niveles/insignias, racha tipo GitHub, bitácora, avatar de gato y un
**panel de tutor** oculto para ver su progreso y validar el contenido antes de publicarlo.

- Stack: **Vite + React + TypeScript** (sin servidor; se despliega como archivos estáticos).
- Editor: CodeMirror 6. Ejecución del código del alumno: Web Worker aislado con límite de 2 s (corta bucles infinitos).
- Todo el progreso vive en el `localStorage` del navegador de quien estudia.

## Empezar

```bash
npm install
npm run dev        # genera el contenido y abre http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Compila el contenido y levanta el servidor de desarrollo |
| `npm run content` | Solo compila el contenido (`content-private/` → `src/generated/bundle.json`) |
| `npm run validate` | Igual, pero **las advertencias también fallan** (úsalo antes de publicar) |
| `npm run build` | Comprobación de tipos + build de producción en `dist/` (NO recompila contenido; es lo que corre Vercel) |
| `npm run build:all` | Contenido + build (úsalo en tu PC) |
| `npm run build:app` | Igual que `build` (lo usa el workflow de GitHub) |

## Acceso (cómo funciona)

- **Alumno**: en la pantalla inicial escribe el usuario `stray`. La primera vez crea su clave (se guarda como hash
  PBKDF2 en su navegador); después solo la pide. Cualquier otro usuario dice *“Usuario no existente.”*
- **Tutor (tú)**: **no hay botón ni enlace**. Tu llave se escribe en el mismo campo de *Usuario*. Si es correcta
  abre el panel de tutor; si no, el mensaje es idéntico al de un usuario que no existe. La llave está en el archivo
  `.admin-key` (no se sube a git). Para cambiarla, borra ese archivo y corre `npm run content`.
- **Olvidó su clave**: en su pantalla de clave hay “Olvidé mi clave”. Le pides el *código de rescate* que ves en el
  panel de tutor → pestaña **Publicar**.

> ⚠️ **Sé realista con el candado**: es una web estática, no hay servidor. El acceso es una puerta cosmética para
> darle la experiencia que pediste; no es seguridad fuerte. Lo que sí está protegido de verdad:
> las **soluciones y explicaciones** van cifradas (AES-256-GCM, llave derivada con PBKDF2) con tu llave, y de las
> **respuestas esperadas** solo se publican *hashes*. Con DevTools no puede leerlas.

## Panel de tutor

1. **Progreso de stray** — él genera en *Ajustes → Código de sincronización* un texto `STRAY1-…`, te lo manda (WhatsApp),
   lo pegas y ves racha, XP, qué le cuesta, su código, sus bitácoras y su método.
2. **Validar contenido** — ejecuta *cada solución de referencia* contra *todos sus casos* en el navegador y avisa si
   algún ejercicio es imposible.
3. **Soluciones** — enunciado, solución, salidas esperadas y la explicación (“trampas”) de cada ejercicio.
4. **Publicar** — pasos y código de rescate.

## Agregar contenido nuevo (el flujo de cada domingo)

1. Dime (a Claude) qué tema viste/verás y qué ejercicios quieres. **Se escribe sin salirse de lo ya explicado.**
2. La **lección** va en `content/lessons/claseN.md` (pública). Los **ejercicios y soluciones** en
   `content-private/exercises/claseN.md` (**privado**, gitignored por defecto).
3. `npm run validate` ejecuta cada solución y comprueba los casos. Si algo no cuadra, no genera nada.
4. `npm run build:all` → carpeta `dist/`. Haz commit de `src/generated/bundle.json` y `git push`: el hosting solo construye la app, nunca el contenido.

El formato de las lecciones y de los ejercicios está en [`docs/CONTENIDO.md`](docs/CONTENIDO.md).

## Despliegue

**GitHub Pages (incluido)**: `Settings → Pages → Source: GitHub Actions`. El workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publica cada push a `main`.
Como el contenido privado no está en el repo, **el bundle ya compilado (`src/generated/bundle.json`) sí se sube**:
compila localmente (`npm run content`) y haz commit de ese archivo.

**Vercel / Netlify / Cloudflare Pages**: build command `npm run build` (o `build:app`), output `dist`. El contenido privado no existe allí; se usa el `bundle.json` commiteado.
Rutas con `#` y `base: './'`: funciona en cualquier subcarpeta.

## Respaldos importantes

- `content-private/` y `.admin-key` **no están en git**. Respáldalos (carpeta privada, USB, repo **privado**).
  Si tu repo es privado y quieres guardarlos ahí, quita esas líneas de `.gitignore`.
- Si pierdes `.admin-key`, se genera otra y hay que volver a compilar y desplegar (el acceso viejo deja de servir).
- El progreso de stray vive en su navegador: si borra los datos del sitio, lo pierde. Que genere su código de
  sincronización de vez en cuando.
