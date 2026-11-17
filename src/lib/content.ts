import bundle from '@/generated/bundle.json'
import type { CursoId, GeneratedBundle, PublicExercise } from '@/types'

export const B = bundle as unknown as GeneratedBundle
export const exercises: PublicExercise[] = B.exercises
export const exerciseById = new Map(exercises.map((e) => [e.id, e]))

/** Los cursos de la plataforma. El de JavaScript conserva todos sus ids: el progreso guardado sigue valiendo. */
export interface Curso {
  id: CursoId
  title: string
  short: string
  subtitle: string
  icon: string
  /** ruta de la clase n */
  claseHref: (n: number) => string
  mapHref: string
  chuletaId: string
  lang: 'js' | 'sql'
}

export const CURSOS: Curso[] = [
  {
    id: 'js',
    title: 'JavaScript',
    short: 'JS',
    subtitle: 'Lógica de programación: variables, condiciones, bucles, objetos y funciones.',
    icon: 'terminal',
    claseHref: (n) => `#/clase/${n}`,
    mapHref: '#/curso/js',
    chuletaId: 'chuleta',
    lang: 'js',
  },
  {
    id: 'sql',
    title: 'SQL (SQL Server)',
    short: 'SQL',
    subtitle: 'Bases de datos: tablas, DDL, DML, consultas y el modelo relacional.',
    icon: 'database',
    claseHref: (n) => `#/curso/sql/clase/${n}`,
    mapHref: '#/curso/sql',
    chuletaId: 'chuleta-sql',
    lang: 'sql',
  },
]
export const cursoById = (id: string): Curso | undefined => CURSOS.find((c) => c.id === id)

export interface Lesson {
  id: string
  curso: CursoId
  clase: number
  title: string
  subtitle: string
  date: string
  icon: string
  summary: string
  body: string
  toc: { id: string; text: string }[]
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function parseLesson(raw: string): Lesson {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const meta: Record<string, string> = {}
  const body = m ? m[2] : raw
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  const toc = [...body.matchAll(/^##\s+(.+)$/gm)].map((x) => ({ id: slug(x[1]), text: x[1].replace(/[`*]/g, '') }))
  return {
    id: meta.id,
    curso: (meta.curso === 'sql' ? 'sql' : 'js') as CursoId,
    clase: Number(meta.clase ?? 0),
    title: meta.title ?? meta.id,
    subtitle: meta.subtitle ?? '',
    date: meta.date ?? '',
    icon: meta.icon ?? 'book',
    summary: meta.summary ?? '',
    body,
    toc,
  }
}

const files = import.meta.glob('/content/lessons/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
export const lessons: Lesson[] = Object.values(files).map(parseLesson)
export const lessonById = new Map(lessons.map((l) => [l.id, l]))

/** Clases numeradas (1..n) de un curso, en orden. */
export const clasesDe = (curso: CursoId): Lesson[] => lessons.filter((l) => l.curso === curso && l.clase > 0).sort((a, b) => a.clase - b.clase)
/** Clases de JavaScript (compatibilidad con el codigo anterior a los cursos). */
export const clases: Lesson[] = clasesDe('js')
/** Lecciones sueltas del curso (clase 0): metodo, chuleta... */
export const sideLessons = (curso: CursoId): Lesson[] => lessons.filter((l) => l.curso === curso && l.clase === 0)
export const metodo = lessonById.get('metodo')
export const chuleta = lessonById.get('chuleta')

export const exercisesOfClase = (n: number, curso: CursoId = 'js') => exercises.filter((e) => e.clase === n && (e.curso ?? 'js') === curso)
export const exercisesOfCurso = (curso: CursoId) => exercises.filter((e) => (e.curso ?? 'js') === curso)

/** Orden global de ejercicios (para "siguiente"). */
export const exerciseOrder = exercises.map((e) => e.id)
export const nextExerciseId = (id: string): string | undefined => {
  const e = exerciseById.get(id)
  if (!e) return undefined
  const same = exercisesOfClase(e.clase, e.curso ?? 'js')
  const i = same.findIndex((x) => x.id === id)
  return same[i + 1]?.id
}
