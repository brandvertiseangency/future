'use client'

import { usePathname } from 'next/navigation'
import { Bell, Moon, Search, Sparkles, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { useBrandStore } from '@/stores/brand'
import { getNextWorkflowAction, getWorkflowProgress } from '@/lib/workflow'
import { Button } from '@/components/ui/button'

const PAGE_META: Record<string, { title: string; sub?: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview' },
  '/calendar': { title: 'Content Calendar', sub: 'Ideas and approvals' },
  '/generate': { title: 'Generate studio', sub: 'Create on-brand content at scale' },
  '/generate/queue': { title: 'Generation Queue', sub: 'Live progress' },
  '/outputs': { title: 'Outputs', sub: 'Generated creatives' },
  '/brand': { title: 'Brand', sub: 'Overview' },
  '/brand/edit': { title: 'Brand edit', sub: 'Identity, voice, and visual system' },
  '/scheduler': { title: 'Scheduler', sub: 'Schedule and publish' },
  '/settings': { title: 'Settings', sub: 'Account and billing' },
  '/agents': { title: 'Agents', sub: 'Automation tools' },
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

export function Topbar() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const meta = Object.entries(PAGE_META).find(([k]) => pathname.startsWith(k))?.[1] ?? { title: 'Brandvertise' }
  const { user } = useAuth()
  const { currentBrand } = useBrandStore()
  const [query, setQuery] = useState('')

  const { data: notifData, mutate: mutateNotifs } = useSWR(
    '/api/notifications',
    fetcher<{ notifications: { read: boolean }[] }>,
    {
      refreshInterval: 60000,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    }
  )
  const notifications = notifData?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read).length
  const { data: creditsData } = useSWR('/api/credits/balance', fetcher<{ balance: number }>, { revalidateOnFocus: false })
  const credits = creditsData?.balance ?? 0

  const markAllRead = async () => {
    try {
      await apiCall('/api/notifications/read-all', { method: 'POST' })
      mutateNotifs()
    } catch {
      // ignore
    }
  }

  const initials = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()
  const brandName = currentBrand?.name ?? null
  const nextAction = getNextWorkflowAction(pathname)
  const progress = getWorkflowProgress(pathname)

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/65 bg-card/55 px-4 backdrop-blur-xl md:left-[260px] md:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{meta.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {brandName ? `${brandName} · ${meta.sub ?? ''}` : meta.sub}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 md:gap-2.5">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-9 w-56 rounded-full border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary xl:w-72"
          />
        </div>

        <div className="hidden items-center rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs md:flex">
          <span className="font-medium tabular-nums text-foreground">{progress}%</span>
          <span className="mx-2 h-3 w-px bg-border" aria-hidden />
          <span className="text-muted-foreground">Credits</span>
          <span className="ml-1 font-semibold tabular-nums text-foreground">{credits}</span>
          {nextAction ? (
            <>
              <span className="mx-2 h-3 w-px bg-border" aria-hidden />
              <Link href={nextAction.href} className="font-medium text-primary hover:underline">
                Next: {nextAction.label}
              </Link>
            </>
          ) : null}
        </div>

        <button
          type="button"
          title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 min-h-9 w-9 min-w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          type="button"
          onClick={markAllRead}
          className="relative flex h-9 min-h-9 w-9 min-w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-primary px-1 text-center text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <Link href="/settings">
          <div
            className="flex h-9 min-h-9 w-9 min-w-9 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground"
            title="Settings"
          >
            {initials}
          </div>
        </Link>

        <Link href="/generate" className="hidden sm:block">
          <Button size="lg" className="h-9 min-h-9 gap-1.5 rounded-full px-4 text-xs">
            <Sparkles size={14} strokeWidth={2} />
            Generate
          </Button>
        </Link>
      </div>
    </header>
  )
}
