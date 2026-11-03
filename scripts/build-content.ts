// Construye src/generated/bundle.json a partir de content-private/exercises/*.md
//  - ejecuta cada solucion de referencia en Node y comprueba que cumple sus casos
//  - publica solo HASHES de las salidas/respuestas esperadas (no se puede "leer" la respuesta en DevTools)
//  - sella soluciones y explicaciones con la llave admin (AES-GCM + PBKDF2)
//
// Uso:  npm run content            (build normal)
//       npm run validate           (igual, pero las advertencias tambien fallan)

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { parseExercises, fence, bullets, type RawExercise } from './lib/parse.ts'
import { runNode } from './lib/run-node.ts'
import { normLines, normAnswer, repr } from '../src/engine/format.ts'
import { sha256, sealJson } from '../src/lib/crypto.ts'
import type { PublicExercise, PublicQuestion, PublicTest, SealedPayload, GeneratedBundle } from '../src/types.ts'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'content-private', 'exercises')
const OUT = path.join(ROOT, 'src', 'generated', 'bundle.json')
const KEY_FILE = path.join(ROOT, '.admin-key')
const strict = process.argv.includes('--strict')

const errors: string[] = []
const warnings: string[] = []
const err = (id: string, m: string) => errors.push(`✖ ${id}: ${m}`)
const warn = (id: string, m: string) => warnings.push(`! ${id}: ${m}`)

// ---------- llave admin ----------
function loadKey(): { key: string; rescue: string } {
  if (fs.existsSync(KEY_FILE)) return JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'))
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const rnd = (n: number) => Array.from(crypto.randomBytes(n), (b) => alphabet[b % alphabet.length]).join('')
  const key = [rnd(4), rnd(4), rnd(4), rnd(4)].join('-')
  const rescue = rnd(8)
  fs.writeFileSync(KEY_FILE, JSON.stringify({ key, rescue }, null, 2))
  console.log(`\n🔑 Se genero tu llave admin y se guardo en .admin-key (no la subas a git):\n   ${key}\n`)
  return { key, rescue }
}

// ---------- datos de los casos ----------
function valueLiteral(v: unknown): string {
  return JSON.stringify(v)
}

function applyVary(data: string, vary: Record<string, unknown>, id: string): string {
  let out = data
  for (const [k, v] of Object.entries(vary)) {
    const re = new RegExp(`^(\\s*)(const|let|var)(\\s+${k}\\s*=\\s*).*$`, 'm')
    if (!re.test(out)) {
      err(id, `la variante cambia "${k}" pero no hay una linea "const/let ${k} = ..." en @datos (usa $append)`)
      continue
    }
    out = out.replace(re, `$1$2$3${valueLiteral(v)}`)
  }
  return out
}

const hashLine = (id: string, t: number, i: number, line: string) => sha256(`${id}|${t}|${i}|${line}`)
const hashAns = (qid: string, ans: string) => sha256(`${qid}|${normAnswer(ans)}`)

