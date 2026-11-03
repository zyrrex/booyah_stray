import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeEditor } from './CodeEditor'
import { Console } from './Console'
import { Icon } from './Icon'
import { runCode, type RunResult } from '@/engine/runner'
import { actions, useProgress } from '@/lib/store'
import { slug } from '@/lib/content'

const text = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((c) => (typeof c === 'string' ? c : React.isValidElement(c) ? text((c.props as { children?: React.ReactNode }).children) : ''))
    .join('')

/** Convierte `codigo` en <code> dentro de texto plano (para preguntas de los quiz). */
export function Inline({ s }: { s: string }) {
  const parts = s.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') ? (
          <code key={i}>{p.slice(1, -1)}</code>
        ) : (
          <React.Fragment key={i}>{p.split(/(\*\*[^*]+\*\*)/g).map((q, j) => (q.startsWith('**') ? <strong key={j}>{q.slice(2, -2)}</strong> : q))}</React.Fragment>
        ),
      )}
    </>
  )
}

// ---------- fragmento ejecutable ----------
export function Snippet({ code, runnable = true }: { code: string; runnable?: boolean }) {
  const [value, setValue] = useState(code)
  const [res, setRes] = useState<RunResult | null>(null)
  const [busy, setBusy] = useState(false)
  const lines = value.split('\n').length

  const run = async () => {
    setBusy(true)
    const r = await runCode(value)
    setRes(r)
    setBusy(false)
    actions.pulse()
  }

  return (
    <div className={`snippet ${runnable ? 'is-runnable' : ''}`}>
      <CodeEditor value={value} onChange={runnable ? setValue : undefined} readOnly={!runnable} onRun={runnable ? run : undefined} minLines={Math.min(lines, 18)} gutter={lines > 2} label="Ejemplo de código" />
      {runnable && (
        <div className="snippet-bar">
          <button className="btn btn-sm btn-primary" onClick={run} disabled={busy}>
            <Icon name="play" size={14} /> Probar
          </button>
          {value !== code && (
            <button className="btn btn-sm btn-ghost" onClick={() => { setValue(code); setRes(null) }}>
              <Icon name="refresh" size={14} /> Restaurar
            </button>
          )}
          <span className="snippet-hint">Puedes editarlo y volver a probarlo</span>
        </div>
      )}
      {res && <Console result={res} />}
    </div>
  )
}

// ---------- pregunta rapida ----------
function Quiz({ raw, lessonId }: { raw: string; lessonId?: string }) {
  const lines = raw.split('\n').map((l) => l.trimEnd())
  const q = lines.find((l) => l.trim() && !/^[-*>]\s/.test(l)) ?? ''
  const opts = lines.filter((l) => /^[-*]\s/.test(l)).map((l) => ({ t: l.replace(/^[-*]\s+/, '').replace(/\s*\*$/, ''), ok: /\*$/.test(l) }))
  const why = lines.filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join(' ')
  const [pick, setPick] = useState<number | null>(null)
  const id = slug(q).slice(0, 40)
  const prog = useProgress()
  const done = lessonId ? prog.lessons[lessonId]?.quiz[id] : undefined
  const answered = pick !== null

  return (
    <div className={`quiz ${answered ? (opts[pick!]?.ok ? 'is-ok' : 'is-bad') : ''}`}>
      <div className="quiz-tag"><Icon name="bulb" size={16} /> Pregunta rápida {done && <span className="chip chip-ok">ya la acertaste</span>}</div>
      <p className="quiz-q"><Inline s={q} /></p>
      <div className="quiz-opts" role="group">
        {opts.map((o, i) => (
          <button
            key={i}
            className={`quiz-opt ${answered && o.ok ? 'is-right' : ''} ${pick === i && !o.ok ? 'is-wrong' : ''}`}
            disabled={answered}
            onClick={() => {
              setPick(i)
              if (lessonId) actions.answerQuiz(lessonId, id, o.ok)
            }}
          >
            <Inline s={o.t} />
          </button>
        ))}
      </div>
      {answered && (
        <div className="quiz-why">
          <strong>{opts[pick!]?.ok ? '¡Eso es!' : 'Casi.'}</strong> {why && <Inline s={why} />}
          {!opts[pick!]?.ok && <button className="btn btn-sm btn-ghost" onClick={() => setPick(null)}>Intentar de nuevo</button>}
        </div>
      )}
    </div>
  )
}

