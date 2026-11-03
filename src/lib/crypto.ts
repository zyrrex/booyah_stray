// Cifrado y hashes con WebCrypto (funciona igual en el navegador y en Node 20+).
import type { SealedBlob } from '@/types'

const enc = new TextEncoder()
const dec = new TextDecoder()

export const toB64 = (b: Uint8Array): string => {
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s)
}
export const fromB64 = (s: string): Uint8Array => {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('')

export async function sha256(s: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(s)))
}

async function baseKey(pass: string) {
  return crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey', 'deriveBits'])
}

async function aesKey(pass: string, salt: Uint8Array, iter: number) {
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: iter, hash: 'SHA-256' },
    await baseKey(pass),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function sealJson(obj: unknown, pass: string, iter = 250_000): Promise<SealedBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await aesKey(pass, salt, iter)
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, enc.encode(JSON.stringify(obj)))
  return { v: 1, iter, salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(data)) }
}

/** Devuelve null si la llave es incorrecta (la etiqueta de AES-GCM no valida). */
export async function openSealed<T>(blob: SealedBlob, pass: string): Promise<T | null> {
  try {
    const key = await aesKey(pass, fromB64(blob.salt), blob.iter)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv) as BufferSource }, key, fromB64(blob.data) as BufferSource)
    return JSON.parse(dec.decode(plain)) as T
  } catch {
    return null
  }
}

export async function hashPassword(pass: string, saltB64: string, iter = 200_000): Promise<string> {
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromB64(saltB64) as BufferSource, iterations: iter, hash: 'SHA-256' },
    await baseKey(pass),
    256,
  )
  return hex(bits)
}

export const randomSalt = (): string => toB64(crypto.getRandomValues(new Uint8Array(16)))
