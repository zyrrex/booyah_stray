import { useMemo, useState, type FormEvent } from 'react'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { checkPassword, createPassword, hasPassword, resetWithRescue, tryAdmin } from '@/lib/auth'
import { getProgress } from '@/lib/store'

type Step = 'user' | 'pass' | 'create' | 'forgot'

const GREETINGS = ['Miau. ¿Quién anda ahí?', 'Psst… identifícate, gato.', 'La puerta del callejón está cerrada.', 'Un gato curioso llama a la puerta.']

export function Gate() {
  const [step, setStep] = useState<Step>('user')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [rescue, setRescue] = useState('')
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [fails, setFails] = useState(0)
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], [])
  const avatar = getProgress().avatar

  const submitUser = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const u = user.trim()
    if (!u) return
    setBusy(true)
    if (u.toLowerCase() === 'stray') {
      setStep(hasPassword() ? 'pass' : 'create')
    } else if (!(await tryAdmin(u))) {
      setErr('Usuario no existente.')
    }
    setBusy(false)
  }

  const submitPass = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (fails >= 5) {
      setErr('Demasiados intentos. Espera un momento y vuelve a probar.')
      return
    }
    setBusy(true)
    const ok = await checkPassword(pass, remember)
    setBusy(false)
    if (!ok) {
      const n = fails + 1
      setFails(n)
      setErr('Clave incorrecta.')
      setPass('')
      if (n >= 5) setTimeout(() => setFails(0), 30_000)
    }
  }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (pass.length < 6) return setErr('Usa al menos 6 caracteres.')
    if (pass !== pass2) return setErr('Las claves no coinciden.')
    setBusy(true)
    await createPassword(pass, remember)
    setBusy(false)
  }

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (pass.length < 6) return setErr('La clave nueva necesita al menos 6 caracteres.')
    setBusy(true)
    const ok = await resetWithRescue(rescue, pass)
    setBusy(false)
    if (!ok) setErr('Ese código de rescate no es válido.')
  }

  return (
    <div className="gate">
      <div className="gate-card">
        <div className="gate-cat">
          <Avatar cfg={step === 'user' ? { ...avatar, accessory: 'none' } : avatar} size={104} className="bob" />
          <div className="bubble">{step === 'user' ? greeting : step === 'create' ? 'Primera vez por aquí. Elige una clave solo tuya.' : step === 'forgot' ? 'Sin problema, pasa a rescate.' : 'Hola, stray. Dime tu clave.'}</div>
        </div>
        <h1 className="gate-title">stray</h1>
        <p className="gate-sub">cuaderno de práctica</p>

        {step === 'user' && (
          <form onSubmit={submitUser} className="gate-form">
            <label>
              Usuario
              <input autoFocus autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} placeholder="tu usuario" spellCheck={false} autoCapitalize="off" />
            </label>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn btn-primary btn-lg" disabled={busy || !user.trim()}>{busy ? 'Comprobando…' : 'Entrar'} <Icon name="arrow" size={18} /></button>
          </form>
        )}

        {step === 'pass' && (
          <form onSubmit={submitPass} className="gate-form">
            <label>
              Clave
              <input autoFocus type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </label>
            <label className="check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Recordarme 30 días en este equipo</label>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn btn-primary btn-lg" disabled={busy || !pass}>{busy ? 'Comprobando…' : 'Abrir mi cuaderno'}</button>
            <div className="gate-links">
              <button type="button" className="link" onClick={() => { setStep('user'); setPass(''); setErr('') }}>← Cambiar usuario</button>
              <button type="button" className="link" onClick={() => { setStep('forgot'); setPass(''); setErr('') }}>Olvidé mi clave</button>
            </div>
          </form>
        )}

        {step === 'create' && (
          <form onSubmit={submitCreate} className="gate-form">
            <label>
              Crea tu clave
              <input autoFocus type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </label>
            <label>
              Repítela
              <input type="password" autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
            </label>
            <label className="check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Recordarme 30 días en este equipo</label>
            <p className="gate-note">Esta clave se guarda solo en este navegador. Anótala: si la olvidas, Carlos te da un código de rescate.</p>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Guardando…' : 'Crear clave y entrar'}</button>
          </form>
        )}

        {step === 'forgot' && (
          <form onSubmit={submitForgot} className="gate-form">
            <label>
              Código de rescate
              <input autoFocus value={rescue} onChange={(e) => setRescue(e.target.value)} placeholder="el que te dio Carlos" spellCheck={false} autoCapitalize="off" />
            </label>
            <label>
              Clave nueva
              <input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </label>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn btn-primary btn-lg" disabled={busy || !rescue}>Restablecer y entrar</button>
            <div className="gate-links">
              <button type="button" className="link" onClick={() => { setStep('pass'); setErr('') }}>← Volver</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
