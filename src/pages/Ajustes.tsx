import { useState } from 'react'
import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { changePassword, useAuth, wipeEverything } from '@/lib/auth'
import { actions, useProgress } from '@/lib/store'
import { decodeProgress, encodeProgress } from '@/lib/sync'
import { toast } from '@/lib/toast'

export function Ajustes() {
  const p = useProgress()
  const auth = useAuth()
  const [code, setCode] = useState('')
  const [imp, setImp] = useState('')
  const [msg, setMsg] = useState('')
  const [old, setOld] = useState('')
  const [nw, setNw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [confirm, setConfirm] = useState('')

  const gen = async () => {
    setCode(await encodeProgress(p))
    setMsg('')
  }
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    toast({ kind: 'info', text: 'Código copiado', sub: 'Pégalo en el chat con Carlos.' })
  }
  const restore = async () => {
    try {
      const prog = await decodeProgress(imp)
      if (!confirm_('Esto reemplaza TODO tu progreso actual por el del código. ¿Continuar?')) return
      actions.replaceAll(prog)
      setMsg('Progreso restaurado.')
      setImp('')
    } catch (e) {
      setMsg((e as Error).message)
    }
  }
  const confirm_ = (s: string) => window.confirm(s)

  return (
    <div className="page narrow">
      <PageHead kicker="Cuenta" title="Ajustes" />

      <section className="card">
        <h2 className="card-t"><Icon name="sun" size={18} /> Apariencia</h2>
        <div className="seg" role="group">
          {([['auto', 'Automático'], ['light', 'Cuaderno (claro)'], ['dark', 'Noche (oscuro)']] as const).map(([v, l]) => (
            <button key={v} className={p.settings.theme === v ? 'is-on' : ''} onClick={() => actions.setSettings({ theme: v })}>{l}</button>
          ))}
        </div>
        <label className="check mt"><input type="checkbox" checked={p.settings.reduceMotion} onChange={(e) => actions.setSettings({ reduceMotion: e.target.checked })} /> Reducir animaciones</label>
      </section>

      <section className="card">
        <h2 className="card-t"><Icon name="upload" size={18} /> Código de sincronización</h2>
        <p className="muted">Tu progreso vive en este navegador. Este código es una copia completa: envíaselo a Carlos para que vea tu avance, o úsalo para pasar tu progreso a otro equipo.</p>
        <div className="editor-bar">
          <button className="btn btn-primary" onClick={gen}>Generar mi código</button>
          {code && <button className="btn" onClick={copy}><Icon name="copy" size={16} /> Copiar</button>}
        </div>
        {code && <textarea className="code-out" readOnly rows={4} value={code} onFocus={(e) => e.currentTarget.select()} aria-label="Tu código de sincronización" />}
        <details className="mt">
          <summary>Restaurar desde un código</summary>
          <textarea rows={3} value={imp} onChange={(e) => setImp(e.target.value)} placeholder="STRAY1-…" aria-label="Código a restaurar" />
          <button className="btn" disabled={!imp.trim()} onClick={restore}>Restaurar</button>
          {msg && <p className="muted small">{msg}</p>}
        </details>
      </section>

      {auth.role === 'student' && (
        <section className="card">
          <h2 className="card-t"><Icon name="lock" size={18} /> Cambiar mi clave</h2>
          <div className="row2">
            <label>Clave actual<input type="password" value={old} onChange={(e) => setOld(e.target.value)} autoComplete="current-password" /></label>
            <label>Clave nueva<input type="password" value={nw} onChange={(e) => setNw(e.target.value)} autoComplete="new-password" /></label>
          </div>
          <button className="btn" disabled={!old || nw.length < 6} onClick={async () => { setPwMsg((await changePassword(old, nw)) ? 'Clave cambiada.' : 'La clave actual no es correcta.'); setOld(''); setNw('') }}>Cambiar clave</button>
          {pwMsg && <p className="muted small">{pwMsg}</p>}
        </section>
      )}

      <section className="card danger">
        <h2 className="card-t"><Icon name="alert" size={18} /> Zona de peligro</h2>
        <p className="muted">Borra tu progreso, tu clave y todo lo guardado en este navegador. No se puede deshacer (genera antes tu código de sincronización).</p>
        <label>Escribe <strong>BORRAR</strong> para confirmar<input value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
        <button className="btn btn-danger" disabled={confirm !== 'BORRAR'} onClick={wipeEverything}>Borrar todo</button>
      </section>
    </div>
  )
}
