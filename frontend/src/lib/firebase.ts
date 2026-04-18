import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let _app: FirebaseApp | null = null
let _auth: Auth | null = null

function hasRealConfig() {
  return (
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your-api-key-here' &&
    !!firebaseConfig.projectId
  )
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasRealConfig()) return null
  if (_app) return _app
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  return _app
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp()
  if (!app) return null
  if (_auth) return _auth
  _auth = getAuth(app)
  return _auth
}

// Lazy Analytics — only runs in browser, only when Firebase is configured
export async function getFirebaseAnalytics() {
  if (typeof window === 'undefined') return null
  const app = getFirebaseApp()
  if (!app) return null
  const { getAnalytics } = await import('firebase/analytics')
  return getAnalytics(app)
}

// Proxy so existing `auth` imports keep working gracefully
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const a = getFirebaseAuth()
    if (!a) return undefined
    return (a as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export default { getFirebaseApp, getFirebaseAuth, getFirebaseAnalytics }
