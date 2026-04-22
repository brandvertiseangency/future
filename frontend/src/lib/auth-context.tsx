'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User,
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { getFirebaseAuth } from './firebase'
import { apiCall } from './api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  sendVerification: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

/** Persist Firebase ID token as a session cookie so middleware can read it. */
async function setSessionCookie(user: User) {
  try {
    const token = await user.getIdToken()
    document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`
  } catch { /* best-effort */ }
}

function clearSessionCookie() {
  document.cookie = '__session=; path=/; max-age=0'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const registerWithBackend = async (_u: User) => {
    try {
      await apiCall('/api/user/register', { method: 'POST', body: JSON.stringify({ plan: 'free' }) })
    } catch { /* 409 user already exists — swallow */ }
  }

  /** After any sign-in, check if onboarding is complete and route accordingly. */
  const routeAfterAuth = async (u: User, isNewUser = false) => {
    await setSessionCookie(u)
    if (isNewUser) {
      router.push('/onboarding')
      return
    }
    try {
      const data = await apiCall<{ user: { onboarding_complete?: boolean } }>('/api/users/me')
      if (data?.user?.onboarding_complete) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    } catch {
      // If we can't verify onboarding status, default to onboarding —
      // it's safer to re-check than to skip it entirely.
      router.push('/onboarding')
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) { setLoading(false); return }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // Refresh session cookie on every auth state change (token may have rotated)
        await setSessionCookie(firebaseUser)
      } else {
        clearSessionCookie()
      }
      setLoading(false)
    })
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase not configured')
    const { user: u } = await signInWithEmailAndPassword(auth, email, password)
    await setSessionCookie(u)
    // Register (idempotent — 409 is fine)
    await registerWithBackend(u)
    await routeAfterAuth(u, false)
  }

  const signUp = async (email: string, password: string, name: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase not configured')
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(u, { displayName: name })
    // Send verification email (don't block on it)
    sendEmailVerification(u).catch(() => {})
    await setSessionCookie(u)
    await registerWithBackend(u)
    router.push('/onboarding')
  }

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase not configured')
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime
    await registerWithBackend(result.user)
    await routeAfterAuth(result.user, isNewUser)
  }

  const signOut = async () => {
    const auth = getFirebaseAuth()
    if (!auth) return
    await firebaseSignOut(auth)
    clearSessionCookie()
    router.push('/auth')
  }

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase not configured')
    await sendPasswordResetEmail(auth, email)
  }

  const sendVerification = async () => {
    const auth = getFirebaseAuth()
    const u = auth?.currentUser
    if (!u) throw new Error('Not signed in')
    await sendEmailVerification(u)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword, sendVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
