type UxEventPayload = Record<string, string | number | boolean | null | undefined>

export function logUxEvent(event: string, payload: UxEventPayload = {}) {
  const data = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    const w = window as Window & { __brandvertiseUxEvents?: typeof data[] }
    w.__brandvertiseUxEvents = w.__brandvertiseUxEvents ?? []
    w.__brandvertiseUxEvents.push(data)
  }
  // Lightweight default sink; swap with analytics provider later.
  console.debug('[ux-event]', data)
}

