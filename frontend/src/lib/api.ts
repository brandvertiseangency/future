import { getFirebaseAuth } from './firebase'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

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
