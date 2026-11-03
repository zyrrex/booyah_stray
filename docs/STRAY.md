# stray — especificación de la app

> Documento de referencia: **qué es stray, cómo está armado, cómo se distribuye el aprendizaje y hacia dónde va.**
> Para el formato de los archivos de contenido ver [`CONTENIDO.md`](CONTENIDO.md); para cómo se escribe una lección y sus
> ejercicios, [`LECCIONES.md`](LECCIONES.md); para la filosofía de enseñanza, [`PEDAGOGIA.md`](PEDAGOGIA.md).

---

## 1. Qué es

**stray** es una **bitácora de aprendizaje de programación** (JavaScript y lógica) para **Luis Angel** (usuario `stray`),
construida por su hermano **Carlos** (el tutor), que le enseña por videollamada **los domingos**. La web **no reemplaza**
la clase: es el lugar donde lo visto se **ordena, se practica hasta dominarlo y se registra**.

| Rol | Quién | Qué hace |
|---|---|---|
| **Alumno** | Luis Angel (`stray`) | Lee la lección, practica, escribe su bitácora, sube de nivel |
| **Tutor** | Carlos | Define qué se enseña, valida contenido, ve el progreso de stray |
| **Redactor** | Claude | Expande cada tema visto en lección + ejercicios, siempre **dentro** de lo enseñado |

**Problema que resuelve.** El alumno entiende en la clase, pero sin práctica estructurada lo pierde; y tiene tres
debilidades concretas (leer y entender el enunciado, rastrear variables, evaluar condiciones). stray convierte cada
domingo en **material repasable con retroalimentación inmediata**, sin saturarlo con temas que aún no ve.

**Qué NO es:** no es un curso abierto, no enseña por adelantado, no es una plataforma multiusuario (hoy) ni un sustituto
del tutor.

---

## 2. Principios de producto

1. **Contenido manda.** UX y UI sirven al contenido: nada decorativo que distraiga del ejercicio.
2. **Cuaderno limpio, juego motivador.** Base sobria para concentrarse (papel, líneas, margen) + capa RPG
   (XP, niveles, insignias, racha) + identidad “gato callejero” (avatar, tipografía, tarjetas).
3. **Solo lo enseñado.** Nunca se publica un tema que el tutor no haya explicado (ver [`PEDAGOGIA.md`](PEDAGOGIA.md)).
4. **Predecir antes de ejecutar.** La web entrena el razonamiento, no solo el “que funcione”.
5. **Honestidad técnica.** Las soluciones están cifradas; el candado de acceso es cosmético y así se documenta (§9).
6. **Estático y portable.** Hoy se despliega como archivos estáticos en cualquier hosting; el backend propio es una
   evolución planificada (§11), no un requisito.
7. **Todo en español**, un solo idioma por pantalla.

---

## 3. Qué hace (funcionalidades)

| Área | Detalle |
|---|---|
| **Acceso** | Pantalla sin pistas visibles. Solo existe el usuario `stray`; cualquier otro dice “Usuario no existente”. La primera vez crea su clave. Entrada del tutor oculta (§9) |
| **Inicio** | Resumen: racha, XP, nivel, siguiente misión recomendada, actividad reciente |
| **Clases (mapa)** | Una “misión” por clase, en orden, con progreso de lección y de práctica |
| **Clase** | **Lección** (con fragmentos ejecutables y preguntas rápidas) + **Práctica** (lista de ejercicios) |
| **Ejercicio de código** | Editor, datos visibles, casos de prueba, comparación **línea a línea**, “mis propios casos”, pistas, ruta mínima |
| **Ejercicio de predicción** | Preguntas con respuesta (texto, verdadero/falso, opción múltiple); “ejecutar y comparar” se desbloquea tras comprobar |
| **Método** | Guía de resolución de problemas (lectura dirigida, tabla de estado, descomponer, casos de borde, bloqueo) |
| **Chuleta** | Todo lo visto en una página, para consultar |
| **Bitácora** | Línea de tiempo con sus entradas por ejercicio y su historial del método |
| **Logros** | Insignias y estadísticas |
| **Perfil** | Constructor de avatar de gato |
| **Ajustes** | Código de sincronización, cambio de clave, borrar datos, tema claro/oscuro |
| **Panel de tutor** | Progreso de stray, validar contenido, ver soluciones, publicar (§8) |

