'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { useTheme } from 'next-themes'
import { Sidebar } from '@/components/app/sidebar'
import { BottomTabBar } from '@/components/app/bottom-tab-bar'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/components/AuthGuard'
import { PageErrorBoundary } from '@/components/ErrorBoundary'
import { CommandPalette } from '@/components/command-palette'
import { ContentPolicyModal } from '@/components/app/content-policy-modal'
import Grainient from '@/components/effects/grainient'
import { useBrandStore } from '@/stores/brand'
import { apiCall } from '@/lib/api'
import { MOTION_TRANSITIONS } from '@/lib/motion'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const isDashboardRoute = pathname === '/dashboard'
  const { resolvedTheme } = useTheme()
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
    <SidebarProvider defaultOpen>
      <div className="min-h-screen bg-background text-foreground">
      {!isOnboardingRoute ? (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      ) : null}
      {isDashboardRoute ? (
        <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-0 md:left-[74px]">
          <Grainient
            color1="#003bff"
            color2="#2578f5"
            color3="#001faa"
            timeSpeed={0.85}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={3.2}
            warpAmplitude={28}
            blendAngle={22}
            blendSoftness={0.05}
            rotationAmount={360}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated
            contrast={1.5}
            gamma={1.35}
            saturation={1}
            centerX={0}
            centerY={-0.47}
            zoom={0.85}
          />
        </div>
      ) : null}
      <SidebarInset className={isOnboardingRoute ? 'md:ml-0' : undefined}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_TRANSITIONS.page}
        className={
          isOnboardingRoute
            ? 'min-h-screen relative z-10'
            : isDashboardRoute
              ? 'pt-4 pb-24 md:pb-6 md:pt-6 min-h-screen relative z-10 bv-grainient-canvas'
              : 'pt-4 pb-24 md:pb-6 md:pt-6 min-h-screen relative z-10'
        }
      >
        {!isOnboardingRoute ? (
          <div className="mb-2 hidden px-4 md:block">
            <SidebarTrigger />
          </div>
        ) : null}
        <PageErrorBoundary>{children}</PageErrorBoundary>
      </motion.main>
      </SidebarInset>
      {!isOnboardingRoute ? (
        <div className="md:hidden">
          <BottomTabBar />
        </div>
      ) : null}
      <Toaster theme={(resolvedTheme as 'light' | 'dark' | 'system') ?? 'system'} position="bottom-right" />
      <CommandPalette />
      <ContentPolicyModal />
      </div>
    </SidebarProvider>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
