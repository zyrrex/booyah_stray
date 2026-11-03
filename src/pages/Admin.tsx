import { useEffect, useMemo, useState } from 'react'
import { Avatar } from '@/components/Avatar'
import { CodeEditor } from '@/components/CodeEditor'
import { Icon } from '@/components/Icon'
import { Markdown } from '@/components/Markdown'
import { Heatmap, Ring, XpBar } from '@/components/widgets'
import { B, clases, exerciseById, exercises, exercisesOfClase, lessons } from '@/lib/content'
import { evaluateCode, hashAns } from '@/lib/evaluate'
import { claseProgress, levelInfo, stats, streaks } from '@/lib/gamify'
import { logout, useAuth } from '@/lib/auth'
import { decodeProgress } from '@/lib/sync'
import type { Progress } from '@/types'

type Tab = 'progreso' | 'validar' | 'soluciones' | 'publicar'
const LAST = 'stray:admin:last'

export function Admin() {
  const auth = useAuth()
  const [tab, setTab] = useState<Tab>('progreso')
  const tabs: [Tab, string, string][] = [
    ['progreso', 'Progreso de stray', 'user'],
    ['validar', 'Validar contenido', 'shield'],
    ['soluciones', 'Soluciones', 'lock'],
    ['publicar', 'Publicar', 'upload'],
  ]
  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="brand"><Icon name="shield" size={22} /> <span>stray · modo tutor</span></div>
        <nav className="admin-tabs" role="tablist">
          {tabs.map(([k, l, i]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}><Icon name={i} size={16} /> {l}</button>
          ))}
        </nav>
        <div className="admin-right">
          <a className="btn btn-sm btn-ghost" href="#/inicio">Ver como alumno</a>
          <button className="btn btn-sm" onClick={logout}><Icon name="logout" size={15} /> Salir</button>
        </div>
      </header>
      <div className="admin-body">
        {tab === 'progreso' && <ProgresoTab />}
        {tab === 'validar' && <ValidarTab />}
        {tab === 'soluciones' && <SolucionesTab items={auth.admin?.items ?? {}} />}
        {tab === 'publicar' && <PublicarTab rescue={auth.admin?.rescueToken ?? ''} />}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ progreso
