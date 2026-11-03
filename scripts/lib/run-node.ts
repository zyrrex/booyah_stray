import vm from 'node:vm'
import { formatArgs, type RunError } from '../../src/engine/format.ts'

export interface NodeRun {
  out: string[]
  result?: unknown
  error?: RunError
}

/** Mismo comportamiento que el worker del navegador, pero en Node (para validar contenido). */
export function runNode(code: string): NodeRun {
  const out: string[] = []
  const push = (...a: unknown[]) => {
    out.push(...formatArgs(a).split('\n'))
  }
  const sandbox = { console: { log: push, info: push, warn: push, error: push, debug: push } }
  try {
    const result = vm.runInNewContext(`"use strict";\n${code}`, sandbox, { timeout: 2000 })
    return { out, result }
  } catch (e) {
    const x = e as Error
    return { out, error: { name: x.name, message: x.message } }
  }
}
