// Punto de entrada del simulador T-SQL: ejecuta un script y devuelve resultados, mensajes y las "lineas comparables".

import { Server } from './engine'
import type { ResultSet, SqlEvent, SqlRun } from './types'

export type { ResultSet, SqlEvent, SqlRun } from './types'

export const NO_NAME = '(No column name)'

/** Lineas de un conjunto de resultados: encabezado + filas (ordenadas si la consulta no tenia ORDER BY). */
export function setLines(set: ResultSet, ordered: boolean): string[] {
  const head = set.cols.map((c) => c.name || NO_NAME).join(' | ')
  let rows = set.rows.map((r) => r.join(' | '))
  if (!ordered) rows = [...rows].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  return [head, ...rows]
}

export function errorHeader(ev: Extract<SqlEvent, { k: 'error' }>): string {
  return `Msg ${ev.num}, Level ${ev.level}, State ${ev.state}, Line ${ev.line}`
}

export interface SqlOptions {
  /** script que prepara las tablas (no aparece en los resultados) */
  setup?: string
  /** script de comprobacion que se ejecuta despues del codigo del alumno (sus resultados SI cuentan) */
  post?: string
  /** banderas "ordered" con las que comparar (las de la solucion de referencia) */
  ordered?: boolean[]
}

/** Ejecuta `code` en un servidor nuevo (con `setup` ya aplicado) y arma las lineas comparables. */
export function runSql(code: string, opts: SqlOptions = {}): SqlRun {
  const srv = new Server()
  const pre: SqlEvent[] = []
  if (opts.setup) {
    srv.exec(opts.setup)
    for (const ev of srv.events) if (ev.k === 'error') pre.push({ ...ev, text: `[datos del ejercicio] ${ev.text}` })
    srv.events = []
  }
  srv.exec(code)
  if (opts.post) srv.exec(opts.post)
  const events = [...pre, ...srv.events]
  const sets: ResultSet[] = []
  const errors: { num: number; text: string }[] = []
  const lines: string[] = []
  const ordered: boolean[] = []
  for (const ev of events) {
    if (ev.k === 'set') {
      const flag = opts.ordered?.[sets.length] ?? ev.set.ordered
      sets.push(ev.set)
      ordered.push(ev.set.ordered)
      lines.push(...setLines(ev.set, flag))
    } else if (ev.k === 'error') {
      errors.push({ num: ev.num, text: ev.text })
      lines.push(`Error ${ev.num}`)
    }
  }
  return { events, sets, errors, lines, ordered }
}
