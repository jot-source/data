// utils/format.ts — small display formatters shared by dataset cards.

/** 1_800_000 → "1.8M", 900_000 → "900K", 42 → "42". */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value
  )
}

/** ISO timestamp → "30d ago" / "2h ago" / "just now". Coarse on purpose — the
 * card only needs a rough freshness signal, not exact elapsed time. */
export function formatRelativeTime(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

/** 2-letter ISO country code → its flag emoji (regional indicator symbols),
 * e.g. "US" → 🇺🇸. Falls back to the raw code if it isn't exactly 2 letters. */
export function countryFlag(code: string): string {
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return code
  const OFFSET = 127397 // regional indicator 'A' (U+1F1E6) - 'A' (U+0041)
  return String.fromCodePoint(...[...normalized].map((c) => c.charCodeAt(0) + OFFSET))
}
