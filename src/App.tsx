import { useEffect, useState } from 'react'
import { Gate } from '@/components/Gate'
import { Shell } from '@/components/Shell'
import { Toasts } from '@/components/widgets'
import { restoreSession, useAuth } from '@/lib/auth'
import { match, usePath } from '@/lib/router'
import { useProgress } from '@/lib/store'
import { Admin } from '@/pages/Admin'
import { Ajustes } from '@/pages/Ajustes'
import { Bitacora } from '@/pages/Bitacora'
import { Chuleta } from '@/pages/Chuleta'
import { Clase } from '@/pages/Clase'
import { Clases } from '@/pages/Clases'
import { Exercise } from '@/pages/Exercise'
import { Home } from '@/pages/Home'
import { Logros } from '@/pages/Logros'
import { Metodo } from '@/pages/Metodo'
import { Perfil } from '@/pages/Perfil'

function Router() {
  const path = usePath()
  let m: Record<string, string> | null
  if ((m = match(path, '/clase/:n'))) return <Clase n={Number(m.n)} />
  if ((m = match(path, '/ejercicio/:id'))) return <Exercise id={m.id} />
  if (path === '/clases') return <Clases />
  if (path === '/metodo') return <Metodo />
  if (path === '/chuleta') return <Chuleta />
  if (path === '/bitacora') return <Bitacora />
  if (path === '/logros') return <Logros />
  if (path === '/perfil') return <Perfil />
  if (path === '/ajustes') return <Ajustes />
  return <Home />
}

export default function App() {
  const auth = useAuth()
  const p = useProgress()
  const path = usePath()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    restoreSession().finally(() => setReady(true))
  }, [])

  useEffect(() => {
    const t = p.settings.theme
    if (t === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', t)
    document.documentElement.toggleAttribute('data-reduce-motion', p.settings.reduceMotion)
  }, [p.settings.theme, p.settings.reduceMotion])

  if (!ready) return <div className="boot" aria-hidden="true" />
  if (auth.role === 'none') return <><Gate /><Toasts /></>
  // el modo tutor entra al panel; desde alli puede ver la web como alumno con la ruta normal
  if (auth.role === 'admin' && (path === '/' || path.startsWith('/tutor'))) return <><Admin /><Toasts /></>
  // en modo tutor el "Inicio" del alumno vive en /inicio (la raiz es el panel)
  return (
    <>
      <Shell>
        {auth.role === 'admin' && (
          <div className="tutor-banner"><span>Modo tutor · vista de alumno (nada se guarda)</span><a href="#/tutor">Volver al panel</a></div>
        )}
        <Router />
      </Shell>
      <Toasts />
    </>
  )
}
