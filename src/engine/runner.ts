import type { RunError } from './format'

export interface RunResult {
  out: string[]
  error?: RunError
  timeout?: boolean
  truncated?: boolean
}

/** Ejecuta codigo del alumno en un Worker aislado. Si tarda demasiado (bucle infinito) lo termina. */
export function runCode(code: string, timeoutMs = 2000): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({ out: [], timeout: true })
    }, timeoutMs)
    worker.onmessage = (e: MessageEvent<RunResult>) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = (ev) => {
      clearTimeout(timer)
      worker.terminate()
      resolve({ out: [], error: { name: 'Error', message: ev.message || 'Error al ejecutar' } })
    }
    worker.postMessage({ code })
  })
}
