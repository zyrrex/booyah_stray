import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  kind: 'xp' | 'level' | 'badge' | 'info' | 'warn'
  text: string
  sub?: string
}

let toasts: Toast[] = []
let seq = 1
const subs = new Set<() => void>()
const emit = () => subs.forEach((s) => s())

export function toast(t: Omit<Toast, 'id'>, ms = 3600) {
  const item = { ...t, id: seq++ }
  toasts = [...toasts, item].slice(-4)
  emit()
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== item.id)
    emit()
  }, ms)
}

export const dismissToast = (id: number) => {
  toasts = toasts.filter((x) => x.id !== id)
  emit()
}

export const useToasts = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => toasts,
  )
