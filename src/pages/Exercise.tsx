import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeEditor } from '@/components/CodeEditor'
import { Console } from '@/components/Console'
import { Icon } from '@/components/Icon'
import { Inline, Markdown, Snippet } from '@/components/Markdown'
import { Stars } from '@/components/widgets'
import { runCode, type RunResult } from '@/engine/runner'
import { exerciseById, nextExerciseId } from '@/lib/content'
import { checkAnswers, evaluateCode, type TestResult } from '@/lib/evaluate'
import { sha256 } from '@/lib/crypto'
import { actions, useProgress } from '@/lib/store'
import type { PublicExercise } from '@/types'

const ROUTE = [
  'La pregunta en una línea.',
  'Entradas y salida: qué datos tengo y qué debo producir.',
  'Reglas numeradas y cuál manda sobre cuál (eso ordena los if).',
  'Esqueleto en comentarios, sin una línea de código.',
  'Código de a una regla, ejecutando después de cada una.',
  'Casos de borde y un caso por cada rama.',
]

const GENERIC_HINTS = [
  'Reescribe el enunciado en una línea y marca qué datos necesitas. Solo esos importan.',
  'Numera las reglas del enunciado y decide cuál manda sobre cuál: eso define el orden de tus if.',
  'Haz a mano la tabla de estado con los datos dados y predice la salida. Luego ejecuta y busca la primera fila donde se separan.',
]

const compact = (s: string) => s.replace(/\s+/g, ' ').trim()

export function Exercise({ id }: { id: string }) {
  const ex = exerciseById.get(id)
  if (!ex) return <div className="page"><p>Ese ejercicio no existe. <a href="#/clases">Volver al mapa</a></p></div>
  return <ExerciseInner key={id} ex={ex} />
}

