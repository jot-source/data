// components/landing/brand-marks.tsx
// Lightweight inline recreations of the "trusted by" brand marks so the strip
// renders without external logo assets. These are stylized placeholders — swap
// for official SVG/PNG assets (e.g. in /public/logos) if pixel-accuracy matters.

/** Radiating "sunburst" of tapered spokes — used for Claude and Fireworks. */
function Burst({ color, spokes = 12 }: { color: string; spokes?: number }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[46px] w-[46px]" aria-hidden="true">
      {Array.from({ length: spokes }).map((_, i) => (
        <rect
          key={i}
          x="22.8"
          y="4"
          width="2.4"
          height="17"
          rx="1.2"
          fill={color}
          transform={`rotate(${(360 / spokes) * i} 24 24)`}
        />
      ))}
    </svg>
  )
}

export function SamsungMark() {
  return (
    <svg viewBox="0 0 160 54" className="h-[26px] w-auto" role="img" aria-label="Samsung">
      <ellipse cx="80" cy="27" rx="80" ry="26" fill="#1428A0" />
      <text
        x="80"
        y="36"
        textAnchor="middle"
        fontFamily="'Public Sans', sans-serif"
        fontSize="23"
        fontStyle="italic"
        fontWeight="700"
        letterSpacing="1.5"
        fill="#FFFFFF"
      >
        SAMSUNG
      </text>
    </svg>
  )
}

export function UberMark() {
  return (
    <span className="font-public-sans text-[28px] font-bold leading-none tracking-[-0.02em] text-black">
      Uber
    </span>
  )
}

export function OpenAIMark() {
  return (
    <svg viewBox="-26 -26 52 52" className="h-[46px] w-[46px]" role="img" aria-label="OpenAI">
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse
          key={i}
          rx="8"
          ry="16"
          fill="none"
          stroke="#000000"
          strokeWidth="2.4"
          transform={`rotate(${i * 60})`}
        />
      ))}
    </svg>
  )
}

export function ClaudeMark() {
  return <Burst color="#D97757" spokes={12} />
}

export function FireworksMark() {
  return <Burst color="#111111" spokes={8} />
}
