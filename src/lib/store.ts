import { useSyncExternalStore } from 'react'
import type { AvatarConfig, BitacoraEntry, ExerciseProgress, Progress } from '@/types'
import { exerciseById } from './content'
import { BADGES, dayKey, levelFor, stats } from './gamify'
import { toast } from './toast'

const KEY = 'stray:v1:progress'

export const DEFAULT_AVATAR: AvatarConfig = {
  fur: '#ff8a3d',
  pattern: 'stripes',
  ears: 'pointy',
  eyes: 'round',
  eyeColor: '#2dd4bf',
  accessory: 'none',
  bg: '#ffe9d1',
}

export const defaultProgress = (): Progress => ({
  version: 1,
  createdAt: Date.now(),
  avatar: DEFAULT_AVATAR,
  xp: 0,
  activity: {},
  exercises: {},
  lessons: {},
  journal: [],
  method: [],
  badges: {},
  settings: { theme: 'auto', reduceMotion: false },
})

function normalize(p: Partial<Progress>): Progress {
  const d = defaultProgress()
  return {
    ...d,
    ...p,
    avatar: { ...d.avatar, ...p.avatar },
    settings: { ...d.settings, ...p.settings },
    version: 1,
  }
}

let persist = true
let state: Progress = load()
const subs = new Set<() => void>()

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return normalize(JSON.parse(raw))
  } catch {
    /* sin almacenamiento: seguimos en memoria */
  }
  return defaultProgress()
}

function commit(next: Progress) {
  state = next
  if (persist) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* cuota o modo privado */
    }
  }
  subs.forEach((s) => s())
}

export const getProgress = () => state
export const useProgress = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => state,
  )

/** Modo tutor: el progreso se usa en memoria y no toca el almacenamiento del alumno. */
export function enterSandbox() {
  persist = false
  commit(defaultProgress())
}

// ---------- helpers internos ----------
const uid = () => Math.random().toString(36).slice(2, 10)

function day(d: Progress) {
  const k = dayKey()
  return (d.activity[k] ??= { xp: 0, actions: 0 })
}

function award(d: Progress, amount: number, why: string) {
  if (amount <= 0) return
  d.xp += amount
  day(d).xp += amount
  toast({ kind: 'xp', text: `+${amount} XP`, sub: why })
}

function touch(d: Progress) {
  day(d).actions++
}

function ex(d: Progress, id: string): ExerciseProgress {
  return (d.exercises[id] ??= { status: 'idle', attempts: 0, runs: 0, hints: 0, ownCases: 0 })
}

function log(d: Progress, text: string, kind: 'nota' | 'sistema' | 'bitacora' = 'sistema', exerciseId?: string) {
  d.journal.push({ id: uid(), ts: Date.now(), kind, text, exerciseId })
  if (d.journal.length > 600) d.journal.splice(0, d.journal.length - 600)
}

function checkBadges(d: Progress) {
  const s = stats(d)
  for (const b of BADGES) {
    if (d.badges[b.id]) continue
    if (b.test(d, s)) {
      d.badges[b.id] = Date.now()
      toast({ kind: 'badge', text: `Insignia: ${b.name}`, sub: b.xp ? `+${b.xp} XP` : b.desc })
      if (b.xp) {
        d.xp += b.xp
        day(d).xp += b.xp
      }
    }
  }
}

function mutate(fn: (d: Progress) => void) {
  const before = levelFor(state.xp)
  const next = structuredClone(state)
  fn(next)
  checkBadges(next)
  const after = levelFor(next.xp)
  if (after > before) toast({ kind: 'level', text: `¡Subiste al nivel ${after}!`, sub: 'Sigue así, gato.' }, 5000)
  commit(next)
}