---

## 4. Arquitectura

### 4.1 Stack
- **Vite + React + TypeScript** (SPA), rutas con `#` y `base: './'` → funciona en cualquier carpeta o hosting estático.
- **CodeMirror 6** como editor.
- **Web Worker** para ejecutar el código del alumno (límite de 2 s; corta bucles infinitos; `"use strict"`).
- **WebCrypto** para hashes (SHA-256), derivación de clave (PBKDF2) y cifrado (AES-256-GCM).
- **Markdown** (`react-markdown` + GFM) para lecciones, con bloques especiales (`js`, `js-static`, `quiz`, callouts).

### 4.2 Estructura de carpetas

| Ruta | Contenido |
|---|---|
| `content/lessons/*.md` | Lecciones (**públicas**) |
| `content-private/exercises/*.md` | Ejercicios + soluciones + explicaciones (**privado**, no va a git) |
| `scripts/build-content.ts` | Compilador: ejecuta soluciones, verifica, hashea y sella |
| `src/generated/bundle.json` | Resultado público (**sí se commitea**: los servidores de build no ven lo privado) |
| `.admin-key` | Llave de tutor y código de rescate (**no se commitea**) |
| `src/engine` | Worker, runner y formato de salida (compartido con Node para validar) |
| `src/lib` | Contenido, auth, store, gamificación, sync, criptografía, evaluación |
| `src/components`, `src/pages` | Interfaz |
| `docs/` | Esta documentación |

### 4.3 Flujo de contenido

```
content/lessons/*.md ───────────────────────────────┐ (público)
content-private/exercises/*.md                       │
        │  npm run validate / npm run content        │
        ▼                                            ▼
 scripts/build-content.ts                      src/lib/content.ts
  · ejecuta cada solución en Node                     ▲
  · verifica @check / $expect / casos                 │
  · hashea salidas esperadas y respuestas             │
  · sella (AES-GCM) soluciones, explicaciones,        │
    salidas esperadas y código de rescate             │
        ▼                                             │
 src/generated/bundle.json ───────────────────────────┘
        │  npm run build (solo la app)
        ▼
      dist/  → hosting estático
```

**Regla del hosting:** el servidor de build ejecuta **solo** `npm run build` (compila la app). El contenido se compila
**en el PC del tutor** y se sube `bundle.json` ya hecho.

### 4.4 Evaluación

- **Código:** se ejecuta `datos + código del alumno` en el Worker por cada caso; la salida se normaliza y se compara
  **línea a línea** con **hashes** (nunca con el texto esperado). Detecta timeout y errores con mensajes amigables.
- **Predicción:** cada respuesta se normaliza y se compara con la lista de **hashes aceptados**. El alumno solo recibe
  “correcta/incorrecta” por fila.
- **Qué NO puede comprobar:** la **forma** del código (si usó flecha o `function`, un `for` u otro bucle). Solo la salida.
  Esto está documentado en cada enunciado que lo requiere.

### 4.5 Progreso y datos del alumno

Todo vive en `localStorage` del navegador de stray: sesión, intentos, pistas, borradores, bitácoras, avatar, actividad por
día. **Consecuencias:** si borra los datos del sitio, pierde el progreso; el tutor solo lo ve cuando el alumno le manda su
**código de sincronización** (`STRAY1-…`: progreso completo en gzip + base64url) y lo pega en el panel.

---

## 5. Gamificación (reglas exactas)

