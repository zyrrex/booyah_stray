import { useState } from 'react'
import { CodeEditor } from './CodeEditor'
import { Icon } from './Icon'
import { SqlConsole } from './SqlConsole'
import { runSqlAsync, type SqlRun } from '@/engine/sqlRunner'
import { actions } from '@/lib/store'

/** Datasets de ejemplo compartidos por las lecciones: content/sql/datasets/<nombre>.sql */
const dataFiles = import.meta.glob('/content/sql/datasets/*.sql', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
export const DATASETS: Record<string, string> = {}
for (const [path, src] of Object.entries(dataFiles)) DATASETS[path.split('/').pop()!.replace(/\.sql$/, '')] = src

/** Quita las lineas de directiva del principio: "-- @datos: nombre" (tablas de ejemplo) y "-- @error" (se espera un error). */
export function parseDirective(code: string): { body: string; dataset?: string; expectError: boolean } {
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

/**
 * Fragmento de SQL de una leccion.
 *  - ```sql         ejecutable en el simulador T-SQL (con datos de ejemplo opcionales: primera linea "-- @datos: tienda")
 *  - ```sql-static  solo lectura (lo que el simulador no ejecuta: GRANT/REVOKE, JOIN, otros motores...)
 */
export function SqlSnippet({ code, runnable = true }: { code: string; runnable?: boolean }) {
  const { body, dataset } = parseDirective(code)
  const setup = dataset ? DATASETS[dataset] : undefined
  const [value, setValue] = useState(body)
  const [res, setRes] = useState<SqlRun | null>(null)
  const [busy, setBusy] = useState(false)
  const lines = value.split('\n').length

  const run = async () => {
    setBusy(true)
    setRes(await runSqlAsync(value, { setup }))
    setBusy(false)
    actions.pulse()
  }

  return (
    <div className={`snippet sql-snippet ${runnable ? 'is-runnable' : ''}`}>
      {dataset && (
        <details className="sql-dataset">
          <summary><Icon name="database" size={14} /> Tablas de ejemplo: <strong>{dataset}</strong> {setup ? '(ver cómo se crearon)' : '(no encontrado)'}</summary>
          {setup && <CodeEditor value={setup} readOnly lang="sql" minLines={Math.min(setup.split('\n').length, 16)} gutter={false} label="Datos de ejemplo" />}
        </details>
      )}
      <CodeEditor value={value} onChange={runnable ? setValue : undefined} readOnly={!runnable} lang="sql" onRun={runnable ? run : undefined} minLines={Math.min(lines, 18)} gutter={lines > 2} label="Ejemplo de SQL" />
      {runnable && (
        <div className="snippet-bar">
          <button className="btn btn-sm btn-primary" onClick={run} disabled={busy}>
            <Icon name="play" size={14} /> Ejecutar
          </button>
          {value !== body && (
            <button className="btn btn-sm btn-ghost" onClick={() => { setValue(body); setRes(null) }}>
              <Icon name="refresh" size={14} /> Restaurar
            </button>
          )}
          <span className="snippet-hint">Simulador de T-SQL · compáralo con tu SSMS</span>
        </div>
      )}
      {!runnable && <div className="snippet-note"><Icon name="info" size={13} /> Este ejemplo se muestra tal cual: pruébalo en tu SSMS.</div>}
      {res && <SqlConsole result={res} />}
    </div>
  )
}
