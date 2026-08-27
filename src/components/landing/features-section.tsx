import React from 'react'

/*
  Trust section — matched to Figma spec:
  - Section: #09090A bg, 1px top border #CBD5E1, 736px min height
  - Heading: Public Sans 700 32/48, #FFFFFF
  - Subtitle: Public Sans 400 16/24, #FFFFFF
  - Cards: 285x164, #16161D bg, 6px left border, 12px radius, 20px gap
  - Numbers: Plus Jakarta Sans 800 40/48 — #15803D / #B45309 / #1A6FCA / #A31A1A
  - Labels: IBM Plex Mono 400 14/20, #CCCCCC
  - Sub-labels: Plus Jakarta Sans 600 14/20, #FFFFFF
  Requires fonts: Public Sans, Plus Jakarta Sans, IBM Plex Mono
*/

const STATS = [
  { value: '10,000+', label: 'DATASETS AVAILABLE', sub: 'Across all categories', color: '#15803D' },
  { value: '50+', label: 'INDUSTRIES COVERED', sub: 'Healthcare to Legal', color: '#B45309' },
  { value: '150+', label: 'COUNTRIES', sub: 'Global data coverage', color: '#1A6FCA' },
  { value: '500+', label: 'ENTERPRISE BUYERS', sub: 'Trust upgence data', color: '#A31A1A' },
]