function ExerciseInner({ ex }: { ex: PublicExercise }) {
  const p = useProgress()
  const pr = p.exercises[ex.id]
  const solved = pr?.status === 'solved'
  const next = nextExerciseId(ex.id)
  const hints = ex.hints.length ? ex.hints : GENERIC_HINTS
  const hintsShown = Math.min(pr?.hints ?? 0, hints.length)
  const [bitOpen, setBitOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const onSolved = useCallback(() => {
    setCelebrate(true)
    setTimeout(() => setBitOpen(true), 900)
  }, [])

  return (
    <div className="page ex-page">
      <a href={`#/clase/${ex.clase}?practica`} className="back">
        <Icon name="arrow" size={16} className="flip" /> Clase {ex.clase}
      </a>
      <header className={`ex-head card ${solved ? 'is-solved' : ''}`}>
        <span className="ex-bignum">{ex.num}</span>
        <div className="ex-head-t">
          <div className="kicker">Clase {ex.clase} · {ex.kind === 'code' ? 'Ejercicio de código' : 'Ejercicio de predicción'}</div>
          <h1>{ex.title}</h1>
          <div className="ex-chips">
            <Stars n={ex.level} />
            <span className="chip"><Icon name="bolt" size={13} /> {pr?.xpAwarded ?? ex.xp} XP</span>
            {ex.tags.map((t) => <span key={t} className="chip chip-soft">{t}</span>)}
            {solved && <span className="chip chip-ok"><Icon name="check" size={13} /> Resuelto</span>}
          </div>
        </div>
      </header>

      <div className="ex-cols">
        <div className="ex-left">
          <section className="card">
            <h3 className="card-t"><Icon name="note" size={18} /> Enunciado</h3>
            <Markdown md={ex.statement} />
          </section>

          <details className="card route" open={!solved}>
            <summary><Icon name="compass" size={18} /> Ruta mínima <small>{(pr?.route ?? []).filter(Boolean).length}/6</small></summary>
            <p className="muted small">Antes de escribir código. Marca cada paso cuando lo hayas hecho (en papel o en un comentario).</p>
            <ul className="checklist">
              {ROUTE.map((r, i) => (
                <li key={i}>
                  <label>
                    <input type="checkbox" checked={!!pr?.route?.[i]} onChange={() => actions.toggleRoute(ex.id, i)} />
                    <span>{r}</span>
                  </label>
                </li>
              ))}
            </ul>
            <a className="link small" href="#/metodo">Ver el método completo →</a>
          </details>

          <section className="card hints">
            <h3 className="card-t"><Icon name="bulb" size={18} /> Pistas</h3>
            {hintsShown === 0 && <p className="muted small">Primero aplica el protocolo de bloqueo. Si sigues atascado, pide una pista: cada una resta 10% de XP (máximo 50%).</p>}
            <ol>
              {hints.slice(0, hintsShown).map((h, i) => <li key={i}><Inline s={h} /></li>)}
            </ol>
            {hintsShown < hints.length && !solved && (
              <button className="btn btn-sm" onClick={() => actions.useHint(ex.id)}><Icon name="bulb" size={14} /> Pedir pista {hintsShown + 1}</button>
            )}
            {hintsShown >= hints.length && <p className="muted small">No quedan más pistas. Aplica el protocolo de bloqueo y explícaselo en voz alta a alguien.</p>}
          </section>
        </div>

        <div className="ex-right">
          {ex.kind === 'code' ? <CodeWork ex={ex} onSolved={onSolved} /> : <PredictWork ex={ex} onSolved={onSolved} />}
        </div>
      </div>

      {celebrate && <Celebration />}
      {solved && (
        <section className="card solved-banner">
          <div className="solved-ic"><Icon name="trophy" size={28} /></div>
          <div>
            <h3>¡Resuelto!</h3>
            <p className="muted">+{pr?.xpAwarded} XP · {pr?.attempts} intento{pr?.attempts === 1 ? '' : 's'}{pr?.hints ? ` · ${pr.hints} pista${pr.hints === 1 ? '' : 's'}` : ' · sin pistas'}. {pr?.bitacora ? 'Ya llenaste tu bitácora.' : 'Cierra el ejercicio con tu bitácora: 5 minutos que valen oro.'}</p>
          </div>
          <div className="solved-actions">
            {!pr?.bitacora && <button className="btn" onClick={() => setBitOpen(true)}><Icon name="book" size={16} /> Bitácora</button>}
            {next ? <a className="btn btn-primary" href={`#/ejercicio/${next}`}>Siguiente <Icon name="arrow" size={16} /></a> : <a className="btn btn-primary" href={`#/clase/${ex.clase}`}>Volver a la clase</a>}
          </div>
        </section>
      )}
      {bitOpen && <BitacoraModal ex={ex} onClose={() => setBitOpen(false)} />}
    </div>
  )
}

// ---------------------------------------------------------------- código

function CodeWork({ ex, onSolved }: { ex: PublicExercise; onSolved: () => void }) {
  const pr = useProgress().exercises[ex.id]
  const [code, setCode] = useState(pr?.code ?? ex.starter ?? '')
  const [data, setData] = useState(pr?.data ?? ex.data ?? '')
  const [res, setRes] = useState<RunResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [tests, setTests] = useState<TestResult[] | null>(null)
  const [tab, setTab] = useState<'consola' | 'pruebas'>('consola')
  const save = useRef<number>(0)

  useEffect(() => {
    window.clearTimeout(save.current)
    save.current = window.setTimeout(() => actions.saveDraft(ex.id, { code, data }), 500)
    return () => window.clearTimeout(save.current)
  }, [code, data, ex.id])

  const dataChanged = compact(data) !== compact(ex.data ?? '')

  const run = async () => {
    if (busy) return
    setBusy(true)
    setTab('consola')
    const r = await runCode(`${data}\n${code}`)
    setRes(r)
    setBusy(false)
    const key = dataChanged ? (await sha256(compact(data))).slice(0, 12) : undefined
    actions.recordRun(ex.id, { dataKey: key, ok: !r.error && !r.timeout && r.out.length > 0 })
  }

  const evaluate = async () => {
    if (busy) return
    setBusy(true)
    const r = await evaluateCode(ex, code)
    setTests(r)
    setTab('pruebas')
    setBusy(false)
    const passed = r.length > 0 && r.every((x) => x.ok)
    const wasSolved = pr?.status === 'solved'
    actions.recordAttempt(ex.id, passed)
    if (passed && !wasSolved) onSolved()
  }

  const passedN = tests?.filter((t) => t.ok).length ?? 0
  const lines = Math.max(code.split('\n').length, 10)

  return (
    <>
      <details className="card data-card" open>
        <summary><Icon name="terminal" size={18} /> Datos del ejercicio {dataChanged && <span className="chip chip-accent">modificados</span>}</summary>
        <p className="muted small">Estas variables ya están declaradas: <strong>no las vuelvas a escribir</strong>. Puedes cambiar sus valores aquí para probar tus propios casos (+8 XP por caso nuevo, hasta 2).</p>
        <CodeEditor value={data} onChange={setData} minLines={Math.min(data.split('\n').length, 12)} label="Datos del ejercicio" />
        {dataChanged && <button className="btn btn-sm btn-ghost" onClick={() => setData(ex.data ?? '')}><Icon name="refresh" size={14} /> Restaurar datos</button>}
      </details>

      <section className="card editor-card">
        <div className="card-head">
          <h3 className="card-t"><Icon name="pencil" size={18} /> Tu código</h3>
          <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm('¿Borrar tu código y volver al esqueleto?')) setCode(ex.starter ?? '') }}><Icon name="refresh" size={14} /> Reiniciar</button>
        </div>
        <CodeEditor value={code} onChange={setCode} onRun={run} minLines={lines + 2} label="Tu código" placeholder="// Escribe tu solución aquí" />
        <div className="editor-bar">
          <button className="btn" onClick={run} disabled={busy}><Icon name="play" size={16} /> Ejecutar <kbd>Ctrl</kbd>+<kbd>Enter</kbd></button>
          <button className="btn btn-primary" onClick={evaluate} disabled={busy}><Icon name="check" size={16} /> Evaluar</button>
          {tests && <span className={`score ${passedN === tests.length ? 'is-ok' : ''}`}>{passedN}/{tests.length} casos</span>}
        </div>
      </section>

      <section className="card out-card">
        <div className="tabs tabs-sm" role="tablist">
          <button role="tab" aria-selected={tab === 'consola'} className={tab === 'consola' ? 'is-on' : ''} onClick={() => setTab('consola')}>Consola</button>
          <button role="tab" aria-selected={tab === 'pruebas'} className={tab === 'pruebas' ? 'is-on' : ''} onClick={() => setTab('pruebas')}>Pruebas {tests && <small>{passedN}/{tests.length}</small>}</button>
        </div>
        {tab === 'consola' && <Console result={res} running={busy} empty="Ejecuta tu código para ver qué imprime. Primero predice, después ejecuta." />}
        {tab === 'pruebas' && (
          tests ? <TestList tests={tests} onTry={(d) => { setData(d); setTab('consola'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} /> : <div className="console is-empty">Pulsa “Evaluar” para probar tu código con todos los casos. Los casos incluyen datos distintos a los de arriba: tu solución debe funcionar con todos, no solo con uno.</div>
        )}
      </section>
    </>
  )
}

