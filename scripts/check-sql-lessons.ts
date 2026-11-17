// Ejecuta TODOS los bloques ```sql de las lecciones del curso de SQL en el simulador.
//   npm run check:lessons            -> falla si un ejemplo da error sin haberlo declarado (primera linea "-- @error")
//   npm run check:lessons -- --show  -> ademas imprime lo que devuelve cada bloque (para revisar que el texto de la leccion es cierto)

import fs from 'node:fs'
import path from 'node:path'
import { runSql, errorHeader } from '../src/sql/index.ts'

const ROOT = process.cwd()
const show = process.argv.includes('--show')
const LESSONS = path.join(ROOT, 'content', 'lessons')
const DATASETS = path.join(ROOT, 'content', 'sql', 'datasets')

function parseDirective(code: string) {
  let body = code
  let dataset: string | undefined
  let expectError = false
  for (;;) {
    const m = body.match(/^--\s*@(datos|error):?[ \t]*([\w-]*)[ \t]*\n/)
    if (!m) break
    if (m[1] === 'datos') dataset = m[2]
    else expectError = true
    body = body.slice(m[0].length)
  }
  return { body, dataset, expectError }
}

let blocks = 0
let bad = 0
for (const f of fs.readdirSync(LESSONS).filter((x) => x.endsWith('.md')).sort()) {
  const md = fs.readFileSync(path.join(LESSONS, f), 'utf8').replace(/\r\n/g, '\n')
  if (!/^curso:\s*sql/m.test(md)) continue
  const re = /^```sql\n([\s\S]*?)\n```/gm
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(md))) {
    i++
    blocks++
    const { body, dataset, expectError } = parseDirective(m[1])
    let setup: string | undefined
    if (dataset) {
      const file = path.join(DATASETS, `${dataset}.sql`)
      if (!fs.existsSync(file)) {
        bad++
        console.error(`✖ ${f} #${i}: no existe el dataset "${dataset}"`)
        continue
      }
      setup = fs.readFileSync(file, 'utf8')
    }
    const run = runSql(body, { setup })
    const first = body.split('\n').find((l) => l.trim() && !l.trim().startsWith('--'))?.slice(0, 70) ?? ''
    if (!expectError && run.errors.length) {
      bad++
      console.error(`✖ ${f} #${i} [${first}]\n   ${run.errors.map((e) => `${e.num}: ${e.text}`).join('\n   ')}`)
    } else if (expectError && run.errors.length === 0) {
      bad++
      console.error(`✖ ${f} #${i} [${first}] se declaro -- @error pero no fallo`)
    }
    if (show) {
      console.log(`\n── ${f} #${i} [${first}]${expectError ? '  (error esperado)' : ''}`)
      for (const ev of run.events) {
        if (ev.k === 'set') console.log(ev.set.cols.map((c) => c.name || '(No column name)').join(' | ') + '\n' + ev.set.rows.map((r) => r.join(' | ')).join('\n'))
        else if (ev.k === 'error') console.log(`!! ${errorHeader(ev)}: ${ev.text}`)
        else if (!ev.text.startsWith('(')) console.log(`   ${ev.text}`)
      }
    }
  }
}
console.log(bad === 0 ? `✔ ${blocks} ejemplos SQL de las lecciones se ejecutan como se explica` : `✖ ${bad} de ${blocks} ejemplos SQL con problemas`)
process.exit(bad === 0 ? 0 : 1)