// ---------- ejercicios de codigo ----------
async function buildCode(ex: RawExercise, sealed: SealedPayload['items'][string]): Promise<Partial<PublicExercise>> {
  const s = ex.sections
  const datos = fence(s.datos) ?? ''
  const solucion = fence(s.solucion)
  if (!solucion) {
    err(ex.id, 'falta @solucion')
    return {}
  }
  let variants: Record<string, unknown>[] = []
  if (s.tests) {
    try {
      variants = JSON.parse(fence(s.tests)!)
    } catch (e) {
      err(ex.id, `@tests no es JSON valido: ${(e as Error).message}`)
    }
  }
  if (variants.length < 2) warn(ex.id, 'tiene menos de 3 casos de prueba (conviene 4 o mas, una por rama)')
  const showAll = 'mostrar' in s
  const checkMain = s.check ? normLines(fence(s.check)!.split('\n')) : undefined
  const specs = [{} as Record<string, unknown>, ...variants]

  const tests: PublicTest[] = []
  const expectedAll: string[][] = []
  const seen = new Set<string>()
  for (let t = 0; t < specs.length; t++) {
    const spec = { ...specs[t] }
    const append = spec.$append as string | undefined
    const baseData = (spec.$data as string | undefined) ?? datos
    const expect = spec.$expect as string[] | undefined
    const label = (spec.$label as string | undefined) ?? (t === 0 ? 'Caso 1 · datos del ejercicio' : `Caso ${t + 1}`)
    for (const k of Object.keys(spec)) if (k.startsWith('$')) delete spec[k]
    const prelude = applyVary(baseData, spec, ex.id) + (append ? `\n${append}` : '')
    const run = runNode(`${prelude}\n${solucion}`)
    if (run.error) {
      err(ex.id, `[${label}] la solucion falla: ${run.error.name}: ${run.error.message}`)
      continue
    }
    const lines = normLines(run.out)
    if (lines.length === 0) err(ex.id, `[${label}] la solucion no imprime nada`)
    if (expect && JSON.stringify(normLines(expect)) !== JSON.stringify(lines))
      err(ex.id, `[${label}] no coincide con $expect.\n   esperado: ${JSON.stringify(expect)}\n   obtenido: ${JSON.stringify(lines)}`)
    if (t === 0 && checkMain && JSON.stringify(checkMain) !== JSON.stringify(lines))
      err(ex.id, `el caso principal no coincide con @check.\n   esperado: ${JSON.stringify(checkMain)}\n   obtenido: ${JSON.stringify(lines)}`)
    const sig = lines.join('\n')
    seen.add(sig)
    expectedAll.push(lines)
    tests.push({
      label,
      data: prelude,
      lineHashes: await Promise.all(lines.map((l, i) => hashLine(ex.id, t, i, l))),
      ...(showAll ? { show: lines } : {}),
    })
  }
  if (tests.length > 2 && seen.size < 2) warn(ex.id, 'todos los casos producen la misma salida: no se distingue una solucion fija de una correcta')
  sealed.solution = solucion
  sealed.expected = expectedAll
  return {
    data: datos,
    starter: fence(s.starter) ?? '// 1) La pregunta en una linea:\n// 2) Entradas y salida:\n// 3) Reglas (numeradas) y cual manda sobre cual:\n// 4) Esqueleto:\n\n',
    tests,
  }
}

/** Quita el envoltorio de codigo de una expresion: `expr` o ``expr con `backticks` dentro``. */
function stripCode(s: string): string {
  const t = s.trim()
  const dbl = t.match(/^``\s*([\s\S]+?)\s*``$/)
  if (dbl) return dbl[1]
  const one = t.match(/^`([^`][\s\S]*)`$/)
  return one ? one[1] : t
}

// ---------- ejercicios de prediccion ----------
async function buildPredict(ex: RawExercise, sealed: SealedPayload['items'][string]): Promise<Partial<PublicExercise>> {
  const s = ex.sections
  const datos = fence(s.datos) ?? ''
  const codigo = fence(s.codigo)
  let codeLines: string[] | undefined
  if (codigo && !('norun' in s)) {
    const run = runNode(`${datos}\n${codigo}`)
    codeLines = run.out
    if (run.error && !('esperaerror' in s)) err(ex.id, `@codigo falla: ${run.error.name}: ${run.error.message}`)
    if (run.error && 'esperaerror' in s) codeLines = [...run.out, `${run.error.name}: ${run.error.message}`]
  }
  const questions: PublicQuestion[] = []
  const answersPlain: string[][] = []
  const items = bullets(s.preguntas)
  if (items.length === 0) err(ex.id, 'no tiene @preguntas')
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const cut = item.lastIndexOf(' => ')
    if (cut < 0) {
      err(ex.id, `pregunta ${i + 1} sin " => ": ${item}`)
      continue
    }
    let left = item.slice(0, cut).trim()
    const spec = item.slice(cut + 4).trim()
    const qid = `${ex.id}#${i}`
    let label = left
    let expr: string | undefined
    let options: string[] | undefined
    if (left.includes(' ?? ')) {
      const [l, o] = left.split(' ?? ')
      label = l.trim()
      options = o.split('|').map((x) => x.trim())
    } else if (left.includes(' :: ')) {
      const [l, e] = left.split(' :: ')
      label = l.trim()
      expr = stripCode(e)
    } else {
      expr = stripCode(left)
    }
    let type: PublicQuestion['type'] = 'text'
    let accept: string[] = []
    if (/^eval(:raw)?$/.test(spec)) {
      const r = runNode(`${datos}\n${codigo ?? ''}\n;(${expr})`)
      if (r.error) {
        err(ex.id, `pregunta ${i + 1}: no se pudo evaluar "${expr}": ${r.error.message}`)
        continue
      }
      const v = r.result
      if (typeof v === 'boolean') {
        type = 'bool'
        accept = [String(v)]
      } else if (typeof v === 'string') {
        accept = [repr(v)]
        if (spec === 'eval:raw') accept.push(v)
      } else accept = [repr(v)]
    } else if (/^out:\d+(:\d+)?$/.test(spec)) {
      const [, ns, ks] = spec.match(/^out:(\d+)(?::(\d+))?$/)!
      const n = Number(ns)
      const line = codeLines?.[n - 1]
      if (line === undefined) {
        err(ex.id, `pregunta ${i + 1}: @codigo no imprime la linea ${n}`)
        continue
      }
      // out:N:K -> el K-esimo valor (separado por espacios) de la linea N
      const val = ks ? line.split(/\s+/)[Number(ks) - 1] : line
      if (val === undefined) {
        err(ex.id, `pregunta ${i + 1}: la linea ${n} no tiene el valor ${ks}`)
        continue
      }
      accept = [val]
      if (/^(true|false)$/.test(val)) type = 'bool'
    } else if (/^bool:(true|false)$/.test(spec)) {
      type = 'bool'
      accept = [spec.slice(5)]
    } else {
      accept = spec.split(';;').map((x) => x.trim())
    }
    if (options) {
      type = 'choice'
      if (!accept.some((a) => options!.includes(a))) err(ex.id, `pregunta ${i + 1}: la respuesta no esta entre las opciones`)
    }
    answersPlain.push(accept)
    questions.push({
      id: qid,
      label,
      type,
      ...(options ? { options } : {}),
      accept: await Promise.all(accept.map((a) => hashAns(qid, a))),
    })
  }
  sealed.answers = answersPlain
  return {
    data: datos || undefined,
    code: codigo,
    runAfter: 'runafter' in s,
    norun: 'norun' in s,
    questions,
  }
}

