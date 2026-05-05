/**
 * Normalises post captions for display. Some API paths store JSON strings
 * like `{ "caption": "..." }`, arrays, or plain text.
 */

function extractFromParsed(parsed: unknown): string | null {
  if (parsed == null) return null
  if (typeof parsed === 'string') {
    const t = parsed.trim()
    return t || null
  }
  if (Array.isArray(parsed) && parsed.length > 0) {
    const first = parsed[0]
    if (typeof first === 'string') return first.trim() || null
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const o = first as Record<string, unknown>
      const c = o.caption ?? o.text ?? o.body
      if (typeof c === 'string' && c.trim()) return c.trim()
    }
  }
  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    const o = parsed as Record<string, unknown>
    const c = o.caption ?? o.text ?? o.body
    if (typeof c === 'string' && c.trim()) return c.trim()
    try {
      return JSON.stringify(parsed, null, 2)
    } catch {
      return String(parsed)
    }
  }
  return null
}

export function displayCaption(raw: string | null | undefined, fallback = ''): string {
  if (raw == null || raw === '') return fallback
  const s = String(raw).trim()
  if (!s) return fallback
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s) as unknown
      const extracted = extractFromParsed(parsed)
      if (extracted) return extracted
    } catch {
      /* not JSON */
    }
  }
  return s
}

/** Alias for doc/spec naming — same as `displayCaption`. */
export const parseCaption = displayCaption
