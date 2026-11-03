// Tipos compartidos entre la app y los scripts de contenido.

export type ExerciseKind = 'code' | 'predict'

/** Caso de prueba publico: nunca trae la salida esperada en claro (solo hashes por linea), salvo `show`. */
export interface PublicTest {
  label: string
  /** Codigo que declara los datos de este caso (se antepone al codigo del alumno). */
  data: string
  lineHashes: string[]
  /** Solo si el cuaderno original ya muestra la salida esperada. */
  show?: string[]
}

export interface PublicQuestion {
  id: string
  label: string
  type: 'text' | 'bool' | 'choice'
  options?: string[]
  /** Hashes (sha256) de las respuestas aceptadas, ya normalizadas. */
  accept: string[]
}

export interface PublicExercise {
  id: string
  clase: number
  num: string
  title: string
  kind: ExerciseKind
  level: 1 | 2 | 3
  xp: number
  tags: string[]
  statement: string
  data?: string
  starter?: string
  tests?: PublicTest[]
  /** predict: codigo para leer o ejecutar despues de predecir. */
  code?: string
  /** predict: solo se puede ejecutar el codigo despues de comprobar la prediccion. */
  runAfter?: boolean
  /** predict: el codigo es solo para leer (no es ejecutable). */
  norun?: boolean
  questions?: PublicQuestion[]
  hints: string[]
}

export interface SealedBlob {
  v: 1
  iter: number
  salt: string
  iv: string
  data: string
}

/** Lo que va cifrado con la llave admin. */
export interface SealedPayload {
  rescueToken: string
  items: Record<
    string,
    {
      solution?: string
      explanation?: string
      expected?: string[][]
      answers?: string[][]
    }
  >
}

export interface GeneratedBundle {
  generatedAt: string
  exercises: PublicExercise[]
  sealed: SealedBlob
  rescueHash: string
}

// ---------- progreso del alumno ----------

export interface AvatarConfig {
  fur: string
  pattern: 'none' | 'stripes' | 'patch' | 'tuxedo'
  ears: 'pointy' | 'round' | 'folded'
  eyes: 'round' | 'happy' | 'sleepy' | 'star'
  eyeColor: string
  accessory: 'none' | 'glasses' | 'headphones' | 'scarf' | 'cap' | 'bowtie'
  bg: string
}

export interface BitacoraEntry {
  ts: number
  empece: string
  bloqueo: string
  salida: string
  prediccion: string
  analisisSuposicion: string
  cambio: string
}

export interface ExerciseProgress {
  status: 'idle' | 'tried' | 'solved'
  attempts: number
  runs: number
  hints: number
  code?: string
  data?: string
  answers?: Record<string, string>
  ownCases: number
  ownCaseKeys?: string[]
  solvedAt?: number
  firstSolvedAttempts?: number
  xpAwarded?: number
  bitacora?: BitacoraEntry
  route?: boolean[]
}

export interface JournalEntry {
  id: string
  ts: number
  kind: 'nota' | 'sistema' | 'bitacora'
  text: string
  exerciseId?: string
}

export interface MethodVersion {
  v: number
  ts: number
  answers: string[]
}

export interface Progress {
  version: 1
  createdAt: number
  avatar: AvatarConfig
  xp: number
  activity: Record<string, { xp: number; actions: number }>
  exercises: Record<string, ExerciseProgress>
  lessons: Record<string, { read: string[]; quiz: Record<string, boolean> }>
  journal: JournalEntry[]
  method: MethodVersion[]
  badges: Record<string, number>
  settings: { theme: 'auto' | 'light' | 'dark'; reduceMotion: boolean }
}
