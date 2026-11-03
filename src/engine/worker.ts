import { formatArgs, type RunError } from './format'

interface Ctx {
  onmessage: ((e: MessageEvent<{ code: string }>) => void) | null
  postMessage: (m: unknown) => void
}
const ctx = self as unknown as Ctx

ctx.onmessage = (e) => {
  const out: string[] = []
  let error: RunError | undefined
  let truncated = false
  const push = (...a: unknown[]) => {
    if (out.length >= 400) {
      truncated = true
      return
    }
    const line = formatArgs(a)
    out.push(...line.split('\n'))
  }
  const fakeConsole = { log: push, info: push, warn: push, error: push, debug: push }
  try {
    // "use strict": las variables sin declarar fallan en vez de crearse solas.
    new Function('console', `"use strict";\n${e.data.code}`)(fakeConsole)
  } catch (err) {
    const x = err as Error
    error = { name: x?.name ?? 'Error', message: String(x?.message ?? err) }
  }
  ctx.postMessage({ out, error, truncated })
}
