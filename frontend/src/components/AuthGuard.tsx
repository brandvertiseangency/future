'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

/**
 * Client-side auth guard. Redirects to /auth?redirect=<current path> when not authenticated.
 * Also skips onboarding if already complete when landing on /onboarding.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
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
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>
    )
  }

  return <>{children}</>
}
