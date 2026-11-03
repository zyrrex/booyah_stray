import { dayKey, levelInfo } from '@/lib/gamify'
import { dismissToast, useToasts } from '@/lib/toast'
import type { Progress } from '@/types'
import { Icon } from './Icon'

export function Heatmap({ activity, weeks = 20 }: { activity: Progress['activity']; weeks?: number }) {
  const today = new Date()
  const dow = (today.getDay() + 6) % 7 // lunes = 0
  const start = new Date(today)
  start.setDate(today.getDate() - dow - (weeks - 1) * 7)
  const cells: { k: string; xp: number; actions: number; future: boolean; label: string }[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const k = dayKey(d)
    const a = activity[k]
    cells.push({
      k,
      xp: a?.xp ?? 0,
      actions: a?.actions ?? 0,
      future: d > today,
      label: `${d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}: ${a ? `${a.xp} XP · ${a.actions} acciones` : 'sin actividad'}`,
    })
  }
  const lvl = (c: (typeof cells)[number]) => (c.actions === 0 ? 0 : c.xp >= 120 ? 4 : c.xp >= 60 ? 3 : c.xp >= 20 ? 2 : 1)
  const months: { col: number; name: string }[] = []
  for (let w = 0; w < weeks; w++) {
    const d = new Date(start)
    d.setDate(start.getDate() + w * 7)
    if (w === 0 || d.getDate() <= 7) months.push({ col: w, name: d.toLocaleDateString('es', { month: 'short' }) })
  }
  return (
    <div className="heat" role="img" aria-label="Mapa de actividad de las últimas semanas">
      <div className="heat-months" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {months.map((m) => (
          <span key={m.col} style={{ gridColumn: m.col + 1 }}>{m.name}</span>
        ))}
      </div>
      <div className="heat-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {cells.map((c) => (
          <i key={c.k} title={c.label} className={`heat-cell l${c.future ? 'f' : lvl(c)}`} />
        ))}
      </div>
      <div className="heat-legend">
        menos <i className="heat-cell l0" /><i className="heat-cell l1" /><i className="heat-cell l2" /><i className="heat-cell l3" /><i className="heat-cell l4" /> más
      </div>
    </div>
  )
}

export function XpBar({ xp, compact }: { xp: number; compact?: boolean }) {
  const li = levelInfo(xp)
  return (
    <div className={`xpbar ${compact ? 'is-compact' : ''}`}>
      <div className="xpbar-top">
        <span className="xpbar-lvl">Nv. {li.level}</span>
        {!compact && <span className="xpbar-title">{li.title}</span>}
        <span className="xpbar-num">{li.into}/{li.need} XP</span>
      </div>
      <div className="xpbar-track" role="progressbar" aria-valuenow={Math.round(li.pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="xpbar-fill" style={{ width: `${li.pct}%` }} />
      </div>
    </div>
  )
}

export function Ring({ pct, size = 56, label, color = 'var(--accent)' }: { pct: number; size?: number; label?: string; color?: string }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, pct) / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="ring-label">{label ?? `${Math.round(pct)}%`}</span>
    </div>
  )
}

export function Toasts() {
  const list = useToasts()
  return (
    <div className="toasts" aria-live="polite">
      {list.map((t) => (
        <button key={t.id} className={`toast toast-${t.kind}`} onClick={() => dismissToast(t.id)}>
          <Icon name={t.kind === 'badge' ? 'trophy' : t.kind === 'level' ? 'star' : t.kind === 'xp' ? 'bolt' : 'info'} size={18} />
          <span><strong>{t.text}</strong>{t.sub && <small>{t.sub}</small>}</span>
        </button>
      ))}
    </div>
  )
}

export function Stars({ n, max = 3 }: { n: number; max?: number }) {
  return (
    <span className="stars" title={`Nivel ${n} de ${max}`} aria-label={`Nivel ${n} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name="star" size={14} className={i < n ? 'on' : 'off'} />
      ))}
    </span>
  )
}
