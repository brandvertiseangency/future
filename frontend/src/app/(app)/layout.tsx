'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import { Sidebar } from '@/components/app/sidebar'
import { Topbar } from '@/components/app/topbar'
import { BottomTabBar } from '@/components/app/bottom-tab-bar'
import { Toaster } from 'sonner'

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Topbar — adapts left offset on mobile */}
      <Topbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="md:ml-[220px] pt-16 pb-20 md:pb-0 min-h-screen"
      >
        {children}
      </motion.main>
      {/* Mobile bottom tab bar — hidden on desktop */}
      <div className="md:hidden">
        <BottomTabBar />
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  )
}
