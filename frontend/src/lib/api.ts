import { getFirebaseAuth } from './firebase'

// In production (Vercel) NEXT_PUBLIC_API_URL points to the backend Vercel project.
// In local dev it points to http://localhost:4000.
// Strip any trailing slash to prevent double-slash URLs like //api/users/me
const _envUrl = process.env.NEXT_PUBLIC_API_URL
const API_BASE =
  (_envUrl && _envUrl.trim() !== '')
    ? _envUrl.trim().replace(/\/$/, '')
    : (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? ''
        : 'http://localhost:4000')

if (typeof window !== 'undefined' && API_BASE === '') {
  const host = window.location.hostname
  if (host !== 'localhost' && host !== '127.0.0.1') {
    console.warn(
      '[api] NEXT_PUBLIC_API_URL is unset — API calls use same-origin /api. On Vercel, set NEXT_PUBLIC_API_URL to your backend base URL, or set BACKEND_ORIGIN for next.config rewrites.'
    )
  }
}

async function getFirebaseToken(): Promise<string | null> {
  try {
    const auth = getFirebaseAuth()
    const user = auth?.currentUser
    if (!user) return null
    return await user.getIdToken()
  } catch {
    return null
  }
}

const DEFAULT_TIMEOUT_MS = 15000

/** AI-heavy routes (calendar plan, image generation) often exceed 15s; use this for those calls. */
export const AI_REQUEST_TIMEOUT_MS = 120_000

export type ApiCallOptions = RequestInit & { timeoutMs?: number }

function requestInitWithoutTimeout(options?: ApiCallOptions): RequestInit {
  if (!options) return {}
  const copy: RequestInit & { timeoutMs?: number } = { ...options }
  delete copy.timeoutMs
  return copy
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  let didTimeout = false
  const timeoutId = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, timeoutMs)
  const externalSignal = init.signal
  const onExternalAbort = () => controller.abort()

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true })
    }
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (didTimeout && error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`)
    }
    throw error
  } finally {
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort)
    }
    clearTimeout(timeoutId)
  }
}

export async function apiCall<T = unknown>(
  path: string,
  options?: ApiCallOptions
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const init = requestInitWithoutTimeout(options)
  const token = await getFirebaseToken()
  let res: Response
  try {
    res = await fetchWithTimeout(
      `${API_BASE}${path}`,
      {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      },
      timeoutMs
    )
  } catch (error) {
    throw error
  }

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiUpload(path: string, formData: FormData, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
  const token = await getFirebaseToken()
  let res: Response
  try {
    res = await fetchWithTimeout(
      `${API_BASE}${path}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      timeoutMs
    )
  } catch (error) {
    throw error
  }

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
