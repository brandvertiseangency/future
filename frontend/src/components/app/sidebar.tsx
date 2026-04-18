'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Images,
  Settings2,
  ChevronDown,
} from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/generate', label: 'Generate', icon: Sparkles },
  { href: '/assets', label: 'Assets', icon: Images },
]

export function Sidebar() {
  const pathname = usePathname()
  const { currentBrand } = useBrandStore()

  const credits = 247
  const maxCredits = 500
  const pct = (credits / maxCredits) * 100
  const initials = currentBrand?.name?.slice(0, 2).toUpperCase() ?? 'BV'
  const brandName = currentBrand?.name ?? 'My Brand'

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col
                      bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
                      backdrop-blur-xl">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--border-dim)] flex-shrink-0">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
        </span>
        <span className="text-[14px] font-semibold tracking-tight text-[var(--text-1)]">
          brandvertise.ai
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3">
        <p className="px-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-4)]">
          Workspace
        </p>
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-[13.5px] transition-all duration-150 overflow-hidden',
                  active
                    ? 'text-[var(--text-1)] font-semibold bg-[var(--accent-muted)] border border-[var(--accent)]/20'
                    : 'text-[var(--text-3)] font-medium hover:text-[var(--text-1)] hover:bg-[var(--bg-subtle)]'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-500" />
                )}
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="h-px mx-4 my-3 bg-[var(--border-dim)]" />

        <nav className="px-2">
          <Link
            href="/settings"
            className={cn(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-[13.5px] transition-all duration-150',
              pathname.startsWith('/settings')
                ? 'text-[var(--text-1)] font-semibold bg-[var(--accent-muted)] border border-[var(--accent)]/20'
                : 'text-[var(--text-3)] font-medium hover:text-[var(--text-1)] hover:bg-[var(--bg-subtle)]'
            )}
          >
            <Settings2 size={16} className="flex-shrink-0" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Brand + Credits */}
      <div className="px-3 pb-3 pt-2 border-t border-[var(--border-dim)] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                        hover:bg-[var(--bg-subtle)] cursor-pointer transition-all duration-150">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                          bg-gradient-to-br from-violet-600 to-violet-800
                          text-white text-[10px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-[var(--text-1)] truncate">{brandName}</p>
            <p className="text-[11px] text-[var(--text-3)]">Free plan</p>
          </div>
          <ChevronDown size={14} className="text-[var(--text-4)] flex-shrink-0" />
        </div>

        <div className="mt-2 px-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[var(--text-3)]">{credits} credits</span>
            <span className="text-[11px] text-[var(--text-4)]">/ {maxCredits}</span>
          </div>
          <div className="h-1 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button className="mt-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
            Buy credits →
          </button>
        </div>
      </div>
    </aside>
  )
}
