import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { Heatmap, Ring, XpBar } from '@/components/widgets'
import { clases, exerciseById, exercises, exercisesOfClase } from '@/lib/content'
import { BADGES, badgeById, claseProgress, levelInfo, stats, streaks } from '@/lib/gamify'
import { useProgress } from '@/lib/store'

const TIPS = [
  'Antes de escribir código: la pregunta en una línea. Si no puedes, no la entendiste todavía.',
  'Un error con análisis te enseña algo. Un error por suposición no te enseña nada: fue suerte.',
  'Predice, ejecuta, compara. Si no coincide, busca la primera fila de tu tabla donde se separan.',
  'Para cada número en una condición prueba: justo debajo, exacto y justo encima.',
  'Si llevas 10 minutos sin avanzar: reduce, comenta todo menos una regla y explícalo en voz alta.',
  'Nunca reescribas todo desde cero ni adivines cambios.',
  'Los índices empiezan en 0. Si imprimes posiciones “humanas”, ajusta al imprimir.',
  '¿Esto lo vi en el código o lo supuse? Pregúntatelo antes de contestar.',
]

export function Home() {
  const p = useProgress()
  const st = stats(p)
  const sk = streaks(p.activity)
  const li = levelInfo(p.xp)
  const tip = TIPS[new Date().getDate() % TIPS.length]

  // siguiente ejercicio recomendado: primero sin resolver, empezando por el ultimo tocado
  const touched = Object.entries(p.exercises).filter(([, e]) => e.status === 'tried').sort((a, b) => (b[1].runs + b[1].attempts) - (a[1].runs + a[1].attempts))
  const nextUnsolved = exercises.find((e) => p.exercises[e.id]?.status !== 'solved')
  const resume = touched[0] ? exerciseById.get(touched[0][0]) : nextUnsolved
  const nextBadges = BADGES.filter((b) => !p.badges[b.id]).slice(0, 3)
  const recent = [...p.journal].reverse().slice(0, 5)
  const earned = Object.keys(p.badges).filter((k) => badgeById.has(k)).length

  return (
    <div className="page">
      <section className="hero card">
        <div className="hero-av"><Avatar cfg={p.avatar} size={112} className="bob" /></div>
        <div className="hero-body">
          <div className="kicker">{li.title} · nivel {li.level}</div>
          <h1>{greet()}, stray</h1>
          <p className="hero-tip"><Icon name="bulb" size={16} /> {tip}</p>
          <XpBar xp={p.xp} />
        </div>
        <div className="hero-stats">
          <div className="stat"><Icon name="flame" size={22} className="c-flame" /><strong>{sk.current}</strong><span>{sk.current === 1 ? 'día' : 'días'} de racha</span></div>
          <div className="stat"><Icon name="check" size={22} className="c-ok" /><strong>{st.solved}</strong><span>de {st.total} resueltos</span></div>
          <div className="stat"><Icon name="trophy" size={22} className="c-gold" /><strong>{earned}</strong><span>insignias</span></div>
        </div>
      </section>

      {resume && (
        <a className="resume card card-link" href={`#/ejercicio/${resume.id}`}>
          <div className="resume-ic"><Icon name="play" size={26} /></div>
          <div>
            <div className="kicker">{touched[0] ? 'Sigue donde lo dejaste' : 'Siguiente reto'}</div>
            <h3>{resume.num} · {resume.title}</h3>
            <p className="muted">Clase {resume.clase} · {resume.kind === 'code' ? 'Código' : 'Predicción'} · {resume.xp} XP</p>
          </div>
          <Icon name="arrow" size={22} className="resume-go" />
        </a>
      )}

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h2>Tu mapa</h2><a href="#/clases" className="link">Ver todo →</a></div>
          <div className="mini-map">
            {clases.map((c) => {
              const cp = claseProgress(p, c.clase)
              return (
                <a key={c.id} href={`#/clase/${c.clase}`} className="mini-clase">
                  <Ring pct={cp.pct} size={50} label={String(c.clase)} color={cp.pct === 100 ? 'var(--ok)' : 'var(--accent)'} />
                  <div>
                    <strong>{c.title}</strong>
                    <span className="muted">{cp.done}/{cp.total} ejercicios</span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Actividad</h2><span className="muted">mejor racha: {sk.longest}</span></div>
          <Heatmap activity={p.activity} />
          <p className="muted small">{sk.activeToday ? 'Hoy ya sumaste a tu racha.' : 'Haz cualquier cosa hoy (ejecutar, leer, resolver) para sumar a tu racha.'}</p>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h2>Próximas insignias</h2><a href="#/logros" className="link">Todas →</a></div>
          <ul className="badge-list">
            {nextBadges.map((b) => (
              <li key={b.id}><span className="badge-ic is-locked"><Icon name={b.icon} size={20} /></span><div><strong>{b.name}</strong><span className="muted">{b.desc}</span></div></li>
            ))}
            {nextBadges.length === 0 && <li className="muted">¡Las tienes todas! Leyenda.</li>}
          </ul>
        </section>

        <section className="card">
          <div className="card-head"><h2>Últimos pasos</h2><a href="#/bitacora" className="link">Bitácora →</a></div>
          <ul className="log-mini">
            {recent.map((j) => (
              <li key={j.id}><span className="dot" /><div>{j.text}<time>{new Date(j.ts).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</time></div></li>
            ))}
            {recent.length === 0 && <li className="muted">Aún no hay nada. Resuelve tu primer ejercicio y aparece aquí.</li>}
          </ul>
        </section>
      </div>
      <p className="muted small tc">{exercises.length} ejercicios · {exercisesOfClase(1).length > 0 ? clases.length : 0} clases · actualizado {new Date().getFullYear()}</p>
    </div>
  )
}

function greet() {
  const h = new Date().getHours()
  return h < 6 ? 'Buenas madrugadas' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}
