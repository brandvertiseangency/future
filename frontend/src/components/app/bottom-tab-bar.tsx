'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  ImageIcon,
  Clock3,
  MoreHorizontal,
  Bot,
  BriefcaseBusiness,
  Settings,
  ClipboardCheck,
  FileStack,
  Wand2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const PRIMARY_TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays,
    match: (p: string) => p === '/calendar' || p.startsWith('/calendar/'),
  },
  { href: '/generate', label: 'Create', icon: Sparkles, match: (p: string) => p === '/generate' || p.startsWith('/generate/') },
  { href: '/outputs', label: 'Outputs', icon: ImageIcon, match: (p: string) => p === '/outputs' || p.startsWith('/outputs/') },
]

const MORE_ITEMS = [
  { href: '/scheduler', label: 'Schedule', icon: Clock3 },
  { href: '/calendar/generate', label: 'Plan', icon: Wand2 },
  { href: '/calendar/review', label: 'Approve', icon: ClipboardCheck },
  { href: '/calendar/content', label: 'Studio', icon: FileStack },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/brand', label: 'Brand', icon: BriefcaseBusiness },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  // Close the sheet whenever the route changes
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  // Track if the current route is in the "More" group
  const isMoreActive = MORE_ITEMS.some((item) => {
    if (item.href === pathname) return true
    if (item.href !== '/settings' && item.href !== '/brand' && item.href !== '/agents') {
      return pathname.startsWith(item.href)
    }
    return false
  })

  return (
    <>
      {/* More sheet backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More sheet panel */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card shadow-2xl"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 px-3 pb-2">
              {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href.length > 1 && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/60',
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.1 : 1.7} />
                    <span className="text-[10px] font-semibold leading-none">{label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border/90 bg-card/98 px-1 backdrop-blur-md"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)', paddingTop: 10 }}
      >
        {PRIMARY_TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground active:bg-muted/50',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                  active && 'bg-primary/12 text-primary',
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.1 : 1.7} />
              </span>
              <span className={cn('max-w-full truncate text-[11px] font-semibold', active ? 'text-primary' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className={cn(
            'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors',
            (moreOpen || isMoreActive) ? 'text-primary' : 'text-muted-foreground active:bg-muted/50',
          )}
        >
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              (moreOpen || isMoreActive) && 'bg-primary/12 text-primary',
            )}
          >
            <MoreHorizontal size={22} strokeWidth={(moreOpen || isMoreActive) ? 2.1 : 1.7} />
          </span>
          <span className={cn('max-w-full truncate text-[11px] font-semibold', (moreOpen || isMoreActive) ? 'text-primary' : 'text-muted-foreground')}>
            More
          </span>
        </button>
      </nav>
    </>
  )
}
