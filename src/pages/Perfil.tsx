import { useState } from 'react'
import { Avatar, BGS, EYE_COLORS, FURS } from '@/components/Avatar'
import { PageHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { XpBar } from '@/components/widgets'
import { levelInfo, stats, streaks } from '@/lib/gamify'
import { DEFAULT_AVATAR, actions, useProgress } from '@/lib/store'
import type { AvatarConfig } from '@/types'

const OPTIONS: { key: keyof AvatarConfig; label: string; values: [string, string][] }[] = [
  { key: 'pattern', label: 'Pelaje', values: [['none', 'Liso'], ['stripes', 'Rayas'], ['patch', 'Mancha'], ['tuxedo', 'Esmoquin']] },
  { key: 'ears', label: 'Orejas', values: [['pointy', 'Puntiagudas'], ['round', 'Redondas'], ['folded', 'Dobladas']] },
  { key: 'eyes', label: 'Ojos', values: [['round', 'Redondos'], ['happy', 'Felices'], ['sleepy', 'Soñolientos'], ['star', 'Estrella']] },
  { key: 'accessory', label: 'Accesorio', values: [['none', 'Ninguno'], ['glasses', 'Lentes'], ['headphones', 'Audífonos'], ['scarf', 'Bufanda'], ['cap', 'Gorra'], ['bowtie', 'Corbatín']] },
]

export function Perfil() {
  const p = useProgress()
  const [cfg, setCfg] = useState<AvatarConfig>(p.avatar)
  const dirty = JSON.stringify(cfg) !== JSON.stringify(p.avatar)
  const li = levelInfo(p.xp)
  const st = stats(p)
  const sk = streaks(p.activity)
  const upd = (patch: Partial<AvatarConfig>) => setCfg((c) => ({ ...c, ...patch }))
  const randomize = () => {
    const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
    setCfg({
      fur: pick(FURS), bg: pick(BGS), eyeColor: pick(EYE_COLORS),
      pattern: pick(OPTIONS[0].values)[0] as AvatarConfig['pattern'],
      ears: pick(OPTIONS[1].values)[0] as AvatarConfig['ears'],
      eyes: pick(OPTIONS[2].values)[0] as AvatarConfig['eyes'],
      accessory: pick(OPTIONS[3].values)[0] as AvatarConfig['accessory'],
    })
  }

  const Swatches = ({ k, colors }: { k: 'fur' | 'bg' | 'eyeColor'; colors: string[] }) => (
    <div className="swatches" role="group">
      {colors.map((c) => (
        <button key={c} className={`swatch ${cfg[k] === c ? 'is-on' : ''}`} style={{ background: c }} aria-label={`Color ${c}`} onClick={() => upd({ [k]: c })} />
      ))}
    </div>
  )

  return (
    <div className="page">
      <PageHead kicker="Tu gato" title="Perfil" sub="Crea tu avatar. Así te verás en el menú y en tu cuaderno." />
      <div className="profile-grid">
        <section className="card avatar-stage">
          <Avatar cfg={cfg} size={200} className="bob" />
          <h2>stray</h2>
          <p className="muted">{li.title} · nivel {li.level}</p>
          <div className="avatar-actions">
            <button className="btn btn-primary" disabled={!dirty} onClick={() => actions.setAvatar(cfg)}><Icon name="check" size={16} /> Guardar avatar</button>
            <button className="btn btn-ghost" onClick={randomize}><Icon name="sparkle" size={16} /> Sorpréndeme</button>
            {dirty && <button className="btn btn-ghost" onClick={() => setCfg(p.avatar)}>Deshacer</button>}
            <button className="btn btn-ghost" onClick={() => setCfg(DEFAULT_AVATAR)}>Original</button>
          </div>
        </section>

        <section className="card builder">
          <div className="opt"><h4>Color del pelaje</h4><Swatches k="fur" colors={FURS} /></div>
          {OPTIONS.slice(0, 1).map((o) => <Opt key={o.key} o={o} cfg={cfg} upd={upd} />)}
          {OPTIONS.slice(1, 2).map((o) => <Opt key={o.key} o={o} cfg={cfg} upd={upd} />)}
          {OPTIONS.slice(2, 3).map((o) => <Opt key={o.key} o={o} cfg={cfg} upd={upd} />)}
          <div className="opt"><h4>Color de ojos</h4><Swatches k="eyeColor" colors={EYE_COLORS} /></div>
          {OPTIONS.slice(3).map((o) => <Opt key={o.key} o={o} cfg={cfg} upd={upd} />)}
          <div className="opt"><h4>Fondo</h4><Swatches k="bg" colors={BGS} /></div>
        </section>
      </div>

      <section className="card">
        <h2 className="card-t">Tu historial en números</h2>
        <XpBar xp={p.xp} />
        <div className="numbers">
          <div><strong>{p.xp}</strong><span>XP totales</span></div>
          <div><strong>{st.solved}</strong><span>ejercicios resueltos</span></div>
          <div><strong>{st.attempts}</strong><span>evaluaciones</span></div>
          <div><strong>{st.runs}</strong><span>ejecuciones</span></div>
          <div><strong>{sk.longest}</strong><span>mejor racha</span></div>
          <div><strong>{Object.keys(p.badges).filter((b) => !b.startsWith('_')).length}</strong><span>insignias</span></div>
        </div>
      </section>
    </div>
  )
}

function Opt({ o, cfg, upd }: { o: (typeof OPTIONS)[number]; cfg: AvatarConfig; upd: (p: Partial<AvatarConfig>) => void }) {
  return (
    <div className="opt">
      <h4>{o.label}</h4>
      <div className="seg seg-wrap" role="group">
        {o.values.map(([v, l]) => (
          <button key={v} className={cfg[o.key] === v ? 'is-on' : ''} onClick={() => upd({ [o.key]: v } as Partial<AvatarConfig>)}>{l}</button>
        ))}
      </div>
    </div>
  )
}
