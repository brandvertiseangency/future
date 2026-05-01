'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

// TEMPORARY: demo bypass to share app without login.
const DEMO_AUTH_BYPASS = true

/**
 * Client-side auth guard. Redirects to /auth?redirect=<current path> when not authenticated.
 * Also skips onboarding if already complete when landing on /onboarding.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  if (DEMO_AUTH_BYPASS) return <>{children}</>

  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      // Not authenticated — redirect, preserving return URL
      const params = pathname !== '/dashboard' ? `?redirect=${encodeURIComponent(pathname)}` : ''
      router.replace(`/auth${params}`)
    }
  }, [user, loading, pathname, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[var(--ai-color)]" />
      </div>
    )
  }

  return <>{children}</>
}
