import { useId } from 'react'
import type { AvatarConfig } from '@/types'

export const FURS = ['#ff8a3d', '#8b93a7', '#2b2f3a', '#f2e3c6', '#c48b5a', '#e8e6e1']
export const BGS = ['#ffe9d1', '#d9f3ee', '#e5defc', '#ffdce5', '#dbeafe', '#fdf0b6']
export const EYE_COLORS = ['#2dd4bf', '#f5b301', '#4ade80', '#60a5fa', '#e879f9', '#f87171']

const DARK = '#1b1e27'

function Ears({ cfg }: { cfg: AvatarConfig }) {
  const fur = cfg.fur
  if (cfg.ears === 'round')
    return (
      <>
        <circle cx="30" cy="34" r="17" fill={fur} />
        <circle cx="90" cy="34" r="17" fill={fur} />
        <circle cx="30" cy="34" r="9" fill="#f6a5b6" opacity=".85" />
        <circle cx="90" cy="34" r="9" fill="#f6a5b6" opacity=".85" />
      </>
    )
  if (cfg.ears === 'folded')
    return (
      <>
        <path d="M20 54 L22 22 Q34 20 54 38Z" fill={fur} />
        <path d="M100 54 L98 22 Q86 20 66 38Z" fill={fur} />
        <path d="M26 44 L27 28 Q34 28 44 38Z" fill="#f6a5b6" opacity=".85" />
        <path d="M94 44 L93 28 Q86 28 76 38Z" fill="#f6a5b6" opacity=".85" />
      </>
    )
  return (
    <>
      <path d="M20 56 L28 12 L58 36Z" fill={fur} />
      <path d="M100 56 L92 12 L62 36Z" fill={fur} />
      <path d="M28 46 L31 24 L47 36Z" fill="#f6a5b6" opacity=".85" />
      <path d="M92 46 L89 24 L73 36Z" fill="#f6a5b6" opacity=".85" />
    </>
  )
}

function Pattern({ cfg }: { cfg: AvatarConfig }) {
  if (cfg.pattern === 'stripes')
    return <path d="M60 32v13M49 34l3 11M71 34l-3 11M24 62h9M26 70h8M96 62h-9M94 70h-8" stroke={DARK} strokeOpacity=".28" strokeWidth="3.4" strokeLinecap="round" />
  if (cfg.pattern === 'patch') return <ellipse cx="42" cy="60" rx="17" ry="15" fill={DARK} fillOpacity=".2" />
  if (cfg.pattern === 'tuxedo')
    return (
      <>
        <path d="M60 36 Q50 60 40 82 Q60 104 80 82 Q70 60 60 36Z" fill="#fffdf7" />
      </>
    )
  return null
}

function Eyes({ cfg }: { cfg: AvatarConfig }) {
  const L = 43
  const R = 77
  const y = 64
  if (cfg.eyes === 'happy')
    return <path d={`M${L - 7} ${y + 2} q7 -10 14 0M${R - 7} ${y + 2} q7 -10 14 0`} stroke={DARK} strokeWidth="3.6" strokeLinecap="round" fill="none" />
  if (cfg.eyes === 'sleepy')
    return (
      <>
        <path d={`M${L - 7} ${y} h14M${R - 7} ${y} h14`} stroke={DARK} strokeWidth="3.6" strokeLinecap="round" />
        <path d={`M${L - 6} ${y + 3} q6 5 12 0M${R - 6} ${y + 3} q6 5 12 0`} stroke={cfg.eyeColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </>
    )
  if (cfg.eyes === 'star') {
    const star = (cx: number) => `M${cx} ${y - 9} l2.6 5.6 6 .8 -4.4 4.2 1.1 6 -5.3 -2.9 -5.3 2.9 1.1 -6 -4.4 -4.2 6 -.8z`
    return (
      <>
        <path d={star(L)} fill={cfg.eyeColor} stroke={DARK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d={star(R)} fill={cfg.eyeColor} stroke={DARK} strokeWidth="1.6" strokeLinejoin="round" />
      </>
    )
  }
  return (
    <g className="cat-eyes">
      {[L, R].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y} rx="8" ry="9.5" fill={cfg.eyeColor} />
          <ellipse cx={cx} cy={y} rx="3.4" ry="7" fill={DARK} />
          <circle cx={cx + 2.6} cy={y - 3.6} r="2.2" fill="#fff" />
        </g>
      ))}
    </g>
  )
}

function Accessory({ cfg }: { cfg: AvatarConfig }) {
  switch (cfg.accessory) {
    case 'glasses':
      return (
        <g fill="none" stroke={DARK} strokeWidth="3">
          <circle cx="43" cy="64" r="13" fill="#fff" fillOpacity=".18" />
          <circle cx="77" cy="64" r="13" fill="#fff" fillOpacity=".18" />
          <path d="M56 64h8M30 62l-8-4M90 62l8-4" strokeLinecap="round" />
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M22 66 C18 22 102 22 98 66" fill="none" stroke="#3b4255" strokeWidth="6" strokeLinecap="round" />
          <rect x="12" y="56" width="14" height="26" rx="6" fill="#ff5d73" />
          <rect x="94" y="56" width="14" height="26" rx="6" fill="#ff5d73" />
        </g>
      )
    case 'scarf':
      return (
        <g>
          <path d="M26 94 Q60 112 94 94 L96 106 Q60 124 24 106Z" fill="#e5484d" />
          <path d="M74 104 L82 124 L94 120 L88 102Z" fill="#c93a3f" />
          <path d="M32 100 l4 8 M46 104 l3 8 M60 106 l2 8" stroke="#fff" strokeOpacity=".45" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M26 46 Q60 -2 94 46 Q60 38 26 46Z" fill="#4c6ef5" />
          <path d="M24 46 Q60 36 96 46 L100 52 Q60 42 20 52Z" fill="#3b57d6" />
          <circle cx="60" cy="14" r="4" fill="#fff" />
        </g>
      )
    case 'bowtie':
      return (
        <g>
          <path d="M60 100 L42 92 V110Z" fill="#7c5cff" />
          <path d="M60 100 L78 92 V110Z" fill="#7c5cff" />
          <circle cx="60" cy="101" r="4.5" fill="#5b3fe0" />
        </g>
      )
    default:
      return null
  }
}

export function Avatar({ cfg, size = 96, rounded = true, className = '' }: { cfg: AvatarConfig; size?: number; rounded?: boolean; className?: string }) {
  const id = useId()
  return (
    <svg className={`avatar ${className}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Avatar de gato">
      <defs>
        <clipPath id={id}>
          <rect width="120" height="120" rx={rounded ? 30 : 0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="120" height="120" fill={cfg.bg} />
        <circle cx="96" cy="24" r="26" fill="#fff" opacity=".35" />
        <Ears cfg={cfg} />
        <ellipse cx="60" cy="68" rx="40" ry="34" fill={cfg.fur} />
        <Pattern cfg={cfg} />
        {cfg.pattern === 'tuxedo' && <ellipse cx="60" cy="82" rx="18" ry="12" fill="#fffdf7" />}
        <Eyes cfg={cfg} />
        <path d="M55.5 76 h9 l-4.5 5z" fill="#f08aa0" stroke={DARK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M60 81 v3 M60 84 q-5 5 -10.5 1 M60 84 q5 5 10.5 1" stroke={DARK} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M30 78 h-14 M31 84 l-13 5 M90 78 h14 M89 84 l13 5" stroke={DARK} strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
        <Accessory cfg={cfg} />
      </g>
    </svg>
  )
}
