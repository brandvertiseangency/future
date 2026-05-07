'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Wand2,
  ImageIcon,
  Clock,
  MoreHorizontal,
  BriefcaseBusiness,
  Settings,
  ClipboardCheck,
  CalendarPlus,
  Printer,
  Layers,
  Layout,
  Mail,
  PresentationIcon,
  Globe,
  Gift,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const PRIMARY_TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
  { href: '/calendar', label: 'Review', icon: ClipboardCheck, match: (p: string) => p === '/calendar' || (p.startsWith('/calendar/') && !p.startsWith('/calendar/generate')) },
  { href: '/generate', label: 'Generate', icon: Wand2, match: (p: string) => p === '/generate' || p.startsWith('/generate/') },
  { href: '/outputs', label: 'Outputs', icon: ImageIcon, match: (p: string) => p === '/outputs' || p.startsWith('/outputs/') },
]

const MORE_GROUPS = [
  {
    label: 'Brand Auto-Pilot',
    items: [
      { href: '/calendar/generate', label: 'Plan Content', icon: CalendarPlus },
      { href: '/scheduler', label: 'Schedule Posts', icon: Clock },
    ],
  },
  {
    label: 'Marketing Studio',
    items: [
      { href: '/studio/print', label: 'Print Assets', icon: Printer },
      { href: '/studio/posters', label: 'Posters', icon: Layers },
      { href: '/studio/banners', label: 'Banners', icon: Layout },
      { href: '/studio/email', label: 'Email', icon: Mail },
      { href: '/studio/presentations', label: 'Slides', icon: PresentationIcon },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/tools', label: 'Tools', icon: Globe },
      { href: '/brand/edit', label: 'Brand Setup', icon: BriefcaseBusiness },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/refer', label: 'Refer & Earn', icon: Gift },
    ],
  },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  const allMoreItems = MORE_GROUPS.flatMap((g) => g.items)
  const isMoreActive = allMoreItems.some(({ href }) => pathname === href || (href.length > 1 && pathname.startsWith(href)))

  return (
    <>
      {/* Backdrop */}
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

      {/* More sheet */}
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
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-4 px-3 pb-2">
              {MORE_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {group.items.map(({ href, label, icon: Icon }) => {
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
                          <Icon size={19} strokeWidth={active ? 2.1 : 1.7} />
                          <span className="text-[10px] font-semibold leading-none text-center">{label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
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
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-colors', active && 'bg-primary/12')}>
                <Icon size={22} strokeWidth={active ? 2.1 : 1.7} />
              </span>
              <span className={cn('max-w-full truncate text-[11px] font-semibold', active ? 'text-primary' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* More */}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className={cn(
            'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors',
            (moreOpen || isMoreActive) ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-colors', (moreOpen || isMoreActive) && 'bg-primary/12')}>
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
