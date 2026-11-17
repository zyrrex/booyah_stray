import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Ring } from '@/components/widgets'
import { CURSOS, clasesDe, exercisesOfCurso } from '@/lib/content'
import { claseProgress, cursoProgress } from '@/lib/gamify'
import { useProgress } from '@/lib/store'

/** Portada de cursos: JavaScript, SQL… Cada curso lleva su propio avance; nada se mezcla ni se pierde. */
export function Cursos() {
  const p = useProgress()
  return (
    <div className="page">
      <PageHead kicker="Biblioteca" title="Tus cursos" sub="Cada curso tiene sus clases, su práctica y sus insignias. Avanzas en los dos a tu ritmo." />
      <div className="course-grid">
        {CURSOS.map((cu) => {
          const cp = cursoProgress(p, cu.id)
          const list = clasesDe(cu.id)
          const next = list.find((c) => claseProgress(p, c.clase, cu.id).pct < 100)
          const started = cp.done > 0 || list.some((c) => (p.lessons[c.id]?.read.length ?? 0) > 0)
          return (
            <a key={cu.id} href={cu.mapHref} className={`card card-link course-card course-${cu.id} ${cp.pct === 100 ? 'is-done' : ''}`}>
              <div className="course-top">
                <span className="course-ic"><Icon name={cu.icon} size={28} /></span>
                <Ring pct={cp.pct} size={64} color={cp.pct === 100 ? 'var(--ok)' : 'var(--accent)'} />
              </div>
              <h2>{cu.title}</h2>
              <p className="muted">{cu.subtitle}</p>
              <div className="quest-meta">
                <span className="chip"><Icon name="map" size={13} /> {list.length} clases</span>
                <span className="chip"><Icon name="target" size={13} /> {cp.done}/{exercisesOfCurso(cu.id).length} ejercicios</span>
                {cp.pct === 100 && <span className="chip chip-ok">Completado</span>}
              </div>
              <div className="course-go">
                {next ? (started ? <>Continuar: clase {next.clase} · {next.title}</> : <>Empezar: clase {next.clase} · {next.title}</>) : <>Repasar el curso</>}
                <Icon name="arrow" size={16} />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