// ---------- recuadros ----------
const CALLOUTS: Record<string, { icon: string; label: string }> = {
  tip: { icon: 'bulb', label: 'Idea clave' },
  ojo: { icon: 'alert', label: 'Ojo' },
  error: { icon: 'x', label: 'Error típico' },
  profundiza: { icon: 'sparkle', label: 'Para profundizar' },
  ejemplo: { icon: 'terminal', label: 'Ejemplo' },
  regla: { icon: 'flag', label: 'Regla de oro' },
  tu: { icon: 'pencil', label: 'Hazlo tú' },
}

function Callout({ children }: { children: React.ReactNode }) {
  const kids = React.Children.toArray(children)
  const idx = kids.findIndex((k) => React.isValidElement(k) && k.type === 'p')
  const first = idx >= 0 ? (kids[idx] as React.ReactElement<{ children: React.ReactNode }>) : null
  const pc = first ? React.Children.toArray(first.props.children) : []
  const head = typeof pc[0] === 'string' ? (pc[0] as string) : ''
  const m = head.match(/^\[!(\w+)\][ \t]*([^\n]*)\n?([\s\S]*)$/)
  if (!m || !CALLOUTS[m[1]]) return <blockquote>{children}</blockquote>
  const def = CALLOUTS[m[1]]
  const title = m[2] || def.label
  const rest = [m[3], ...pc.slice(1)].filter((x) => x !== '')
  const body = [...kids]
  if (rest.length) body[idx] = <p key="p0">{rest}</p>
  else body.splice(idx, 1)
  return (
    <aside className={`callout callout-${m[1]}`}>
      <div className="callout-head"><Icon name={def.icon} size={18} /> <span>{title}</span></div>
      <div className="callout-body">{body}</div>
    </aside>
  )
}

// ---------- seguimiento de lectura ----------
function useReadTracking(root: React.RefObject<HTMLElement | null>, lessonId?: string) {
  useEffect(() => {
    if (!lessonId || !root.current) return
    const timers = new Map<Element, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.sec
          if (!id) continue
          if (e.isIntersecting) {
            timers.set(e.target, window.setTimeout(() => actions.readSection(lessonId, id), 2200))
          } else {
            const t = timers.get(e.target)
            if (t) clearTimeout(t)
          }
        }
      },
      { rootMargin: '0px 0px -55% 0px' },
    )
    root.current.querySelectorAll('[data-sec]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      timers.forEach((t) => clearTimeout(t))
    }
  }, [root, lessonId])
}

export const Markdown = memo(function Markdown({ md, lessonId }: { md: string; lessonId?: string }) {
  const root = useRef<HTMLDivElement>(null)
  useReadTracking(root, lessonId)

  // estable entre renders: si cambiara, React desmontaria los fragmentos ejecutables (y perderian su estado)
  const components: Components = useMemo(() => ({
    h2: ({ children }) => {
      const id = slug(text(children))
      return <h2 id={id} data-sec={id}>{children}</h2>
    },
    h3: ({ children }) => <h3 id={slug(text(children))}>{children}</h3>,
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const src = String(children ?? '')
      const lang = /language-([\w-]+)/.exec(className ?? '')?.[1]
      const block = !!lang || src.includes('\n')
      if (!block) return <code className="ic">{children}</code>
      const body = src.replace(/\n$/, '')
      if (lang === 'quiz') return <Quiz raw={body} lessonId={lessonId} />
      if (lang === 'js') return <Snippet code={body} />
      if (lang === 'js-static') return <Snippet code={body} runnable={false} />
      return <pre className="plain">{body}</pre>
    },
    blockquote: ({ children }) => <Callout>{children}</Callout>,
    table: ({ children }) => <div className="table-wrap"><table>{children}</table></div>,
    a: ({ href, children }) => (href?.startsWith('#') ? <a href={href}>{children}</a> : <a href={href} target="_blank" rel="noreferrer">{children}</a>),
  }), [lessonId])

  return (
    <div className="md" ref={root}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {md}
      </ReactMarkdown>
    </div>
  )
})
