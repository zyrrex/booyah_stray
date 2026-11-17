import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Ring } from '@/components/widgets'
import { clasesDe, cursoById, exercisesOfClase, sideLessons, type Lesson } from '@/lib/content'
import { claseProgress } from '@/lib/gamify'
import { useProgress } from '@/lib/store'
import type { CursoId } from '@/types'

/** Ruta de una leccion suelta (metodo, chuleta…). */
export const sideHref = (l: Lesson) => (l.id === 'chuleta-sql' ? '#/chuleta/sql' : `#/${l.id}`)

/** Mapa de misiones de un curso. */
export function Clases({ curso }: { curso: CursoId }) {
  const p = useProgress()
  const cu = cursoById(curso)
  const list = clasesDe(curso)
  if (!cu) return <div className="page"><p>Ese curso no existe. <a href="#/clases">Volver a los cursos</a></p></div>
  const recommended = list.find((c) => claseProgress(p, c.clase, curso).pct < 100)?.clase
  const side = sideLessons(curso)
  return (
    <div className="page">
      <a href="#/clases" className="back"><Icon name="arrow" size={16} className="flip" /> Cursos</a>
      <PageHead kicker={`Mapa de misiones · ${cu.title}`} title={`Tus clases de ${cu.short === 'JS' ? 'JavaScript' : cu.title}`} sub="Cada clase tiene su lección y su práctica. Avanza en orden: lo nuevo se apoya en lo anterior." />
      <ol className="quest-map">
        {list.map((c) => {
          const cp = claseProgress(p, c.clase, curso)
          const read = p.lessons[c.id]?.read.length ?? 0
          const done = cp.pct === 100
          return (
            <li key={c.id} className={`quest ${done ? 'is-done' : ''} ${recommended === c.clase ? 'is-next' : ''}`}>
              <div className="quest-node"><Icon name={done ? 'check' : c.icon} size={20} /></div>
              <a className="quest-card card card-link" href={cu.claseHref(c.clase)}>
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
      {list.length === 0 && <p className="muted">Todavía no hay clases en este curso.</p>}
      <div className="grid-2">
        {(curso === 'js' ? [...sideLessons('js')] : side).map((l) => (
          <a key={l.id} href={sideHref(l)} className="card card-link side-quest">
            <span className="badge-ic"><Icon name={l.icon} size={22} /></span>
            <div>
              <div className="kicker">Misión secundaria</div>
              <h3>{l.title}</h3>
              <p className="muted">{l.summary}</p>
            </div>
          </a>
        ))}
      </div>
      <p className="muted small tc">{list.reduce((n, c) => n + exercisesOfClase(c.clase, curso).length, 0)} ejercicios en este curso.</p>
    </div>
  )
}