function TestList({ tests, onTry }: { tests: TestResult[]; onTry: (data: string) => void }) {
  const firstBad = tests.findIndex((t) => !t.ok)
  const [open, setOpen] = useState<number | null>(firstBad >= 0 ? firstBad : null)
  useEffect(() => setOpen(firstBad >= 0 ? firstBad : null), [tests, firstBad])
  return (
    <ul className="tests">
      {tests.map((t, i) => (
        <li key={i} className={t.ok ? 'is-ok' : 'is-bad'}>
          <button className="test-head" onClick={() => setOpen(open === i ? null : i)}>
            <Icon name={t.ok ? 'check' : 'x'} size={16} />
            <span>{t.label}</span>
            <Icon name={open === i ? 'up' : 'down'} size={16} className="test-chev" />
          </button>
          {open === i && (
            <div className="test-body">
              {t.timeout && <p className="form-err">Tu programa tardó demasiado: ¿bucle infinito?</p>}
              {t.error && <p className="form-err">{t.error.name}: {t.error.message}</p>}
              {!t.ok && !t.error && !t.timeout && (
                <p className="small">
                  {t.out.length !== t.expectedLen && <>Imprimiste <strong>{t.out.length}</strong> línea{t.out.length === 1 ? '' : 's'} y se esperaban <strong>{t.expectedLen}</strong>. </>}
                  {t.firstDiff >= 0 && t.firstDiff < Math.min(t.out.length, t.expectedLen) && <>La <strong>línea {t.firstDiff + 1}</strong> no coincide. Compara mayúsculas, tildes, espacios y símbolos (S/, :, -).</>}
                </p>
              )}
              <div className="cmp">
                <div>
                  <div className="cmp-t">Tu salida</div>
                  <pre className="plain">{t.out.length ? t.out.map((l, j) => (j === t.firstDiff ? `» ${l}` : `  ${l}`)).join('\n') : '(nada)'}</pre>
                </div>
                {t.expected && (
                  <div>
                    <div className="cmp-t">Esperada</div>
                    <pre className="plain">{t.expected.map((l, j) => (j === t.firstDiff ? `» ${l}` : `  ${l}`)).join('\n')}</pre>
                  </div>
                )}
              </div>
              {!t.ok && (
                <details>
                  <summary className="small">Ver los datos de este caso</summary>
                  <Snippet code={t.data} runnable={false} />
                  <button className="btn btn-sm" onClick={() => onTry(t.data)}>Probar este caso en mi consola</button>
                </details>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------- predicción

function PredictWork({ ex, onSolved }: { ex: PublicExercise; onSolved: () => void }) {
  const pr = useProgress().exercises[ex.id]
  const [answers, setAnswers] = useState<Record<string, string>>(pr?.answers ?? {})
  const [state, setState] = useState<Record<string, boolean>>({})
  const [checked, setChecked] = useState(false)
  const [res, setRes] = useState<RunResult | null>(null)
  const [busy, setBusy] = useState(false)
  const qs = ex.questions ?? []
  const solved = pr?.status === 'solved'
  const allFilled = qs.every((q) => (answers[q.id] ?? '').trim() !== '')
  const canRun = !!ex.code && !ex.norun && (!ex.runAfter || checked || solved)
  const save = useRef<number>(0)

  useEffect(() => {
    window.clearTimeout(save.current)
    save.current = window.setTimeout(() => actions.saveDraft(ex.id, { answers }), 500)
    return () => window.clearTimeout(save.current)
  }, [answers, ex.id])

  const set = (id: string, v: string) => {
    setAnswers((a) => ({ ...a, [id]: v }))
    setState((s) => ({ ...s, [id]: undefined as unknown as boolean }))
  }

  const check = async () => {
    const r = await checkAnswers(ex, answers)
    setState(r)
    setChecked(true)
    const all = qs.every((q) => r[q.id])
    const wasSolved = solved
    actions.recordAttempt(ex.id, all)
    if (all && !wasSolved) onSolved()
  }

  const runIt = async () => {
    if (!ex.code) return
    setBusy(true)
    setRes(await runCode(`${ex.data ?? ''}\n${ex.code}`))
    setBusy(false)
    actions.recordRun(ex.id, { ok: true })
  }

  const okCount = qs.filter((q) => state[q.id]).length

  return (
    <>
      {ex.data && (
        <section className="card">
          <h3 className="card-t"><Icon name="terminal" size={18} /> Datos</h3>
          <Snippet code={ex.data} runnable={false} />
        </section>
      )}
      {ex.code && (
        <section className="card">
          <h3 className="card-t"><Icon name="terminal" size={18} /> Código a predecir</h3>
          <Snippet code={ex.code} runnable={false} />
          {!ex.norun && (
            <div className="editor-bar">
              <button className="btn" onClick={runIt} disabled={!canRun || busy}><Icon name="play" size={16} /> Ejecutar y comparar</button>
              {!canRun && <span className="muted small"><Icon name="lock" size={13} /> Primero escribe y comprueba tu predicción: predecir es lo que entrena.</span>}
            </div>
          )}
          {res && <Console result={res} />}
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <h3 className="card-t"><Icon name="brain" size={18} /> Tus respuestas</h3>
          {checked && <span className={`score ${okCount === qs.length ? 'is-ok' : ''}`}>{okCount}/{qs.length} correctas</span>}
        </div>
        <p className="muted small">Los textos van entre comillas: <code>"53"</code> es un string y <code>53</code> es un number.</p>
        <ol className="questions">
          {qs.map((q, i) => {
            const st = state[q.id]
            return (
              <li key={q.id} className={`q ${checked && st === true ? 'is-ok' : ''} ${checked && st === false ? 'is-bad' : ''}`}>
                <div className="q-label"><span className="q-n">{i + 1}</span><span><Inline s={q.label} /></span></div>
                {q.type === 'text' && (
                  <input value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} placeholder="tu respuesta" spellCheck={false} autoCapitalize="off" disabled={solved} aria-label={`Respuesta ${i + 1}`} />
                )}
                {q.type === 'bool' && (
                  <div className="seg" role="group">
                    {['true', 'false'].map((v) => (
                      <button key={v} className={answers[q.id] === v ? 'is-on' : ''} onClick={() => set(q.id, v)} disabled={solved}>{v === 'true' ? 'Verdadero' : 'Falso'}</button>
                    ))}
                  </div>
                )}
                {q.type === 'choice' && (
                  <div className="seg seg-wrap" role="group">
                    {q.options!.map((o) => (
                      <button key={o} className={answers[q.id] === o ? 'is-on' : ''} onClick={() => set(q.id, o)} disabled={solved}>{o}</button>
                    ))}
                  </div>
                )}
                {checked && st !== undefined && <span className="q-mark" aria-label={st ? 'Correcta' : 'Incorrecta'}><Icon name={st ? 'check' : 'x'} size={16} /></span>}
              </li>
            )
          })}
        </ol>
        <div className="editor-bar">
          <button className="btn btn-primary" onClick={check} disabled={!allFilled || solved}><Icon name="check" size={16} /> Comprobar</button>
          {!allFilled && <span className="muted small">Responde todo antes de comprobar.</span>}
          {checked && okCount < qs.length && <span className="muted small">No te digo cuáles valen: busca en tu tabla de estado la primera fila donde te separas.</span>}
        </div>
      </section>
    </>
  )
}

// ---------------------------------------------------------------- bitácora y celebración

function BitacoraModal({ ex, onClose }: { ex: PublicExercise; onClose: () => void }) {
  const pr = useProgress().exercises[ex.id]
  const b = pr?.bitacora
  const [f, setF] = useState({
    empece: b?.empece ?? '',
    bloqueo: b?.bloqueo ?? '',
    salida: b?.salida ?? '',
    prediccion: b?.prediccion ?? '',
    analisisSuposicion: b?.analisisSuposicion ?? '',
    cambio: b?.cambio ?? '',
  })
  const fields: [keyof typeof f, string][] = useMemo(
    () => [
      ['empece', '¿Cuánto tardé en empezar y qué hice los primeros 2 minutos?'],
      ['bloqueo', '¿En qué paso me bloqueé: entender, ordenar, rastrear o probar?'],
      ['salida', '¿Qué hice para salir y funcionó?'],
      ['prediccion', 'Mi predicción contra el resultado real: ¿coincidieron? Si no, ¿en qué fila de mi tabla?'],
      ['analisisSuposicion', '¿Qué error fue por análisis y cuál por suposición?'],
      ['cambio', 'Un cambio concreto a mi método para el próximo ejercicio.'],
    ],
    [],
  )
  const filled = Object.values(f).filter((v) => v.trim()).length
  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label="Bitácora del ejercicio">
      <div className="modal card">
        <div className="card-head">
          <h2><Icon name="book" size={20} /> Bitácora · {ex.num}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><Icon name="x" /></button>
        </div>
        <p className="muted">Un error con análisis te enseña algo; uno por suposición no. Responde con tus palabras (5 minutos). Cuenta como práctica de tu método.</p>
        <div className="bit-fields">
          {fields.map(([k, label]) => (
            <label key={k}>
              {label}
              <textarea rows={2} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Ahora no</button>
          <button className="btn btn-primary" disabled={filled < 3} onClick={() => { actions.saveBitacora(ex.id, f); onClose() }}>{b ? 'Actualizar bitácora' : 'Guardar bitácora (+15 XP)'}</button>
        </div>
        {filled < 3 && <p className="muted small tr">Responde al menos 3 preguntas para guardarla.</p>}
      </div>
    </div>
  )
}

function Celebration() {
  const bits = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ i, x: Math.random() * 100, d: Math.random() * 0.6, c: ['#ff8a3d', '#2dd4bf', '#7c5cff', '#f5b301', '#ff5d73'][i % 5], r: Math.random() * 360 })), [])
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => <i key={b.i} style={{ left: `${b.x}%`, background: b.c, animationDelay: `${b.d}s`, transform: `rotate(${b.r}deg)` }} />)}
    </div>
  )
}
