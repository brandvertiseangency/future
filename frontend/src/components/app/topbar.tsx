'use client'

import { usePathname } from 'next/navigation'
import {
  IconBell,
  IconSparkles,
  IconX,
  IconChecks,
  IconSpeakerphone,
  IconCalendarDue,
  IconAlertTriangle,
  IconChartBar,
  type Icon,
} from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBrandStore } from '@/stores/brand'

const PAGE_META: Record<string, { title: string; sub?: string }> = {
  '/dashboard': { title: 'Dashboard',  sub: 'Overview' },
  '/calendar':  { title: 'Calendar',   sub: 'Content Schedule' },
  '/calendar/generate': { title: 'Content Plan', sub: 'Generate' },
  '/calendar/review': { title: 'Content Plan', sub: 'Review' },
  '/generate':  { title: 'Generate',   sub: 'Create Content' },
  '/generate/queue': { title: 'Generation Queue', sub: 'Live Progress' },
  '/assets':    { title: 'Assets',     sub: 'Brand Files' },
  '/outputs':   { title: 'Outputs',    sub: 'Generated Content' },
  '/brand': { title: 'Your Brand', sub: 'Identity' },
  '/settings':  { title: 'Settings',   sub: 'Preferences' },
  '/onboarding':{ title: 'Setup',      sub: 'Brand Configuration' },
  '/agents': { title: 'Agents', sub: 'AI Workbench' },
}

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

const NOTIF_ICON_COMPONENTS: Record<string, Icon> = {
  post_published: IconSpeakerphone, post_scheduled: IconCalendarDue,
  credits_low: IconAlertTriangle, weekly_digest: IconChartBar, generation_complete: IconSparkles,
}

export function Topbar() {
  const pathname = usePathname()
  const meta = Object.entries(PAGE_META).find(([k]) => pathname.startsWith(k))?.[1] ?? { title: 'Brandvertise' }
  const [time, setTime] = useState('')
  const { user } = useAuth()
  const { currentBrand } = useBrandStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const { data: notifData, mutate: mutateNotifs } = useSWR(
    '/api/notifications',
    fetcher<{ notifications: Notification[] }>,
    {
      refreshInterval: 120000,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    }
  )
  const notifications = notifData?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = async () => {
    try { await apiCall('/api/notifications/read-all', { method: 'POST' }); mutateNotifs() } catch { /* ignore */ }
  }
  const markRead = async (id: string) => {
    try { await apiCall(`/api/notifications/${id}/read`, { method: 'POST' }); mutateNotifs() } catch { /* ignore */ }
  }

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    update(); const t = setInterval(update, 60000); return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const initials = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()
  const brandName = currentBrand?.name ?? null

  return (
    <header
      className="fixed top-0 left-0 md:left-[220px] right-0 h-14 z-30 flex items-center justify-between px-5 md:px-7"
      style={{
        background: 'rgba(16,20,28,0.78)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {/* LEFT — page title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-semibold text-[var(--text-1)] leading-none tracking-[-0.01em]">
              {meta.title}
            </h1>
            {brandName && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>/</span>
                <span className="text-[12px] text-[var(--text-3)] font-medium">{brandName}</span>
              </>
            )}
          </div>
          {/* AI Status chip */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.7)',
                boxShadow: '0 0 5px rgba(255,255,255,0.5)',
                animation: 'pulse-glow 2.5s ease-in-out infinite',
              }}
            />
            <span className="text-[10.5px] text-[var(--text-4)] tracking-[0.02em]">AI ready · {time}</span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1.5">

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: notifOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: notifOpen ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!notifOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { if (!notifOpen) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <IconBell size={14} style={{ color: 'rgba(255,255,255,0.55)' }} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 rounded-full
                               ring-1 ring-black text-[8.5px] text-black font-bold
                               flex items-center justify-center px-0.5"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #c0c0c0 100%)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-50"
                style={{
                  background: '#161b24',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[13px] font-semibold text-[var(--text-1)]">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] text-[var(--text-3)] hover:text-white transition-colors">
                        <IconChecks size={11} />All read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
                      <IconX size={13} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <IconBell size={20} style={{ color: 'rgba(255,255,255,0.10)', margin: '0 auto 10px' }} />
                      <p className="text-[12px] text-[var(--text-4)]">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((n) => {
                      const Icon: Icon = NOTIF_ICON_COMPONENTS[n.type] ?? IconBell
                      return (
                        <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                          className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                            !n.read ? 'bg-white/[0.025]' : '')}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(255,255,255,0.025)')}
                        >
                          <Icon size={13} style={{ color: 'rgba(255,255,255,0.35)', marginTop: 2, flexShrink: 0 }} />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-[12.5px] leading-snug', n.read ? 'text-[var(--text-3)]' : 'text-[var(--text-1)]')}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-[var(--text-4)] mt-0.5">
                              {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                              style={{ background: 'rgba(255,255,255,0.7)', boxShadow: '0 0 4px rgba(255,255,255,0.4)' }} />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <Link href="/settings">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-black text-[11px] font-bold cursor-pointer transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
            }}
            title="Settings"
          >
            {initials}
          </div>
        </Link>

        {/* CTA */}
        <Link href="/generate">
          <button
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11.5px] font-semibold text-black transition-all duration-150 hover:opacity-90 hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)' }}
          >
            <IconSparkles size={11} />
            Generate
          </button>
        </Link>
      </div>
    </header>
  )
}