| Mecánica | Regla |
|---|---|
| **XP por ejercicio** | `xp_base` del ejercicio (tabla en [`LECCIONES.md`](LECCIONES.md)) × penalización por pistas × penalización por intentos; mínimo 5 |
| **Pistas** | Cada pista resta **10 %** del XP (máximo **50 %**) |
| **Intentos (solo predicción)** | 1.er intento 100 %, 2.º–3.º 70 %, 4.º o más 50 % |
| **Casos propios** | +8 XP por caso propio probado (máx. 2 por ejercicio) |
| **Bitácora** | +15 XP al llenar la bitácora de un ejercicio |
| **Lección** | +5 XP por sección leída; +10 XP por pregunta rápida acertada (una vez) |
| **Nivel** | `nivel = floor(√(xp / 50)) + 1`; XP para el nivel *n* = `50·(n−1)²` |
| **Títulos** | Gatito callejero → … → Leyenda stray (10 títulos) |
| **Racha** | Días consecutivos con alguna acción de estudio; se muestra como mapa de calor tipo GitHub |
| **Insignias** | ~20 generales (primer maullido, cazador 5/15/40, rachas 3/7/14, sin pistas, al primer intento, detective, diario, método v1/v2, probador, mente despierta, estilo, nivel 5) **+ una “Misión N cumplida” por clase** |

**Intención:** premiar **constancia y método**, no velocidad. Las pistas cuestan, pero **nunca bloquean**.

---

## 6. Cómo se distribuye el aprendizaje

### 6.1 Mapa de clases (estado actual)

| Clase | Tema | Se apoya en | Ejercicios |
|---|---|---|---|
| 1 | Datos, variables y operadores | — | 8 |
| 2 | Condicionales y entorno de trabajo | 1 | 12 |
| 3 | Textos, template literals, `typeof`, `switch` | 1–2 | 9 |
| 4 | Ternario y bucles (`for`) | 1–3 | 12 |
| 5 | Alcance, `while` y trabajo con textos | 1–4 | 24 |
| 6 | Objetos y arreglos | 1–5 | 25 |
| 7 | Funciones (parámetros, valores por defecto, `return`, ámbito) | 1–6 | 18 |
| 8 | Iteradores (`for of`, `forEach`, `for in`) y métodos en objetos (`this`) | 1–7 | 17 |
| 9 | Arrow functions | 7–8 | 16 |
| | **Total** | | **141** |

Más dos **misiones secundarias** (no numeradas): **Método** (guía de resolución de problemas) y **Chuleta**.

### 6.2 Lo que aún **no** se ha enseñado (no debe aparecer)
Métodos de arreglos (`push`, `map`, `filter`, `reduce`…), `Object.keys/entries`, `do while`, JSON (solo mencionado),
clases, `try/catch`, spread/rest, desestructuración, DOM, asincronía.

### 6.3 Ritmo
Una clase por domingo; la práctica se trabaja **por bloques (“días”) de 60–90 minutos**. No se pasa al bloque siguiente
sin cerrar el anterior. Detalle en [`PEDAGOGIA.md`](PEDAGOGIA.md).

### 6.4 Ejercicios que **siempre** lleva cada clase
Resumen (la especificación completa está en [`LECCIONES.md`](LECCIONES.md)):

- **Mínimo 15 ejercicios**, con al menos **30 % de predicción/rastreo**.
- Al menos: **predicción**, **código de calentamiento**, **código con bordes**, **depuración/corrección**, **repaso de
  clases anteriores** y **2 integradores** (nivel 3).
- Cada ejercicio de código con **≥ 3 casos de prueba** (principal + variantes con bordes) y salida fijada al carácter.

---

## 7. Despliegue

| Opción | Cómo |
|---|---|
| **Vercel / Netlify / Cloudflare Pages** | Build: `npm run build` · salida: `dist` |
| **GitHub Pages** | Workflow incluido (`.github/workflows/deploy.yml`, usa `npm run build:app`) |

**Flujo de publicación (cada domingo):** escribir contenido → `npm run validate` (0 advertencias) →
`npm run build:all` → revisar en el panel de tutor → **commitear también `src/generated/bundle.json`** → `git push`.

**Respaldos:** `content-private/` y `.admin-key` no están en git. Hay que respaldarlos fuera.

