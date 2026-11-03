import { useSyncExternalStore } from 'react'

const read = () => (location.hash.replace(/^#/, '') || '/').split('?')[0]

export const usePath = () =>
  useSyncExternalStore(
    (cb) => {
      addEventListener('hashchange', cb)
      return () => removeEventListener('hashchange', cb)
    },
    read,
  )

export const go = (path: string) => {
  location.hash = '#' + path
}

export function match(path: string, pattern: string): Record<string, string> | null {
  const a = path.split('/').filter(Boolean)
  const b = pattern.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < b.length; i++) {
    if (b[i].startsWith(':')) params[b[i].slice(1)] = decodeURIComponent(a[i])
    else if (b[i] !== a[i]) return null
  }
  return params
}
