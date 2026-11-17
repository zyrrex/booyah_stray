import type { SqlRun } from '@/engine/sqlRunner'
import { errorHeader, NO_NAME } from '@/sql'
import { Icon } from './Icon'

const isNum = (k: string) => k === 'int' || k === 'dec' || k === 'float' || k === 'bit'

/** Resultados y mensajes de una ejecucion de SQL, como en SSMS: cuadriculas + mensajes en orden. */
export function SqlConsole({ result, running, empty = 'Aquí aparece el resultado de tu consulta.' }: { result: SqlRun | null; running?: boolean; empty?: string }) {
  if (running) return <div className="console is-empty">Ejecutando…</div>
  if (!result) return <div className="console is-empty">{empty}</div>
  return (
    <div className="sqlout" role="log" aria-live="polite">
      {result.events.map((ev, i) => {
        if (ev.k === 'set') {
          const s = ev.set
          return (
            <div className="sql-set" key={i}>
              <div className="table-wrap">
                <table className="sql-grid">
                  <thead>
                    <tr>
                      <th className="sql-rn" />
                      {s.cols.map((c, j) => (
                        <th key={j} className={isNum(c.t.k) ? 'is-num' : ''}>{c.name || <em>{NO_NAME}</em>}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map((r, k) => (
                      <tr key={k}>
                        <td className="sql-rn">{k + 1}</td>
                        {r.map((c, j) => (
                          <td key={j} className={`${isNum(s.cols[j].t.k) ? 'is-num' : ''} ${c === 'NULL' ? 'is-null' : ''}`}>{c}</td>
                        ))}
                      </tr>
                    ))}
                    {s.rows.length === 0 && (
                      <tr><td className="sql-rn" /><td colSpan={Math.max(1, s.cols.length)} className="is-null">(sin filas)</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
        if (ev.k === 'error') {
          return (
            <div className="sql-msg is-error" key={i}>
              <Icon name="alert" size={15} />
              <div>
                <strong>{errorHeader(ev)}</strong>
                <div>{ev.text}</div>
              </div>
            </div>
          )
        }
        return <div className="sql-msg" key={i}>{ev.text}</div>
      })}
      {result.events.length === 0 && <div className="console-empty">Tu código no produjo resultados ni mensajes.</div>}
    </div>
  )
}
