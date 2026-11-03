import type { Progress } from '@/types'
import { exercises, exercisesOfClase, clases } from './content'

// ---------- niveles ----------
export const levelFor = (xp: number) => Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1
export const xpAt = (level: number) => 50 * (level - 1) ** 2

export const TITLES = [
  'Gatito callejero',
  'Merodeador de tejados',
  'Cazador de bugs',
  'Rastreador de variables',
  'Explorador nocturno',
  'Maullador lógico',
  'Felino del código',
  'Guardián del callejón',
  'Maestro de bucles',
  'Leyenda stray',
]
export const titleFor = (level: number) => TITLES[Math.min(level - 1, TITLES.length - 1)]

export function levelInfo(xp: number) {
  const level = levelFor(xp)
  const from = xpAt(level)
  const to = xpAt(level + 1)
  return { level, title: titleFor(level), from, to, into: xp - from, need: to - from, pct: Math.min(100, ((xp - from) / (to - from)) * 100) }
}

// ---------- rachas ----------
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function streaks(activity: Progress['activity']) {
  const d = new Date()
  const today = !!activity[dayKey(d)]
  if (!today) d.setDate(d.getDate() - 1)
  let current = 0
  while (activity[dayKey(d)]) {
    current++
    d.setDate(d.getDate() - 1)
  }
  const days = Object.keys(activity).sort()
  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const k of days) {
    const [y, m, dd] = k.split('-').map(Number)
    const cur = new Date(y, m - 1, dd)
    if (prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1) run++
    else run = 1
    longest = Math.max(longest, run)
    prev = cur
  }
  return { current, longest, activeToday: today, totalDays: days.length }
}

// ---------- estadisticas ----------
export function stats(p: Progress) {
  const ex = Object.entries(p.exercises)
  const solved = ex.filter(([, e]) => e.status === 'solved')
  const solvedIds = new Set(solved.map(([id]) => id))
  const kind = (id: string) => exercises.find((e) => e.id === id)?.kind
  return {
    solved: solved.length,
    total: exercises.length,
    solvedIds,
    runs: ex.reduce((n, [, e]) => n + e.runs, 0),
    withoutHints: solved.filter(([, e]) => e.hints === 0).length,
    firstTry: solved.filter(([, e]) => e.firstSolvedAttempts === 1).length,
    predictSolved: solved.filter(([id]) => kind(id) === 'predict').length,
    codeSolved: solved.filter(([id]) => kind(id) === 'code').length,
    bitacoras: ex.filter(([, e]) => e.bitacora).length,
    ownCases: ex.reduce((n, [, e]) => n + e.ownCases, 0),
    quiz: Object.values(p.lessons).reduce((n, l) => n + Object.values(l.quiz).filter(Boolean).length, 0),
    attempts: ex.reduce((n, [, e]) => n + e.attempts, 0),
  }
}

export function claseProgress(p: Progress, n: number) {
  const list = exercisesOfClase(n)
  const done = list.filter((e) => p.exercises[e.id]?.status === 'solved').length
  return { done, total: list.length, pct: list.length ? (done / list.length) * 100 : 0 }
}

// ---------- insignias ----------
export interface BadgeDef {
  id: string
  name: string
  desc: string
  icon: string
  xp: number
  test: (p: Progress, s: ReturnType<typeof stats>) => boolean
}

const claseBadges: BadgeDef[] = clases.map((c) => ({
  id: `clase-${c.clase}`,
  name: `Misión ${c.clase} cumplida`,
  desc: `Resuelve todos los ejercicios de la clase ${c.clase}: ${c.title}.`,
  icon: 'flag',
  xp: 60,
  test: (p) => {
    const c2 = claseProgress(p, c.clase)
    return c2.total > 0 && c2.done === c2.total
  },
}))

export const BADGES: BadgeDef[] = [
  { id: 'primer-maullido', name: 'Primer maullido', desc: 'Ejecuta tu primer código.', icon: 'play', xp: 10, test: (_, s) => s.runs >= 1 },
  { id: 'primera-presa', name: 'Primera presa', desc: 'Resuelve tu primer ejercicio.', icon: 'paw', xp: 20, test: (_, s) => s.solved >= 1 },
  { id: 'cazador-5', name: 'Cazador', desc: 'Resuelve 5 ejercicios.', icon: 'target', xp: 30, test: (_, s) => s.solved >= 5 },
  { id: 'cazador-15', name: 'Cazador experto', desc: 'Resuelve 15 ejercicios.', icon: 'target', xp: 50, test: (_, s) => s.solved >= 15 },
  { id: 'cazador-40', name: 'Cazador de élite', desc: 'Resuelve 40 ejercicios.', icon: 'target', xp: 100, test: (_, s) => s.solved >= 40 },
  { id: 'racha-3', name: 'Tres noches seguidas', desc: 'Practica 3 días seguidos.', icon: 'flame', xp: 25, test: (p) => streaks(p.activity).longest >= 3 },
  { id: 'racha-7', name: 'Semana completa', desc: 'Practica 7 días seguidos.', icon: 'flame', xp: 60, test: (p) => streaks(p.activity).longest >= 7 },
  { id: 'racha-14', name: 'Constancia de acero', desc: 'Practica 14 días seguidos.', icon: 'flame', xp: 120, test: (p) => streaks(p.activity).longest >= 14 },
  { id: 'sin-pistas', name: 'Sin muletas', desc: 'Resuelve 5 ejercicios sin usar pistas.', icon: 'brain', xp: 40, test: (_, s) => s.withoutHints >= 5 },
  { id: 'primer-intento', name: 'Al primer intento', desc: 'Acierta 5 ejercicios al primer intento.', icon: 'bolt', xp: 40, test: (_, s) => s.firstTry >= 5 },
  { id: 'detective', name: 'Detective de tablas', desc: 'Acierta 5 ejercicios de predicción.', icon: 'search', xp: 40, test: (_, s) => s.predictSolved >= 5 },
  { id: 'diario', name: 'Diario de gato', desc: 'Llena 3 bitácoras de ejercicio.', icon: 'book', xp: 40, test: (_, s) => s.bitacoras >= 3 },
  { id: 'metodo-v1', name: 'Mi método, versión 1', desc: 'Guarda tu primera versión del método.', icon: 'compass', xp: 40, test: (p) => p.method.length >= 1 },
  { id: 'metodo-v2', name: 'Método refinado', desc: 'Guarda la versión 2 de tu método.', icon: 'compass', xp: 40, test: (p) => p.method.length >= 2 },
  { id: 'probador', name: 'Probador incansable', desc: 'Prueba 10 casos propios.', icon: 'flask', xp: 30, test: (_, s) => s.ownCases >= 10 },
  { id: 'quiz-10', name: 'Mente despierta', desc: 'Acierta 10 preguntas rápidas de las lecciones.', icon: 'bulb', xp: 30, test: (_, s) => s.quiz >= 10 },
  { id: 'estilo', name: 'Con estilo', desc: 'Personaliza tu avatar.', icon: 'sparkle', xp: 10, test: (p) => !!p.badges['_avatar'] },
  { id: 'nivel-5', name: 'Nivel 5', desc: 'Llega al nivel 5.', icon: 'star', xp: 0, test: (p) => levelFor(p.xp) >= 5 },
  ...claseBadges,
]

export const badgeById = new Map(BADGES.map((b) => [b.id, b]))