---

## 8. Panel de tutor

Se entra escribiendo la **llave de tutor** en el campo *Usuario* de la pantalla inicial (sin botón visible; si es
incorrecta, el mensaje es idéntico al de un usuario inexistente). Modo **sandbox**: nada de lo que se haga se guarda.

| Pestaña | Función |
|---|---|
| **Progreso de stray** | Pega el código de sincronización: racha, XP, qué le cuesta, su código, sus bitácoras |
| **Validar contenido** | Ejecuta **todas** las soluciones contra **todos** los casos en el navegador (si falla, el alumno vería un ejercicio imposible) |
| **Soluciones** | Enunciado, solución, salidas esperadas y explicación de cada ejercicio |
| **Publicar** | Pasos y código de rescate |

---

## 9. Seguridad: qué protege y qué no

| Elemento | Realidad |
|---|---|
| Acceso con usuario `stray` y clave | **Cosmético**: es una web estática; no hay servidor que lo imponga |
| Soluciones y explicaciones | **Cifradas** (AES-256-GCM, clave derivada con PBKDF2-250k de la llave de tutor): no se leen con DevTools |
| Respuestas esperadas | Solo **hashes** |
| Pistas y enunciados | **Públicos** (están en el bundle) |
| Clave del alumno | Hash PBKDF2 en su navegador; recuperable con el código de rescate |

> **Regla:** nunca poner soluciones, salidas esperadas ni la llave de tutor en claro en `content/` ni en el bundle.

---

## 10. Límites conocidos

1. El progreso es **local** (un navegador, un dispositivo) y el tutor lo ve solo por código manual.
2. El candado de acceso no es seguridad real.
3. Todo el contenido viaja en un bundle estático (≈ 400 KB+): crece con cada clase.
4. No hay multiusuario, ni notificaciones, ni análisis de lo que más le cuesta a lo largo del tiempo.
5. El evaluador no verifica **forma** de código, solo salida.

---

## 11. Evolución: backend propio (decisión tomada)

### 11.1 Motivación
Reducir lo estático, tener progreso **sincronizado entre dispositivos**, que el tutor lo vea **en vivo** y proteger las
soluciones **de verdad** (en el servidor) en lugar de solo cifrarlas. Además, que stray sea **una app más** de un entorno
propio donde conviven otras apps (personales y públicas) con un **costo fijo y control total**.

### 11.2 Decisión: **servidor propio (VPS) con bases de datos y APIs administradas por el tutor**

Se evaluaron Firebase y Supabase (servicios administrados) y se **descartaron** por una razón de modelo, no técnica:
cobran **por proyecto/uso** (en Supabase, ~25 USD/mes por organización + ~10 USD por cada proyecto extra), y el objetivo
es alojar **muchas** apps con un precio base fijo y sin límites de almacenamiento ni de tecnología.

| Criterio | Backend propio (VPS) |
|---|---|
| Costo | Fijo (≈ 20 €/mes por un servidor de 2 CPU / 4 GB / 80 GB); se escala subiendo memoria o disco |
| Libertad | Cualquier lenguaje, varias bases de datos, subdominios, procesos largos |
| Todo en un lugar | Apps personales, de aprendizaje y públicas en el mismo entorno |
| Responsabilidad | **Del tutor**: copias de seguridad, actualizaciones, seguridad, monitoreo (ver §11.5) |
| Punto débil | Un solo servidor es un **único punto de falla** |

> La decisión se revisa si una app pública exige alta disponibilidad (más de un servidor) o si el mantenimiento empieza a
> quitar tiempo al contenido.

### 11.3 Arquitectura objetivo

```
Internet ──► Cloudflare (DNS + TLS opcional)
                │
                ▼
        VPS (Docker)
        ├─ Proxy inverso (Caddy/Traefik): subdominios + HTTPS automático
        │     ├─ stray.<dominio>        → sitio estático (o Vercel)
        │     ├─ api.<dominio>/stray    → API de stray
        │     └─ <otras apps>…
        ├─ APIs (una por app o una compartida): TypeScript u otro lenguaje
        ├─ PostgreSQL (una instancia; **una base y un usuario por app**)
        ├─ Servicios de apoyo: monitoreo (p. ej. Uptime Kuma), respaldos
        └─ Acceso privado (administración y bases de datos): Tailscale — Postgres **no** se expone a internet
```

