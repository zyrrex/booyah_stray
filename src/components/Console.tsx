import { friendlyError } from '@/engine/format'
import type { RunResult } from '@/engine/runner'
import { Icon } from './Icon'

export function Console({ result, running, empty = 'Aquí aparece lo que imprime tu código.' }: { result: RunResult | null; running?: boolean; empty?: string }) {
  if (running) return <div className="console is-empty">Ejecutando…</div>
  if (!result) return <div className="console is-empty">{empty}</div>
  return (
    <div className="console" role="log" aria-live="polite">
      {result.out.map((l, i) => (
        <div className="console-line" key={i}>
          <span className="console-n">{i + 1}</span>
          <span className="console-t">{l === '' ? ' ' : l}</span>
        </div>
      ))}
      {result.out.length === 0 && !result.error && !result.timeout && <div className="console-empty">Tu código no imprimió nada. Usa <code>console.log(...)</code>.</div>}
      {result.truncated && <div className="console-warn">Salida recortada: imprimiste demasiadas líneas.</div>}
      {result.timeout && (
        <div className="console-err">
          <Icon name="alert" size={16} /> Tu programa tardó demasiado y lo detuve. ¿Hay un bucle infinito? Revisa que la condición del bucle pueda volverse falsa y que el contador avance.
        </div>
      )}
      {result.error && (
        <div className="console-err">
          <Icon name="alert" size={16} />
          <span style={{ whiteSpace: 'pre-wrap' }}>{friendlyError(result.error)}</span>
        </div>
      )}
    </div>
  )
}
