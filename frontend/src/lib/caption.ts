/**
 * Normalises post captions for display. Some API paths store JSON strings
 * like `{ "caption": "..." }`, arrays, markdown fences (`"""json`), or plain text.
 */

/** Strip markdown / model fences so JSON.parse can run */
function normalizeCaptionRaw(raw: string): string {
  let s = raw.trim()
  if (!s) return s

  // Triple-quoted blocks (common from LLM output)
  if (s.startsWith('"""')) {
    s = s.slice(3).trim()
    if (s.toLowerCase().startsWith('json')) {
      s = s.slice(4).trim()
    }
    if (s.endsWith('"""')) {
      s = s.slice(0, -3).trim()
    }
  }

  // Markdown code fences
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im
  const m = s.match(fence)
  if (m?.[1]) {
    s = m[1].trim()
  } else if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
  }

  // Inline """json prefix without full wrap
  s = s.replace(/^["']{0,3}json\s*/i, '').trim()

  return s.trim()
}

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

/** Try to find first `{...}` JSON object in noisy strings */
function extractEmbeddedJsonObject(s: string): string | null {
  const start = s.indexOf('{')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        const slice = s.slice(start, i + 1)
        try {
          const parsed = JSON.parse(slice) as unknown
          return extractFromParsed(parsed)
        } catch {
          return null
        }
      }
    }
  }
  return null
}

export function displayCaption(raw: string | null | undefined, fallback = ''): string {
  if (raw == null || raw === '') return fallback
  const normalized = normalizeCaptionRaw(String(raw))
  if (!normalized) return fallback

  if (normalized.startsWith('{') || normalized.startsWith('[')) {
    try {
      const parsed = JSON.parse(normalized) as unknown
      const extracted = extractFromParsed(parsed)
      if (extracted && !extracted.startsWith('{')) return extracted
      if (extracted) return extracted
    } catch {
      const embedded = extractEmbeddedJsonObject(normalized)
      if (embedded) return embedded
    }
  }

  const embedded = extractEmbeddedJsonObject(normalized)
  if (embedded) return embedded

  return normalized
}

/** Alias for doc/spec naming — same as `displayCaption`. */
export const parseCaption = displayCaption
