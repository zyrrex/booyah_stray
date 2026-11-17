import { runSql, type SqlOptions } from '@/sql'
import type { SqlRun } from '@/sql'

export type { SqlRun } from '@/sql'

/** Ejecuta SQL en el simulador (sincrono y rapido); se cede el turno al navegador para que pinte "Ejecutando…". */
export function runSqlAsync(code: string, opts: SqlOptions = {}): Promise<SqlRun> {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        resolve(runSql(code, opts))
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        resolve({ events: [{ k: 'error', num: 0, level: 16, state: 1, line: 0, text: `Error interno del simulador: ${msg}` }], sets: [], errors: [{ num: 0, text: msg }], lines: ['Error 0'], ordered: [] })
      }
    }, 0)
  })
}
