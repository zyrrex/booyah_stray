import { normAnswer, normLines, type RunError } from '@/engine/format'
import { runCode } from '@/engine/runner'
import type { PublicExercise } from '@/types'
import { sha256 } from './crypto'

export const hashLine = (id: string, t: number, i: number, line: string) => sha256(`${id}|${t}|${i}|${line}`)
export const hashAns = (qid: string, ans: string) => sha256(`${qid}|${normAnswer(ans)}`)

export interface TestResult {
  index: number
  label: string
  ok: boolean
  data: string
  out: string[]
  expected?: string[]
  expectedLen: number
  firstDiff: number
  error?: RunError
  timeout?: boolean
}

/** Corre cada caso de prueba con el codigo del alumno y compara contra los hashes de la salida esperada. */
export async function evaluateCode(ex: PublicExercise, code: string, solution?: string): Promise<TestResult[]> {
  const results: TestResult[] = []
  const tests = ex.tests ?? []
  for (let t = 0; t < tests.length; t++) {
    const test = tests[t]
    const run = await runCode(`${test.data}\n${solution ?? code}`)
    const out = normLines(run.out)
    let firstDiff = -1
    const n = Math.max(out.length, test.lineHashes.length)
    for (let i = 0; i < n && firstDiff < 0; i++) {
      if (i >= out.length || i >= test.lineHashes.length || (await hashLine(ex.id, t, i, out[i])) !== test.lineHashes[i]) firstDiff = i
    }
    results.push({
      index: t,
      label: test.label,
      ok: firstDiff < 0 && !run.error && !run.timeout,
      data: test.data,
      out,
      expected: test.show,
      expectedLen: test.lineHashes.length,
      firstDiff,
      error: run.error,
      timeout: run.timeout,
    })
  }
  return results
}

export async function checkAnswers(ex: PublicExercise, answers: Record<string, string>): Promise<Record<string, boolean>> {
  const res: Record<string, boolean> = {}
  for (const q of ex.questions ?? []) {
    const given = answers[q.id]
    if (given === undefined || given.trim() === '') {
      res[q.id] = false
      continue
    }
    res[q.id] = q.accept.includes(await hashAns(q.id, given))
  }
  return res
}