// ---------- main ----------
async function main() {
  const files = fs.existsSync(SRC_DIR) ? fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.md')).sort() : []
  const exercises: PublicExercise[] = []
  const sealedItems: SealedPayload['items'] = {}
  const ids = new Set<string>()

  if (files.length === 0) {
    // En un servidor de build (Vercel, Netlify…) el contenido privado no existe: nunca pisar el bundle ya compilado
    console.error('✖ No hay ejercicios en content-private/exercises/*.md: no se toca src/generated/bundle.json ni .admin-key.')
    console.error('  (Si estas en un servidor de build, usa "npm run build:app"; el contenido se compila en tu PC.)')
    process.exit(1)
  }

  for (const f of files) {
    const raw = parseExercises(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'), f)
    for (const ex of raw) {
      if (ids.has(ex.id)) err(ex.id, 'id duplicado')
      ids.add(ex.id)
      if (!ex.sections.enunciado) err(ex.id, 'falta @enunciado')
      const sealed: SealedPayload['items'][string] = {}
      if (ex.sections.explicacion) sealed.explanation = ex.sections.explicacion
      const extra = ex.kind === 'code' ? await buildCode(ex, sealed) : await buildPredict(ex, sealed)
      sealedItems[ex.id] = sealed
      exercises.push({
        id: ex.id,
        clase: ex.clase,
        num: ex.num,
        title: ex.title,
        kind: ex.kind,
        level: ex.level,
        xp: ex.xp,
        tags: ex.tags,
        statement: ex.sections.enunciado ?? '',
        hints: bullets(ex.sections.pistas),
        ...extra,
      } as PublicExercise)
    }
  }

  for (const w of warnings) console.warn(w)
  if (errors.length || (strict && warnings.length)) {
    for (const e of errors) console.error(e)
    console.error(`\n✖ ${errors.length} error(es), ${warnings.length} advertencia(s). No se genero el bundle.`)
    process.exit(1)
  }

  const { key, rescue } = loadKey()
  const payload: SealedPayload = { rescueToken: rescue, items: sealedItems }
  const sealed = await sealJson(payload, key)
  const bundle: GeneratedBundle = {
    generatedAt: new Date().toISOString(),
    exercises,
    sealed,
    rescueHash: await sha256(`rescue|${rescue}`),
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(bundle))
  const nCode = exercises.filter((e) => e.kind === 'code').length
  const nTests = exercises.reduce((n, e) => n + (e.tests?.length ?? 0), 0)
  console.log(
    `✔ ${exercises.length} ejercicios (${nCode} de codigo con ${nTests} casos, ${exercises.length - nCode} de prediccion) · ${warnings.length} advertencia(s) · bundle sellado`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
