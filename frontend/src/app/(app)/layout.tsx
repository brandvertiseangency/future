'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import useSWR from 'swr'
import { Sidebar } from '@/components/app/sidebar'
import { Topbar } from '@/components/app/topbar'
import { BottomTabBar } from '@/components/app/bottom-tab-bar'
import { WorkflowProgress } from '@/components/app/workflow-progress'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/components/AuthGuard'
import { PageErrorBoundary } from '@/components/ErrorBoundary'
import { CommandPalette } from '@/components/command-palette'
import { useBrandStore } from '@/stores/brand'
import { apiCall } from '@/lib/api'
import { MOTION_TRANSITIONS } from '@/lib/motion'

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const { setBrand } = useBrandStore()
  const { data: brandData } = useSWR(
    '/api/brands/current',
    (url: string) => apiCall<{ brand?: { id?: string; name?: string; website?: string; industry?: string; description?: string; goals?: string[] } }>(url),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    const brand = brandData?.brand
    if (!brand?.name) return
    setBrand({
      id: String(brand.id ?? 'default'),
      name: brand.name,
      website: brand.website ?? '',
      industry: brand.industry ?? '',
      voice: brand.description ?? '',
      goals: Array.isArray(brand.goals) ? brand.goals : [],
    })
  }, [brandData?.brand, setBrand])

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      {!isOnboardingRoute ? (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      ) : null}
      {!isOnboardingRoute ? <Topbar /> : null}
      {!isOnboardingRoute ? <WorkflowProgress /> : null}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_TRANSITIONS.page}
        className={isOnboardingRoute ? 'min-h-screen' : 'md:ml-[240px] pt-[96px] pb-20 md:pb-0 min-h-screen'}
      >
        <PageErrorBoundary>{children}</PageErrorBoundary>
      </motion.main>
      {!isOnboardingRoute ? (
        <div className="md:hidden">
          <BottomTabBar />
        </div>
      ) : null}
      <Toaster theme="light" position="bottom-right" />
      <CommandPalette />
    </div>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </ThemeProvider>
  )
}
