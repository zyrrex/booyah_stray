import { useSyncExternalStore } from 'react'
import { B } from './content'
import { hashPassword, openSealed, randomSalt, sha256 } from './crypto'
import { enterSandbox } from './store'
import type { SealedPayload } from '@/types'

const AUTH_KEY = 'stray:v1:auth'
const REMEMBER_KEY = 'stray:v1:remember'
const SESSION_KEY = 'stray:v1:session'
const ITER = 200_000
const REMEMBER_MS = 30 * 24 * 3600 * 1000

interface StoredAuth {
  salt: string
  hash: string
  iter: number
  createdAt: number
}

export type Role = 'none' | 'student' | 'admin'
interface AuthState {
  role: Role
  admin?: SealedPayload
}

let state: AuthState = { role: 'none' }
const subs = new Set<() => void>()
const set = (s: AuthState) => {
  state = s
  subs.forEach((f) => f())
}
export const useAuth = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => state,
  )

const read = <T,>(store: Storage, key: string): T | null => {
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
const write = (store: Storage, key: string, v: unknown) => {
  try {
    store.setItem(key, JSON.stringify(v))
  } catch {
    /* ignorar */
  }
}

export const hasPassword = () => !!read<StoredAuth>(localStorage, AUTH_KEY)

/** Restaura la sesion (alumno recordado o tutor en la misma pestana). */
export async function restoreSession() {
  const admKey = read<string>(sessionStorage, SESSION_KEY + ':admin')
  if (admKey) {
    const payload = await openSealed<SealedPayload>(B.sealed, admKey)
    if (payload) {
      enterSandbox()
      set({ role: 'admin', admin: payload })
      return
    }
  }
  const remembered = read<number>(localStorage, REMEMBER_KEY)
  if ((remembered && Date.now() - remembered < REMEMBER_MS) || read<number>(sessionStorage, SESSION_KEY)) {
    if (hasPassword()) set({ role: 'student' })
  }
}

export async function createPassword(pass: string, remember: boolean) {
  const salt = randomSalt()
  write(localStorage, AUTH_KEY, { salt, hash: await hashPassword(pass, salt, ITER), iter: ITER, createdAt: Date.now() } satisfies StoredAuth)
  startStudent(remember)
}

export async function checkPassword(pass: string, remember: boolean): Promise<boolean> {
  const a = read<StoredAuth>(localStorage, AUTH_KEY)
  if (!a) return false
  const ok = (await hashPassword(pass, a.salt, a.iter)) === a.hash
  if (ok) startStudent(remember)
  return ok
}

function startStudent(remember: boolean) {
  write(sessionStorage, SESSION_KEY, Date.now())
  if (remember) write(localStorage, REMEMBER_KEY, Date.now())
  set({ role: 'student' })
}

/** El "usuario" que no es stray se prueba como llave de tutor (sin mostrar ninguna pista de ello). */
export async function tryAdmin(candidate: string): Promise<boolean> {
  const key = candidate.trim()
  if (key.length < 8) return false
  const payload = await openSealed<SealedPayload>(B.sealed, key)
  if (!payload) return false
  write(sessionStorage, SESSION_KEY + ':admin', key)
  enterSandbox()
  set({ role: 'admin', admin: payload })
  return true
}

/** Codigo de rescate (lo ve el tutor en su panel) para restablecer la clave del alumno. */
export async function resetWithRescue(code: string, newPass: string): Promise<boolean> {
  if ((await sha256(`rescue|${code.trim()}`)) !== B.rescueHash) return false
  await createPassword(newPass, true)
  return true
}

export async function changePassword(oldPass: string, newPass: string): Promise<boolean> {
  const a = read<StoredAuth>(localStorage, AUTH_KEY)
  if (!a || (await hashPassword(oldPass, a.salt, a.iter)) !== a.hash) return false
  const salt = randomSalt()
  write(localStorage, AUTH_KEY, { salt, hash: await hashPassword(newPass, salt, ITER), iter: ITER, createdAt: a.createdAt } satisfies StoredAuth)
  return true
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY + ':admin')
    localStorage.removeItem(REMEMBER_KEY)
  } catch {
    /* ignorar */
  }
  location.hash = '#/'
  location.reload()
}

export function wipeEverything() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('stray:')) localStorage.removeItem(k)
    sessionStorage.clear()
  } catch {
    /* ignorar */
  }
  location.hash = '#/'
  location.reload()
}
