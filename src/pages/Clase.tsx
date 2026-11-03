import { useState } from 'react'
import { Markdown } from '@/components/Markdown'
import { Icon } from '@/components/Icon'
import { Ring, Stars } from '@/components/widgets'
import { clases, exercisesOfClase } from '@/lib/content'
import { claseProgress } from '@/lib/gamify'
import { useProgress } from '@/lib/store'

export function Clase({ n }: { n: number }) {
  const lesson = clases.find((c) => c.clase === n)
  const p = useProgress()
  const [tab, setTab] = useState<'leccion' | 'practica'>(() => (location.hash.includes('practica') ? 'practica' : 'leccion'))
  if (!lesson) return <div className="page"><p>Esa clase no existe. <a href="#/clases">Volver al mapa</a></p></div>
  const list = exercisesOfClase(n)
  const cp = claseProgress(p, n)
  const read = p.lessons[lesson.id]?.read ?? []
  const prev = clases.find((c) => c.clase === n - 1)
  const next = clases.find((c) => c.clase === n + 1)

  return (
    <div className="page">
      <a href="#/clases" className="back"><Icon name="arrow" size={16} className="flip" /> Mapa</a>
      <header className="clase-head card">
        <div className="clase-ic"><Icon name={lesson.icon} size={30} /></div>
        <div className="clase-ttl">
          <div className="kicker">Clase {n} · {lesson.date}</div>
          <h1>{lesson.title}</h1>
          <p className="sub">{lesson.subtitle}</p>
        </div>
        <Ring pct={cp.pct} size={72} color={cp.pct === 100 ? 'var(--ok)' : 'var(--accent)'} />
      </header>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'leccion'} className={tab === 'leccion' ? 'is-on' : ''} onClick={() => setTab('leccion')}><Icon name="book" size={16} /> Lección <small>{read.length}/{lesson.toc.length}</small></button>
        <button role="tab" aria-selected={tab === 'practica'} className={tab === 'practica' ? 'is-on' : ''} onClick={() => setTab('practica')}><Icon name="target" size={16} /> Práctica <small>{cp.done}/{cp.total}</small></button>
      </div>

      {tab === 'leccion' && (
        <div className="lesson-layout">
          <article className="card lesson">
            <Markdown md={lesson.body} lessonId={lesson.id} />
            <div className="lesson-end">
              <button className="btn btn-primary" onClick={() => { setTab('practica'); window.scrollTo({ top: 0 }) }}>Ir a la práctica <Icon name="arrow" size={16} /></button>
            </div>
          </article>
          <nav className="toc card" aria-label="En esta lección">
            <div className="toc-t">En esta lección</div>
            {lesson.toc.map((t) => (
              <a key={t.id} href={`#/clase/${n}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className={read.includes(t.id) ? 'is-read' : ''}>
                <Icon name={read.includes(t.id) ? 'check' : 'paw'} size={13} /> {t.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      {tab === 'practica' && (
        <div className="ex-grid">
          {list.length === 0 && <p className="muted">Aún no hay ejercicios en esta clase.</p>}
          {list.map((e) => {
            const pr = p.exercises[e.id]
            const status = pr?.status ?? 'idle'
            return (
              <a key={e.id} href={`#/ejercicio/${e.id}`} className={`ex-card card card-link is-${status}`}>
                <div className="ex-top">
                  <span className="ex-num">{e.num}</span>
                  <span className={`ex-status s-${status}`}>{status === 'solved' ? <Icon name="check" size={14} /> : status === 'tried' ? 'en curso' : ''}</span>
                </div>
                <h4>{e.title}</h4>
                <div className="ex-foot">
                  <Stars n={e.level} />
                  <span className="chip">{e.kind === 'code' ? 'código' : 'predicción'}</span>
                  <span className="ex-xp">{pr?.xpAwarded ? `+${pr.xpAwarded}` : e.xp} XP</span>
                </div>
              </a>
            )
          })}
        </div>
      )}

      <div className="pager">
        {prev ? <a href={`#/clase/${prev.clase}`} className="btn btn-ghost"><Icon name="arrow" size={16} className="flip" /> {prev.title}</a> : <span />}
        {next && <a href={`#/clase/${next.clase}`} className="btn btn-ghost">{next.title} <Icon name="arrow" size={16} /></a>}
      </div>
    </div>
  )
}
