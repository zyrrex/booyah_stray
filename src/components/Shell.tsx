import { useEffect, useState, type ReactNode } from 'react'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { XpBar } from './widgets'
import { useProgress } from '@/lib/store'
import { streaks } from '@/lib/gamify'
import { usePath } from '@/lib/router'
import { logout, useAuth } from '@/lib/auth'

const NAV = [
  { to: '/', icon: 'home', label: 'Inicio', match: (p: string) => p === '/' || p === '/inicio' },
  { to: '/clases', icon: 'map', label: 'Clases', match: (p: string) => p.startsWith('/clase') },
  { to: '/metodo', icon: 'compass', label: 'Método', match: (p: string) => p.startsWith('/metodo') },
  { to: '/chuleta', icon: 'list', label: 'Chuleta', match: (p: string) => p.startsWith('/chuleta') },
  { to: '/bitacora', icon: 'book', label: 'Bitácora', match: (p: string) => p.startsWith('/bitacora') },
  { to: '/logros', icon: 'trophy', label: 'Logros', match: (p: string) => p.startsWith('/logros') },
  { to: '/perfil', icon: 'user', label: 'Perfil', match: (p: string) => p.startsWith('/perfil') },
  { to: '/ajustes', icon: 'settings', label: 'Ajustes', match: (p: string) => p.startsWith('/ajustes') },
]

export function Shell({ children }: { children: ReactNode }) {
  const path = usePath()
  const p = useProgress()
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const st = streaks(p.activity)

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [path])

  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Abrir menú"><Icon name="menu" /></button>
        <a className="brand" href="#/"><Avatar cfg={p.avatar} size={30} rounded={false} /> <span>stray</span></a>
        <span className="topbar-streak" title="Racha de días"><Icon name="flame" size={18} /> {st.current}</span>
      </header>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`side ${open ? 'is-open' : ''}`}>
        <a className="brand" href="#/">
          <Avatar cfg={{ ...p.avatar }} size={38} />
          <span>stray</span>
        </a>
        <nav aria-label="Principal">
          {NAV.map((n) => (
            <a key={n.to} href={`#${n.to === '/' && auth.role === 'admin' ? '/inicio' : n.to}`} className={`nav-item ${n.match(path) ? 'is-active' : ''}`}>
              <Icon name={n.icon} size={19} /> {n.label}
            </a>
          ))}
        </nav>
        <div className="side-foot">
          {auth.role === 'admin' && <div className="side-note"><Icon name="shield" size={14} /> Modo tutor: el progreso no se guarda</div>}
          <div className="side-user">
            <a href="#/perfil"><Avatar cfg={p.avatar} size={44} /></a>
            <div>
              <strong>stray</strong>
              <span className="side-streak"><Icon name="flame" size={14} /> {st.current} {st.current === 1 ? 'día' : 'días'}</span>
            </div>
          </div>
          <XpBar xp={p.xp} compact />
          <button className="nav-item nav-logout" onClick={logout}><Icon name="logout" size={18} /> Salir</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}

export function PageHead({ kicker, title, sub, right }: { kicker?: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {kicker && <div className="kicker">{kicker}</div>}
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {right && <div className="page-head-right">{right}</div>}
    </div>
  )
}
