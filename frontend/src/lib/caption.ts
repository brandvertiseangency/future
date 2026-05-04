/**
 * Normalises post captions for display. Some API paths store JSON strings
 * like `{ "caption": "..." }` instead of plain text.
 */
export function displayCaption(raw: string | null | undefined, fallback = ''): string {
  if (raw == null || raw === '') return fallback
  const s = String(raw).trim()
  if (!s) return fallback
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const o = parsed as Record<string, unknown>
        const c = o.caption ?? o.text ?? o.body
        if (typeof c === 'string' && c.trim()) return c.trim()
      }
    } catch {
      /* not JSON */
    }
  }
  return s
}
