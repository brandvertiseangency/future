'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Sparkles, Images, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/generate', label: 'Generate', icon: Sparkles, primary: true },
  { href: '/assets', label: 'Assets', icon: Images },
  { href: '/settings', label: 'Settings', icon: Settings2 },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-[var(--sidebar-bg)]/95 backdrop-blur-xl
                 border-t border-[var(--sidebar-border)]
                 flex items-center justify-around px-2 pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', paddingTop: 8 }}
    >
      {TABS.map(({ href, label, icon: Icon, primary }) => {
        const active = pathname.startsWith(href)
        if (primary) {
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 relative -top-3">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800
                           flex items-center justify-center shadow-lg shadow-violet-500/25
                           border border-violet-400/20"
              >
                <Icon size={20} className="text-white" />
              </motion.div>
              <span className="text-[10px] font-medium text-[var(--text-3)]">{label}</span>
            </Link>
          )
        }
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all',
              active ? 'text-violet-400' : 'text-[var(--text-3)]'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className={cn(
              'text-[10px] font-medium transition-colors',
              active ? 'text-violet-400' : 'text-[var(--text-3)]'
            )}>
              {label}
            </span>
            {active && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute top-0 w-6 h-0.5 rounded-full bg-violet-500"
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
