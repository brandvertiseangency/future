'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import { Sidebar } from '@/components/app/sidebar'
import { Topbar } from '@/components/app/topbar'
import { BottomTabBar } from '@/components/app/bottom-tab-bar'
import { Toaster } from 'sonner'
import { AuthGuard } from '@/components/AuthGuard'
import { PageErrorBoundary } from '@/components/ErrorBoundary'
import { CommandPalette } from '@/components/command-palette'

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <Topbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="md:ml-[240px] pt-16 pb-20 md:pb-0 min-h-screen"
      >
        <PageErrorBoundary>{children}</PageErrorBoundary>
      </motion.main>
      <div className="md:hidden">
        <BottomTabBar />
      </div>
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
