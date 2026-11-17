import { Markdown } from '@/components/Markdown'
import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { CURSOS, cursoById, lessonById } from '@/lib/content'
import type { CursoId } from '@/types'

export function Chuleta({ curso = 'js' }: { curso?: CursoId }) {
  const cu = cursoById(curso)!
  const chuleta = lessonById.get(cu.chuletaId)
  const here = curso === 'js' ? '#/chuleta' : `#/chuleta/${curso}`
  return (
    <div className="page">
      <PageHead kicker={`Consulta rápida · ${cu.title}`} title={chuleta?.title ?? 'Chuleta'} sub={chuleta?.subtitle} />
      <div className="tabs" role="tablist">
        {CURSOS.map((c) => (
          <a key={c.id} role="tab" aria-selected={c.id === curso} className={`tab-link ${c.id === curso ? 'is-on' : ''}`} href={c.id === 'js' ? '#/chuleta' : `#/chuleta/${c.id}`}>
            <Icon name={c.icon} size={16} /> {c.short === 'JS' ? 'JavaScript' : c.title}
          </a>
        ))}
      </div>
      <div className="lesson-layout">
        <article className="card lesson">{chuleta ? <Markdown md={chuleta.body} /> : <p className="muted">Todavía no hay chuleta para este curso.</p>}</article>
        <aside className="toc card">
          <div className="toc-t">Ir a</div>
          {chuleta?.toc.map((t) => (
            <a key={t.id} href={here} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' }) }}>
              <Icon name="paw" size={13} /> {t.text}
            </a>
          ))}
        </aside>
      </div>
    </div>
  )
}
