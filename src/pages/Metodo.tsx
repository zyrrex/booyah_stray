import { useState } from 'react'
import { Markdown } from '@/components/Markdown'
import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { metodo } from '@/lib/content'
import { actions, useProgress } from '@/lib/store'

const PROMPTS = [
  'Lo primero que hago al leer un enunciado es…',
  'Para no perder el rastro de los valores uso…',
  'Cuando me bloqueo hago…',
  'Antes de dar por buena una solución verifico…',
  'De la guía hay algo que no me sirve y lo cambio por…',
]

export function Metodo() {
  const p = useProgress()
  const last = p.method[p.method.length - 1]
  const [ans, setAns] = useState<string[]>(last?.answers ?? Array(5).fill(''))
  const filled = ans.filter((a) => a.trim()).length

  return (
    <div className="page">
      <PageHead kicker="Misión secundaria" title={metodo?.title ?? 'Método'} sub={metodo?.subtitle} />
      <div className="lesson-layout">
        <article className="card lesson">{metodo && <Markdown md={metodo.body} lessonId={metodo.id} />}</article>
        <aside className="toc card">
          <div className="toc-t">En esta guía</div>
          {metodo?.toc.map((t) => (
            <a key={t.id} href="#/metodo" onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' }) }}>
              <Icon name="paw" size={13} /> {t.text}
            </a>
          ))}
        </aside>
      </div>

      <section className="card my-method" id="mi-metodo">
        <div className="card-head">
          <h2><Icon name="compass" size={22} /> Mi método, versión {p.method.length + 1}</h2>
          <span className="muted small">{p.method.length === 0 ? 'Complétalo después de tus primeros ejercicios grandes.' : 'Reescríbelo cada 3 ejercicios.'}</span>
        </div>
        <p className="muted">Completa las frases con tus palabras, de modo que otra persona pueda seguirlas. Un método no se descubre pensando en abstracto: se descubre resolviendo y mirando qué hiciste.</p>
        <div className="bit-fields">
          {PROMPTS.map((q, i) => (
            <label key={i}>
              <span><strong>{i + 1}.</strong> {q}</span>
              <textarea rows={2} value={ans[i]} onChange={(e) => setAns(ans.map((a, j) => (j === i ? e.target.value : a)))} />
            </label>
          ))}
        </div>
        <div className="editor-bar">
          <button className="btn btn-primary" disabled={filled < 3} onClick={() => actions.saveMethod(ans)}>Guardar como versión {p.method.length + 1}</button>
          {filled < 3 && <span className="muted small">Completa al menos 3 frases.</span>}
        </div>
        {p.method.length > 0 && (
          <details className="versions">
            <summary>Mis versiones anteriores ({p.method.length})</summary>
            {[...p.method].reverse().map((m) => (
              <div key={m.v} className="version">
                <h4>Versión {m.v} <time>{new Date(m.ts).toLocaleDateString('es', { day: 'numeric', month: 'long' })}</time></h4>
                <ol>{m.answers.map((a, i) => a.trim() && <li key={i}><em>{PROMPTS[i]}</em> {a}</li>)}</ol>
              </div>
            ))}
          </details>
        )}
      </section>
    </div>
  )
}