export function FeaturesSection() {
  return (
    <section
      className="w-full text-white"
      style={{
        background: '#09090A',
        borderTop: '1px solid #CBD5E1',
        minHeight: 736,
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-5">

        {/* Shield graphic — 366x200 cluster */}
        <div className="relative mb-16 h-[200px] w-[367px] select-none">
          {/* Left gold shield (key / access) — rotate -15deg */}
          <div
            className="absolute z-10 filter drop-shadow-[0_12px_24px_rgba(246,196,83,0.3)] transition-transform duration-300 hover:scale-105"
            style={{ width: 168.42, height: 168.42, left: -19, top: -4, transform: 'rotate(-15deg)' }}
          >
            <GoldShield icon="key" gradientId="goldL" />
          </div>

          {/* Right gold shield (nodes / security) — rotate 15deg */}
          <div
            className="absolute z-10 filter drop-shadow-[0_12px_24px_rgba(246,196,83,0.3)] transition-transform duration-300 hover:scale-105"
            style={{ width: 168.42, height: 168.42, left: 179, top: -4, transform: 'rotate(15deg)' }}
          >
            <GoldShield icon="nodes" gradientId="goldR" />
          </div>

          {/* Center blue shield (caduceus / compliance) */}
          <div
            className="absolute z-20 filter drop-shadow-[0_16px_32px_rgba(37,99,235,0.45)] transition-transform duration-300 hover:scale-105"
            style={{ width: 189.47, height: 200, left: 88.42, top: 0 }}
          >
            <BlueShield />
          </div>
        </div>

        {/* Heading */}
        <h2
          className="text-center"
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: '48px',
            color: '#FFFFFF',
            marginBottom: 12,
            maxWidth: 854,
          }}
        >
          Human-Verified, Scalable &amp; Secure Datasets
        </h2>
        <p
          className="text-center"
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '24px',
            color: '#FFFFFF',
            marginBottom: 64,
            maxWidth: 854,
          }}
        >
          Every dataset is reviewed by domain experts, encrypted end to end, and access controlled from day one
        </p>

        {/* Stat cards */}
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col justify-center"
              style={{
                minHeight: 164,
                background: '#16161D',
                borderLeft: `6px solid ${s.color}`,
                borderRadius: 12,
                paddingLeft: 18,
                paddingRight: 16,
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 40,
                  lineHeight: '48px',
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#CCCCCC',
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#FFFFFF',
                  }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Shields ---------- */

const SHIELD_PATH =
  'M50 6 L88 20 V52 C88 74 72 89 50 96 C28 89 12 74 12 52 V20 Z'
const SHIELD_INNER =
  'M50 13 L81 24.5 V52 C81 70 68 82.5 50 88.5 C32 82.5 19 70 19 52 V24.5 Z'

function GoldShield({ icon, gradientId }: { icon: 'key' | 'nodes'; gradientId: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${gradientId}-glow`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="rgba(246,196,83,0.35)" />
          <stop offset="100%" stopColor="rgba(246,196,83,0)" />
        </radialGradient>
        <linearGradient id={`${gradientId}-outer`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF6E0" />
          <stop offset="100%" stopColor="#E0C184" />
        </linearGradient>
        <linearGradient id={`${gradientId}-inner`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF6E0" />
          <stop offset="45%" stopColor="#F2D9A4" />
          <stop offset="100%" stopColor="#C99A4F" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="47" r="47" fill={`url(#${gradientId}-glow)`} />
      <path d={SHIELD_PATH} fill={`url(#${gradientId}-outer)`} />
      <path d={SHIELD_INNER} fill={`url(#${gradientId}-inner)`} />
      {icon === 'key' ? (
        <g stroke="#8A611F" strokeWidth="3.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="42" cy="58" r="8" />
          <path d="M48 52 L66 34" />
          <path d="M61 39 L67 45" />
          <path d="M66 34 L70 38" />
        </g>
      ) : (
        <g stroke="#8A611F" strokeWidth="1.6" fill="none">
          <path d="M50 32 L66 41 L66 59 L50 68 L34 59 L34 41 Z" />
          <circle cx="50" cy="32" r="3.2" fill="#8A611F" stroke="none" />
          <circle cx="66" cy="41" r="3.2" fill="#8A611F" stroke="none" />
          <circle cx="66" cy="59" r="3.2" fill="#8A611F" stroke="none" />
          <circle cx="50" cy="68" r="3.2" fill="#8A611F" stroke="none" />
          <circle cx="34" cy="59" r="3.2" fill="#8A611F" stroke="none" />
          <circle cx="34" cy="41" r="3.2" fill="#8A611F" stroke="none" />
          <circle cx="52" cy="50" r="3.2" fill="#8A611F" stroke="none" />
          <path d="M52 50 L50 32 M52 50 L66 59 M52 50 L34 59" />
        </g>
      )}
    </svg>
  )
}

function BlueShield() {
  return (
    <svg viewBox="0 0 95 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="blue-glow" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="rgba(59,157,255,0.45)" />
          <stop offset="100%" stopColor="rgba(59,157,255,0)" />
        </radialGradient>
        <linearGradient id="blue-outer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFF0FF" />
          <stop offset="100%" stopColor="#3F7FD6" />
        </linearGradient>
        <linearGradient id="blue-inner" x1="4%" y1="0%" x2="96%" y2="100%">
          <stop offset="4.44%" stopColor="#7FD4FF" />
          <stop offset="45.44%" stopColor="#2F9BEA" />
          <stop offset="95.56%" stopColor="#1E4FD6" />
        </linearGradient>
      </defs>
      <circle cx="47.5" cy="45" r="46" fill="url(#blue-glow)" />
      <path
        d="M47.5 8 L79 20 V50 C79 70 65.5 83.5 47.5 90 C29.5 83.5 16 70 16 50 V20 Z"
        fill="url(#blue-outer)"
      />
      <path
        d="M47.5 14 L73.5 24 V50 C73.5 66.5 62.5 78 47.5 84 C32.5 78 21.5 66.5 21.5 50 V24 Z"
        fill="url(#blue-inner)"
      />
      {/* Caduceus */}
      <g fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
        <path d="M47.5 30 V66" />
        {/* wings */}
        <path d="M47.5 33 C42 27 34 28 33 32 C36 34 43 34.5 47.5 33 Z" fill="#FFFFFF" stroke="none" />
        <path d="M47.5 33 C53 27 61 28 62 32 C59 34 52 34.5 47.5 33 Z" fill="#FFFFFF" stroke="none" />
        {/* entwined snakes */}
        <path d="M41 38 C41 42 54 42 54 46 C54 50 41 50 41 54 C41 58 54 58 54 62" />
        <path d="M54 38 C54 42 41 42 41 46 C41 50 54 50 54 54 C54 58 41 58 41 62" />
      </g>
      <circle cx="47.5" cy="28.5" r="2.6" fill="#FFFFFF" />
    </svg>
  )
}