### 11.4 Qué reemplaza cada pieza (stray en servidor propio)

| Necesidad | Solución |
|---|---|
| Usuarios y sesiones | **Librería de autenticación probada** (no inventar la propia): hash de claves con Argon2, sesión por cookie `HttpOnly`. Roles `alumno` y `tutor` |
| Reglas de acceso | La **API** decide: el alumno solo ve lo suyo; el tutor ve todo |
| Soluciones y explicaciones | Tablas que **solo la API** entrega al rol `tutor`; el alumno nunca las recibe |
| Corrección de respuestas | Puede pasar al servidor (comparar contra la salida esperada guardada allí) |
| Contenido | Tablas `lessons` y `exercises`; `npm run content` sube a la base en lugar de generar el bundle |
| Migraciones | Archivos versionados en el repo (herramienta a elegir: Drizzle, Prisma, dbmate…) |

**Modelo de datos (conceptual):** `users`, `lessons`, `exercises`, `exercise_secrets` (solo tutor), `attempts`, `progress`,
`bitacora_entries`, `activity_days`.

### 11.5 Operación (obligaciones del servidor propio)

| Tema | Mínimo exigible |
|---|---|
| **Copias de seguridad** | Volcado diario de cada base a un **almacenamiento externo** (S3 compatible); prueba de restauración periódica |
| **Acceso** | Solo llaves SSH; sin contraseña; firewall cerrado salvo 80/443 y Tailscale |
| **Bases de datos** | Sin puerto público; un usuario con permisos mínimos por app |
| **Actualizaciones** | Parches de seguridad automáticos del sistema; imágenes de Docker revisadas |
| **Secretos** | Variables en el servidor; **nunca** en git |
| **Monitoreo** | Uptime Kuma (disponibilidad) + uso de CPU, RAM y disco con alertas |
| **Aislamiento** | Contenedor, red y base de datos separados por app: un fallo público no debe tocar los datos personales |

### 11.6 Fases (cada una deja la app funcionando)

| Fase | Entrega | Riesgo |
|---|---|---|
| **0 (hoy)** | Estático en Vercel, progreso local | — |
| **A (previa al servidor)** | Entorno de pruebas en la **laptop** con Docker + Tailscale: Postgres, API de prueba y subdominios. Todo en `docker-compose` para mudarlo sin cambios | Bajo |
| **B** | **Servidor contratado** (mediados de noviembre): mudar el `docker-compose`, restaurar respaldos, dominio y HTTPS | Bajo |
| **C** | **Auth + progreso sincronizado**: el alumno sigue entrando con “usuario + clave”; localStorage pasa a ser **caché**; el tutor ve el progreso en vivo | Medio |
| **D** | **Contenido en base de datos** y soluciones solo en servidor | Medio |
| **E** | Estadísticas del tutor y recordatorios | Bajo |

**Reglas de la evolución:** stray **no depende** de la laptop ni del servidor hasta la fase C; la app debe **seguir
funcionando sin conexión** con lo ya cacheado; el servidor nunca guarda secretos en el repositorio.

---

## 12. Glosario

| Término | Significado |
|---|---|
| **Misión** | Una clase en el mapa |
| **Día / bloque** | Subconjunto de la práctica de una clase (60–90 min) |
| **Ruta mínima** | Los 6 pasos previos a programar (pregunta, entradas/salida, reglas, esqueleto…) |
| **Tabla de estado** | Seguir el valor de cada variable fila por fila |
| **Bundle** | `src/generated/bundle.json`, el contenido compilado y sellado |
| **Sandbox del tutor** | Modo en que nada se guarda |
| **Código de sincronización** | `STRAY1-…`, el progreso del alumno en texto |
