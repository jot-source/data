/**
 * Converts a human title into a URL/storage-safe slug.
 *
 * Lowercase, strip everything except letters/digits/space/hyphen, then collapse
 * runs of whitespace into single hyphens — e.g. "NSE Ticks 2024!" → "nse-ticks-2024".
 *
 * Shared on purpose: the dataset create route, the upload-URL route, and the
 * storage service all derive object keys from the same title, so they MUST agree
 * on the exact slug. Keep this the single source of truth.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
