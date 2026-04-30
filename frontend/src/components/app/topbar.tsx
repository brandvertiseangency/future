'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { useBrandStore } from '@/stores/brand'

const PAGE_META: Record<string, { title: string; sub?: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview' },
  '/calendar': { title: 'Content Calendar', sub: 'Ideas and approvals' },
  '/generate': { title: 'Generation', sub: 'Create content' },
  '/generate/queue': { title: 'Generation Queue', sub: 'Live progress' },
  '/outputs': { title: 'Outputs', sub: 'Generated creatives' },
  '/brand': { title: 'Brand Setup', sub: 'Identity and style' },
  '/scheduler': { title: 'Scheduler', sub: 'Schedule and publish' },
  '/settings': { title: 'Settings', sub: 'Account and billing' },
  '/agents': { title: 'Agents', sub: 'Automation tools' },
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

export function Topbar() {
  const pathname = usePathname()
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

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:left-[240px] md:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#111111]">{meta.title}</p>
        <p className="truncate text-xs text-[#6B7280]">{brandName ? `${brandName} · ${meta.sub ?? ''}` : meta.sub}</p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
          />
        </div>

        <button
          onClick={markAllRead}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-[#111111] px-1 text-center text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <Link href="/settings">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F7F7F8] text-sm font-semibold text-[#111111]" title="Settings">
            {initials}
          </div>
        </Link>

        <Link href="/generate">
          <button className="flex h-9 items-center gap-1.5 rounded-lg bg-[#111111] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90">
            <Sparkles size={12} />
            Generate
          </button>
        </Link>
      </div>
    </header>
  )
}