function ProgresoTab() {
  const [code, setCode] = useState('')
  const [prog, setProg] = useState<(Progress & { _exportedAt?: number }) | null>(null)
  const [err, setErr] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const load = async (c: string, persist = true) => {
    try {
      const p = await decodeProgress(c)
      setProg(p)
      setErr('')
      if (persist) localStorage.setItem(LAST, c.trim())
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  useEffect(() => {
    const last = localStorage.getItem(LAST)
    if (last) {
      setCode(last)
      load(last, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const st = prog ? stats(prog) : null
  const sk = prog ? streaks(prog.activity) : null
  const li = prog ? levelInfo(prog.xp) : null

  return (
    <div className="admin-pane">
      <section className="card">
        <h2 className="card-t"><Icon name="download" size={18} /> Pega el código de sincronización de stray</h2>
        <p className="muted">Él lo genera en <strong>Ajustes → Código de sincronización</strong> y te lo envía. Se guarda solo en este navegador.</p>
        <textarea rows={3} value={code} onChange={(e) => setCode(e.target.value)} placeholder="STRAY1-…" aria-label="Código de sincronización" />
        <div className="editor-bar">
          <button className="btn btn-primary" disabled={!code.trim()} onClick={() => load(code)}>Ver progreso</button>
          {err && <span className="form-err">{err}</span>}
        </div>
      </section>

      {prog && st && sk && li && (
        <>
          <section className="card hero">
            <div className="hero-av"><Avatar cfg={prog.avatar} size={96} /></div>
            <div className="hero-body">
              <div className="kicker">{prog._exportedAt ? `Exportado ${new Date(prog._exportedAt).toLocaleString('es')}` : 'Progreso importado'}</div>
              <h2>stray · nivel {li.level} · {li.title}</h2>
              <XpBar xp={prog.xp} />
            </div>
            <div className="hero-stats">
              <div className="stat"><Icon name="flame" size={22} className="c-flame" /><strong>{sk.current}</strong><span>racha (mejor {sk.longest})</span></div>
              <div className="stat"><Icon name="check" size={22} className="c-ok" /><strong>{st.solved}/{st.total}</strong><span>resueltos</span></div>
              <div className="stat"><Icon name="bolt" size={22} className="c-gold" /><strong>{st.firstTry}</strong><span>al 1er intento</span></div>
              <div className="stat"><Icon name="bulb" size={22} /><strong>{st.withoutHints}</strong><span>sin pistas</span></div>
            </div>
          </section>
          <div className="grid-2">
            <section className="card"><h3 className="card-t">Actividad</h3><Heatmap activity={prog.activity} weeks={20} /></section>
            <section className="card">
              <h3 className="card-t">Por clase</h3>
              <div className="mini-map">
                {clases.map((c) => {
                  const cp = claseProgress(prog, c.clase)
                  return (
                    <div key={c.id} className="mini-clase">
                      <Ring pct={cp.pct} size={46} label={String(c.clase)} color={cp.pct === 100 ? 'var(--ok)' : 'var(--accent)'} />
                      <div><strong>{c.title}</strong><span className="muted">{cp.done}/{cp.total} · bitácoras {exercisesOfClase(c.clase).filter((e) => prog.exercises[e.id]?.bitacora).length}</span></div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <section className="card">
            <h3 className="card-t">Ejercicios (lo que más cuesta aparece primero)</h3>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Ejercicio</th><th>Estado</th><th>Intentos</th><th>Pistas</th><th>Casos propios</th><th /></tr></thead>
                <tbody>
                  {exercises
                    .map((e) => ({ e, p: prog.exercises[e.id] }))
                    .filter((x) => x.p)
                    .sort((a, b) => b.p.attempts + b.p.hints - (a.p.attempts + a.p.hints))
                    .map(({ e, p }) => (
                      <>
                        <tr key={e.id} className={`st-${p.status}`}>
                          <td><strong>{e.num}</strong> {e.title}</td>
                          <td>{p.status === 'solved' ? '✔ resuelto' : p.status === 'tried' ? 'en curso' : '—'}</td>
                          <td>{p.attempts}</td>
                          <td>{p.hints}</td>
                          <td>{p.ownCases}</td>
                          <td><button className="btn btn-sm btn-ghost" onClick={() => setOpen(open === e.id ? null : e.id)}>{open === e.id ? 'Cerrar' : 'Ver'}</button></td>
                        </tr>
                        {open === e.id && (
                          <tr key={e.id + 'o'}>
                            <td colSpan={6}>
                              {p.code && <><div className="cmp-t">Su código</div><CodeEditor value={p.code} readOnly minLines={4} /></>}
                              {p.answers && <pre className="plain">{Object.entries(p.answers).map(([k, v]) => `${k.split('#')[1]}: ${v}`).join('\n')}</pre>}
                              {p.bitacora && (
                                <dl className="bit-dl">
                                  <div><dt>Empezó</dt><dd>{p.bitacora.empece}</dd></div>
                                  <div><dt>Se bloqueó</dt><dd>{p.bitacora.bloqueo}</dd></div>
                                  <div><dt>Salió haciendo</dt><dd>{p.bitacora.salida}</dd></div>
                                  <div><dt>Predicción</dt><dd>{p.bitacora.prediccion}</dd></div>
                                  <div><dt>Análisis/suposición</dt><dd>{p.bitacora.analisisSuposicion}</dd></div>
                                  <div><dt>Cambio</dt><dd>{p.bitacora.cambio}</dd></div>
                                </dl>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {prog.method.length > 0 && (
            <section className="card">
              <h3 className="card-t">Su método (v{prog.method.length})</h3>
              {prog.method.slice(-1).map((m) => <ol key={m.v}>{m.answers.map((a, i) => <li key={i}>{a}</li>)}</ol>)}
            </section>
          )}
          <section className="card">
            <h3 className="card-t">Diario reciente</h3>
            <ul className="log-mini">
              {[...prog.journal].reverse().slice(0, 25).map((j) => (
                <li key={j.id}><span className="dot" /><div>{j.text}<time>{new Date(j.ts).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div></li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ validar
interface Row { id: string; label: string; ok: boolean; detail: string }

function ValidarTab() {
  const auth = useAuth()
  const items = auth.admin?.items ?? {}
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)

  const run = async () => {
    setRunning(true)
    setRows([])
    setDone(0)
    const out: Row[] = []
    for (const ex of exercises) {
      const label = `${ex.num} · ${ex.title}`
      const sealed = items[ex.id]
      if (!sealed) {
        out.push({ id: ex.id, label, ok: false, detail: 'No está en el bloque sellado: vuelve a correr npm run content.' })
      } else if (ex.kind === 'code') {
        if (!sealed.solution) out.push({ id: ex.id, label, ok: false, detail: 'Sin solución de referencia.' })
        else {
          const r = await evaluateCode(ex, '', sealed.solution)
          const bad = r.filter((x) => !x.ok)
          out.push({ id: ex.id, label, ok: bad.length === 0, detail: bad.length ? `Falla en: ${bad.map((b) => b.label).join(', ')}` : `${r.length} caso(s) OK` })
        }
      } else {
        const qs = ex.questions ?? []
        let bad = 0
        for (let i = 0; i < qs.length; i++) {
          const plain = sealed.answers?.[i] ?? []
          const hs = await Promise.all(plain.map((a) => hashAns(qs[i].id, a)))
          if (!plain.length || !hs.some((h) => qs[i].accept.includes(h))) bad++
        }
        out.push({ id: ex.id, label, ok: bad === 0 && qs.length > 0, detail: bad ? `${bad} pregunta(s) sin respuesta consistente` : `${qs.length} pregunta(s) OK` })
      }
      setRows([...out])
      setDone(out.length)
    }
    setRunning(false)
  }

  const lint = useMemo(() => {
    const msgs: string[] = []
    for (const ex of exercises) {
      if (ex.hints.length === 0) msgs.push(`${ex.num} (${ex.id}) no tiene pistas propias (se usan las genéricas).`)
      if (ex.kind === 'code' && (ex.tests?.length ?? 0) < 4) msgs.push(`${ex.num} tiene pocos casos de prueba (${ex.tests?.length ?? 0}).`)
    }
    for (const l of lessons) if (l.toc.length === 0) msgs.push(`La lección "${l.id}" no tiene secciones (##).`)
    return msgs
  }, [])

  const bad = rows.filter((r) => !r.ok)
  return (
    <div className="admin-pane">
      <section className="card">
        <h2 className="card-t"><Icon name="shield" size={18} /> Validar todo el contenido publicado</h2>
        <p className="muted">Ejecuta la solución de referencia de cada ejercicio contra sus casos de prueba, en el navegador, y comprueba que las respuestas selladas coinciden con las publicadas. Si algo falla, el alumno vería un ejercicio imposible.</p>
        <div className="editor-bar">
          <button className="btn btn-primary" onClick={run} disabled={running}><Icon name="play" size={16} /> {running ? `Validando… ${done}/${exercises.length}` : 'Validar todo'}</button>
          {!running && rows.length > 0 && <span className={`score ${bad.length === 0 ? 'is-ok' : ''}`}>{rows.length - bad.length}/{rows.length} correctos</span>}
        </div>
        <p className="muted small">Generado el {new Date(B.generatedAt).toLocaleString('es')} · {exercises.length} ejercicios · {lessons.length} lecciones.</p>
      </section>
      {rows.length > 0 && (
        <section className="card">
          <ul className="val-list">
            {[...bad, ...rows.filter((r) => r.ok)].map((r) => (
              <li key={r.id} className={r.ok ? 'is-ok' : 'is-bad'}><Icon name={r.ok ? 'check' : 'x'} size={15} /> <strong>{r.label}</strong> <span className="muted">{r.detail}</span></li>
            ))}
          </ul>
        </section>
      )}
      {lint.length > 0 && (
        <section className="card">
          <h3 className="card-t"><Icon name="info" size={18} /> Sugerencias ({lint.length})</h3>
          <ul className="log-mini">{lint.slice(0, 30).map((m, i) => <li key={i}><span className="dot" /><div>{m}</div></li>)}</ul>
        </section>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ soluciones
function SolucionesTab({ items }: { items: Record<string, { solution?: string; explanation?: string; expected?: string[][]; answers?: string[][] }> }) {
  const [id, setId] = useState(exercises[0]?.id ?? '')
  const ex = exerciseById.get(id)
  const it = items[id]
  return (
    <div className="admin-pane">
      <section className="card">
        <label>Ejercicio
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {clases.map((c) => (
              <optgroup key={c.id} label={`Clase ${c.clase} · ${c.title}`}>
                {exercisesOfClase(c.clase).map((e) => <option key={e.id} value={e.id}>{e.num} · {e.title}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
      </section>
      {ex && it && (
        <>
          <section className="card"><h3 className="card-t">Enunciado</h3><Markdown md={ex.statement} /></section>
          {it.solution && <section className="card"><h3 className="card-t">Solución de referencia</h3>{ex.data && <CodeEditor value={ex.data} readOnly minLines={2} gutter={false} />}<CodeEditor value={it.solution} readOnly minLines={4} /></section>}
          {it.expected && (
            <section className="card">
              <h3 className="card-t">Salidas esperadas por caso</h3>
              {it.expected.map((lines, i) => (
                <div key={i}><div className="cmp-t">{ex.tests?.[i]?.label}</div><pre className="plain">{lines.join('\n')}</pre></div>
              ))}
            </section>
          )}
          {it.answers && (
            <section className="card">
              <h3 className="card-t">Respuestas</h3>
              <ol className="ans-list">{ex.questions?.map((q, i) => <li key={q.id}><span className="muted">{q.label}</span> → <code>{it.answers![i].join('  ó  ')}</code></li>)}</ol>
            </section>
          )}
          {it.explanation && <section className="card"><h3 className="card-t">Explicación / trampas</h3><Markdown md={it.explanation} /></section>}
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ publicar
function PublicarTab({ rescue }: { rescue: string }) {
  return (
    <div className="admin-pane">
      <section className="card">
        <h2 className="card-t"><Icon name="upload" size={18} /> Cómo publicar contenido nuevo</h2>
        <ol className="steps">
          <li>Dime (en la conversación con Claude) el tema que viste o verás, y qué ejercicios quieres. Yo escribo la lección y los ejercicios <strong>sin salirme de lo explicado</strong>.</li>
          <li>La lección va en <code>content/lessons/</code> (pública) y los ejercicios con soluciones en <code>content-private/exercises/</code> (privada, no se sube a git).</li>
          <li>Corre <code>npm run validate</code>: ejecuta cada solución contra sus casos y falla si algo no cuadra. Luego revisa aquí, en <strong>Validar contenido</strong>.</li>
          <li><code>npm run build</code> genera la carpeta <code>dist/</code>. Si usas GitHub Pages, haz push: el workflow la publica sola.</li>
        </ol>
      </section>
      <section className="card">
        <h2 className="card-t"><Icon name="lock" size={18} /> Código de rescate de stray</h2>
        <p className="muted">Si stray olvida su clave, en su pantalla de acceso (“Olvidé mi clave”) pide este código. Se cambia borrando <code>.admin-key</code> y regenerando.</p>
        <code className="big-code">{rescue}</code>
      </section>
      <section className="card">
        <h2 className="card-t"><Icon name="info" size={18} /> Ten presente</h2>
        <ul className="plainlist">
          <li>El acceso es una puerta cosmética: es una web estática y no hay servidor. Las soluciones y explicaciones sí están cifradas con tu llave; las respuestas esperadas solo se publican como hashes.</li>
          <li>Su progreso vive en su navegador. Si borra los datos del sitio, lo pierde: que genere su código de sincronización de vez en cuando.</li>
        </ul>
      </section>
    </div>
  )
}
