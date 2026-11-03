// Codigo de sincronizacion: el progreso completo, comprimido, en un texto que se puede pegar por WhatsApp.
import type { Progress } from '@/types'
import { toB64, fromB64 } from './crypto'

const PREFIX = 'STRAY1-'

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream))
  return new Uint8Array(await out.arrayBuffer())
}

export async function encodeProgress(p: Progress): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify({ ...p, _exportedAt: Date.now() }))
  const gz = await pipe(json, new CompressionStream('gzip'))
  return PREFIX + toB64(gz).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function decodeProgress(code: string): Promise<Progress & { _exportedAt?: number }> {
  const clean = code.trim().replace(/\s+/g, '')
  if (!clean.startsWith(PREFIX)) throw new Error('El código no empieza con STRAY1-. Cópialo completo.')
  let b64 = clean.slice(PREFIX.length).replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const raw = await pipe(fromB64(b64), new DecompressionStream('gzip'))
  const obj = JSON.parse(new TextDecoder().decode(raw))
  if (!obj || obj.version !== 1 || typeof obj.xp !== 'number') throw new Error('El código no parece un progreso válido.')
  return obj
}
