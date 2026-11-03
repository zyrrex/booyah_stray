import { useState } from 'react'
import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Heatmap } from '@/components/widgets'
import { exerciseById } from '@/lib/content'
import { stats, streaks } from '@/lib/gamify'
import { actions, useProgress } from '@/lib/store'

export function Bitacora() {
  const p = useProgress()
  const sk = streaks(p.activity)
  const st = stats(p)
  const [tab, setTab] = useState<'diario' | 'ejercicios'>('diario')
  const [note, setNote] = useState('')
  const entries = [...p.journal].reverse()
  const bitacoras = Object.entries(p.exercises).filter(([, e]) => e.bitacora).sort((a, b) => b[1].bitacora!.ts - a[1].bitacora!.ts)

  const grouped = entries.reduce<Record<string, typeof entries>>((acc, j) => {
    const k = new Date(j.ts).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
    ;(acc[k] ??= []).push(j)
    return acc
  }, {})

  return (
    <div className="page">
      <PageHead kicker="Tu registro" title="Bitácora" sub="Lo que hiciste, lo que aprendiste y cómo piensas. Ver cómo piensas importa más que si salió perfecto." />
      <section className="card stats-row">
        <div className="stat"><Icon name="flame" size={22} className="c-flame" /><strong>{sk.current}</strong><span>racha actual</span></div>
        <div className="stat"><Icon name="trophy" size={22} className="c-gold" /><strong>{sk.longest}</strong><span>mejor racha</span></div>
        <div className="stat"><Icon name="clock" size={22} /><strong>{sk.totalDays}</strong><span>días activos</span></div>
        <div className="stat"><Icon name="check" size={22} className="c-ok" /><strong>{st.solved}</strong><span>resueltos</span></div>
        <div className="stat"><Icon name="bolt" size={22} className="c-gold" /><strong>{st.firstTry}</strong><span>al primer intento</span></div>
      </section>
      <section className="card"><Heatmap activity={p.activity} weeks={26} /></section>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'diario'} className={tab === 'diario' ? 'is-on' : ''} onClick={() => setTab('diario')}><Icon name="note" size={16} /> Diario</button>
        <button role="tab" aria-selected={tab === 'ejercicios'} className={tab === 'ejercicios' ? 'is-on' : ''} onClick={() => setTab('ejercicios')}><Icon name="book" size={16} /> Bitácoras de ejercicios <small>{bitacoras.length}</small></button>
      </div>

      {tab === 'diario' && (
        <>
          <form className="card note-form" onSubmit={(e) => { e.preventDefault(); actions.addNote(note); setNote('') }}>
            <label>
              Escribe una nota de hoy
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qué me costó hoy · qué entendí por fin · qué le preguntaré a Carlos el domingo…" />
            </label>
            <button className="btn btn-primary" disabled={!note.trim()}>Guardar nota</button>
          </form>
          {entries.length === 0 && <p className="muted tc">Todavía no hay nada. Tus ejercicios resueltos y tus notas aparecen aquí.</p>}
          {Object.entries(grouped).map(([k, list]) => (
            <section key={k} className="day">
              <h3 className="day-t">{k}</h3>
              <ul className="timeline">
                {list.map((j) => (
                  <li key={j.id} className={`tl tl-${j.kind}`}>
                    <span className="tl-dot"><Icon name={j.kind === 'nota' ? 'pencil' : j.kind === 'bitacora' ? 'book' : 'check'} size={13} /></span>
                    <div className="tl-body">
                      <p>{j.exerciseId ? <a href={`#/ejercicio/${j.exerciseId}`}>{j.text}</a> : j.text}</p>
                      <time>{new Date(j.ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    {j.kind === 'nota' && <button className="icon-btn" aria-label="Borrar nota" onClick={() => actions.deleteJournal(j.id)}><Icon name="trash" size={15} /></button>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {tab === 'ejercicios' && (
        <div className="bit-list">
          {bitacoras.length === 0 && <p className="muted tc">Cuando resuelvas un ejercicio te propondré llenar su bitácora (6 preguntas, 5 minutos).</p>}
          {bitacoras.map(([id, e]) => {
            const ex = exerciseById.get(id)
            const b = e.bitacora!
            return (
              <article key={id} className="card bit-card">
                <h3><a href={`#/ejercicio/${id}`}>{ex?.num} · {ex?.title}</a> <time>{new Date(b.ts).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</time></h3>
                <dl>
                  {([['Empecé', b.empece], ['Me bloqueé en', b.bloqueo], ['Salí haciendo', b.salida], ['Predicción vs real', b.prediccion], ['Análisis / suposición', b.analisisSuposicion], ['Cambio a mi método', b.cambio]] as const).map(([k, v]) => v && <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
