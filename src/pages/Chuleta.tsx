import { Markdown } from '@/components/Markdown'
import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { chuleta } from '@/lib/content'

export function Chuleta() {
  return (
    <div className="page">
      <PageHead kicker="Consulta rápida" title={chuleta?.title ?? 'Chuleta'} sub={chuleta?.subtitle} />
      <div className="lesson-layout">
        <article className="card lesson">{chuleta && <Markdown md={chuleta.body} />}</article>
        <aside className="toc card">
          <div className="toc-t">Ir a</div>
          {chuleta?.toc.map((t) => (
            <a key={t.id} href="#/chuleta" onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' }) }}>
              <Icon name="paw" size={13} /> {t.text}
            </a>
          ))}
        </aside>
      </div>
    </div>
  )
}
