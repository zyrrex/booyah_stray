import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { XpBar } from '@/components/widgets'
import { BADGES, TITLES, levelInfo, xpAt } from '@/lib/gamify'
import { useProgress } from '@/lib/store'

export function Logros() {
  const p = useProgress()
  const li = levelInfo(p.xp)
  const earned = BADGES.filter((b) => p.badges[b.id])
  return (
    <div className="page">
      <PageHead kicker="Gamificación" title="Logros" sub={`${earned.length} de ${BADGES.length} insignias · ${p.xp} XP en total`} />
      <section className="card level-card">
        <div className="level-big"><span>Nivel</span><strong>{li.level}</strong></div>
        <div className="level-r">
          <h2>{li.title}</h2>
          <XpBar xp={p.xp} />
          <p className="muted small">Te faltan {li.to - p.xp} XP para el nivel {li.level + 1}: <em>{TITLES[Math.min(li.level, TITLES.length - 1)]}</em>.</p>
        </div>
      </section>
      <section className="card">
        <h2 className="card-t">Camino de niveles</h2>
        <ol className="lvl-path">
          {TITLES.map((t, i) => (
            <li key={t} className={li.level > i + 1 ? 'is-done' : li.level === i + 1 ? 'is-now' : ''}>
              <span className="lvl-n">{i + 1}</span>
              <div><strong>{t}</strong><small>{xpAt(i + 1)} XP</small></div>
            </li>
          ))}
        </ol>
      </section>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const at = p.badges[b.id]
          return (
            <article key={b.id} className={`card badge ${at ? 'is-earned' : 'is-locked'}`}>
              <span className="badge-ic"><Icon name={at ? b.icon : 'lock'} size={26} /></span>
              <h4>{b.name}</h4>
              <p className="muted small">{b.desc}</p>
              {at ? <time>{new Date(at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}{b.xp ? ` · +${b.xp} XP` : ''}</time> : <time>{b.xp ? `+${b.xp} XP` : 'logro'}</time>}
            </article>
          )
        })}
      </div>
    </div>
  )
}
