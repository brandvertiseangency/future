'use client'

import { usePathname } from 'next/navigation'
import { Bell, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { useEffect, useState } from 'react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/generate': 'Generate',
  '/assets': 'Assets',
  '/settings': 'Settings',
}

function useTimeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Topbar() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Brandvertise'
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="fixed top-0 left-0 md:left-[220px] right-0 h-16 z-30
                       bg-[var(--bg-canvas)]/90 backdrop-blur-xl
                       border-b border-[var(--border-dim)]
                       flex items-center justify-between px-4 md:px-6">

      {/* LEFT */}
      <div>
        <h1 className="text-[15px] font-semibold text-[var(--text-1)] leading-none">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-[var(--text-3)]">
            AI ready · {time}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center
                           hover:bg-[var(--bg-subtle)] transition-colors">
          <Bell size={15} className="text-[var(--text-2)]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full
                           bg-violet-500 ring-1 ring-[var(--bg-canvas)]" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600
                        flex items-center justify-center text-white text-[11px] font-semibold
                        cursor-pointer ring-2 ring-transparent hover:ring-violet-500/30
                        transition-all">
          C
        </div>

        <Link href="/generate">
          <ShimmerButton className="h-8 px-4 text-[13px] font-medium rounded-lg">
            <Sparkles size={13} className="mr-1.5 text-violet-300" />
            New Post
          </ShimmerButton>
        </Link>
      </div>
    </header>
  )
}
