import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, placeholder as cmPlaceholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle, indentUnit } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: 'var(--c-kw)', fontWeight: '700' },
  { tag: [t.string, t.special(t.string)], color: 'var(--c-str)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--c-num)' },
  { tag: t.comment, color: 'var(--c-com)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--c-fn)' },
  { tag: t.propertyName, color: 'var(--c-prop)' },
  { tag: [t.operator, t.punctuation, t.bracket], color: 'var(--c-op)' },
  { tag: t.definition(t.variableName), color: 'var(--c-def)' },
])

interface Props {
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  onRun?: () => void
  minLines?: number
  placeholder?: string
  label?: string
  gutter?: boolean
}

export function CodeEditor({ value, onChange, readOnly, onRun, minLines = 4, placeholder, label, gutter = true }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const cb = useRef({ onChange, onRun })
  cb.current = { onChange, onRun }

  useEffect(() => {
    const exts = [
      history(),
      drawSelection(),
      EditorView.lineWrapping,
      bracketMatching(),
      indentOnInput(),
      indentUnit.of('  '),
      EditorState.tabSize.of(2),
      javascript(),
      syntaxHighlighting(highlight),
      keymap.of([
        { key: 'Mod-Enter', run: () => (cb.current.onRun ? (cb.current.onRun(), true) : false) },
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
      ]),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) cb.current.onChange?.(u.state.doc.toString())
      }),
      EditorView.contentAttributes.of({ 'aria-label': label ?? 'Editor de código', spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
    ]
    if (gutter) exts.push(lineNumbers())
    if (!readOnly) exts.push(highlightActiveLine())
    if (readOnly) exts.push(EditorState.readOnly.of(true), EditorView.editable.of(false))
    if (placeholder) exts.push(cmPlaceholder(placeholder))
    const v = new EditorView({ state: EditorState.create({ doc: value, extensions: exts }), parent: host.current! })
    view.current = v
    return () => {
      v.destroy()
      view.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, gutter])

  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])

  return <div ref={host} className={`cm-host ${readOnly ? 'is-readonly' : ''}`} style={{ ['--min-lines' as string]: minLines }} />
}