// ---------- acciones ----------
export const actions = {
  /** Cuenta una accion de estudio (mantiene la racha) sin dar XP. */
  pulse() {
    mutate((d) => touch(d))
  },

  /** Guarda lo que escribe (sin contar como actividad). */
  saveDraft(id: string, patch: { code?: string; data?: string; answers?: Record<string, string> }) {
    const next = structuredClone(state)
    Object.assign(ex(next, id), patch)
    commit(next)
  },

  toggleRoute(id: string, i: number) {
    const next = structuredClone(state)
    const e = ex(next, id)
    const r = e.route ?? Array(6).fill(false)
    r[i] = !r[i]
    e.route = r
    commit(next)
  },

  useHint(id: string) {
    mutate((d) => {
      ex(d, id).hints++
      touch(d)
    })
  },

  recordRun(id: string, info: { dataKey?: string; ok: boolean }) {
    mutate((d) => {
      const e = ex(d, id)
      e.runs++
      if (e.status === 'idle') e.status = 'tried'
      touch(d)
      if (info.dataKey && info.ok) {
        e.ownCaseKeys ??= []
        if (e.ownCases < 2 && !e.ownCaseKeys.includes(info.dataKey)) {
          e.ownCaseKeys.push(info.dataKey)
          e.ownCases++
          award(d, 8, 'Probaste un caso propio')
        }
      }
    })
  },

  /** Resultado de "Evaluar" (codigo) o "Comprobar" (prediccion). */
  recordAttempt(id: string, passed: boolean) {
    mutate((d) => {
      const def = exerciseById.get(id)
      const e = ex(d, id)
      e.attempts++
      touch(d)
      if (e.status === 'idle') e.status = 'tried'
      if (passed && e.status !== 'solved' && def) {
        e.status = 'solved'
        e.solvedAt = Date.now()
        e.firstSolvedAttempts = e.attempts
        const hintPenalty = Math.max(0.5, 1 - 0.1 * e.hints)
        const attemptPenalty = def.kind === 'predict' ? (e.attempts === 1 ? 1 : e.attempts <= 3 ? 0.7 : 0.5) : 1
        const xp = Math.max(5, Math.round(def.xp * hintPenalty * attemptPenalty))
        e.xpAwarded = xp
        award(d, xp, `${def.num} · ${def.title}`)
        log(d, `Resolvió ${def.num} · ${def.title} (${e.attempts} intento${e.attempts === 1 ? '' : 's'}${e.hints ? `, ${e.hints} pista${e.hints === 1 ? '' : 's'}` : ''})`, 'sistema', id)
      }
    })
  },

  saveBitacora(id: string, b: Omit<BitacoraEntry, 'ts'>) {
    mutate((d) => {
      const e = ex(d, id)
      const first = !e.bitacora
      e.bitacora = { ...b, ts: Date.now() }
      touch(d)
      const def = exerciseById.get(id)
      log(d, `Bitácora de ${def?.num ?? id}: ${b.cambio || b.empece}`.slice(0, 220), 'bitacora', id)
      if (first) award(d, 15, 'Bitácora completada')
    })
  },

  readSection(lessonId: string, sectionId: string) {
    if (state.lessons[lessonId]?.read.includes(sectionId)) return
    mutate((d) => {
      const l = (d.lessons[lessonId] ??= { read: [], quiz: {} })
      l.read.push(sectionId)
      touch(d)
      award(d, 5, 'Sección leída')
    })
  },

  answerQuiz(lessonId: string, quizId: string, correct: boolean) {
    mutate((d) => {
      const l = (d.lessons[lessonId] ??= { read: [], quiz: {} })
      touch(d)
      if (correct && !l.quiz[quizId]) {
        l.quiz[quizId] = true
        award(d, 10, 'Pregunta rápida acertada')
      } else if (!correct && l.quiz[quizId] === undefined) l.quiz[quizId] = false
    })
  },

  addNote(text: string) {
    const t = text.trim()
    if (!t) return
    mutate((d) => {
      log(d, t, 'nota')
      touch(d)
      const today = new Date().toDateString()
      const notesToday = d.journal.filter((j) => j.kind === 'nota' && new Date(j.ts).toDateString() === today).length
      if (notesToday === 1) award(d, 5, 'Nota del día')
    })
  },

  deleteJournal(id: string) {
    const next = structuredClone(state)
    next.journal = next.journal.filter((j) => j.id !== id)
    commit(next)
  },

  saveMethod(answers: string[]) {
    mutate((d) => {
      d.method.push({ v: d.method.length + 1, ts: Date.now(), answers })
      touch(d)
      log(d, `Guardó "Mi método" versión ${d.method.length}`, 'sistema')
    })
  },

  setAvatar(a: AvatarConfig) {
    mutate((d) => {
      d.avatar = a
      if (!d.badges['_avatar']) d.badges['_avatar'] = Date.now()
    })
  },

  setSettings(s: Partial<Progress['settings']>) {
    const next = structuredClone(state)
    next.settings = { ...next.settings, ...s }
    commit(next)
  },

  replaceAll(p: Partial<Progress>) {
    commit(normalize(p))
  },

  resetAll() {
    commit(defaultProgress())
  },
}
