import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Ring } from '@/components/widgets'
import { clases, exercisesOfClase, lessons } from '@/lib/content'
import { claseProgress } from '@/lib/gamify'
import { useProgress } from '@/lib/store'

export function Clases() {
  const p = useProgress()
  const recommended = clases.find((c) => claseProgress(p, c.clase).pct < 100)?.clase
  return (
    <div className="page">
      <PageHead kicker="Mapa de misiones" title="Tus clases" sub="Cada clase tiene su lección y su práctica. Avanza en orden: lo nuevo se apoya en lo anterior." />
      <ol className="quest-map">
        {clases.map((c) => {
          const cp = claseProgress(p, c.clase)
          const read = p.lessons[c.id]?.read.length ?? 0
          const done = cp.pct === 100
          return (
            <li key={c.id} className={`quest ${done ? 'is-done' : ''} ${recommended === c.clase ? 'is-next' : ''}`}>
              <div className="quest-node"><Icon name={done ? 'check' : c.icon} size={20} /></div>
              <a className="quest-card card card-link" href={`#/clase/${c.clase}`}>
                <div className="quest-top">
                  <div>
                    <div className="kicker">Clase {c.clase} · {c.date}</div>
                    <h3>{c.title}</h3>
                  </div>
                  <Ring pct={cp.pct} size={56} color={done ? 'var(--ok)' : 'var(--accent)'} />
                </div>
                <p className="muted">{c.summary}</p>
                <div className="quest-meta">
                  <span className="chip"><Icon name="book" size={13} /> {read}/{c.toc.length} secciones</span>
                  <span className="chip"><Icon name="target" size={13} /> {cp.done}/{cp.total} ejercicios</span>
                  {recommended === c.clase && <span className="chip chip-accent">Siguiente misión</span>}
                  {done && <span className="chip chip-ok">Completada</span>}
                </div>
              </a>
            </li>
          )
        })}
      </ol>
      <div className="grid-2">
        {lessons.filter((l) => l.clase === 0).map((l) => (
          <a key={l.id} href={`#/${l.id}`} className="card card-link side-quest">
            <span className="badge-ic"><Icon name={l.icon} size={22} /></span>
            <div>
              <div className="kicker">Misión secundaria</div>
              <h3>{l.title}</h3>
              <p className="muted">{l.summary}</p>
            </div>
          </a>
        ))}
      </div>
      <p className="muted small tc">{clases.reduce((n, c) => n + exercisesOfClase(c.clase).length, 0)} ejercicios en total.</p>
    </div>
  )
}
