'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Sparkles, ImageIcon, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays,
    match: (p: string) => p === '/calendar' || p.startsWith('/calendar/'),
  },
  { href: '/outputs', label: 'Outputs', icon: ImageIcon, match: (p: string) => p === '/outputs' || p.startsWith('/outputs/') },
  { href: '/scheduler', label: 'Schedule', icon: Clock3, match: (p: string) => p === '/scheduler' || p.startsWith('/scheduler/') },
  { href: '/generate', label: 'Create', icon: Sparkles, match: (p: string) => p === '/generate' || p.startsWith('/generate/') },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border/90 bg-card/98 px-1 backdrop-blur-md"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)', paddingTop: 10 }}
    >
      {TABS.map(({ href, label, icon: Icon, match }) => {
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
    </nav>
  )
}
