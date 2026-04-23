import { getFirebaseAuth } from './firebase'

// In production (Vercel) NEXT_PUBLIC_API_URL is unset — vercel.json rewrites /api/* to Railway.
// In local dev it points to http://localhost:4000.
// Treat empty string same as unset so the next.config.ts env override doesn't break local dev.
const _envUrl = process.env.NEXT_PUBLIC_API_URL
const API_BASE =
  (_envUrl && _envUrl.trim() !== '')
    ? _envUrl
    : (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? ''
        : 'http://localhost:4000')

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

export async function apiCall<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getFirebaseToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiUpload(path: string, formData: FormData): Promise<unknown> {
  const token = await getFirebaseToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
