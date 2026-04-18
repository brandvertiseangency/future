'use client'

import { usePathname } from 'next/navigation'
import { Bell, Sparkles, X, CheckCheck, Megaphone, CalendarDays, AlertTriangle, BarChart2, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { AIButton } from '@/components/ui/ai-button'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/generate': 'Generate',
  '/assets': 'Assets',
  '/settings': 'Settings',
  '/onboarding': 'Setup',
}

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

const NOTIF_ICON_COMPONENTS: Record<string, LucideIcon> = {
  post_published: Megaphone, post_scheduled: CalendarDays,
  credits_low: AlertTriangle, weekly_digest: BarChart2, generation_complete: Sparkles,
}

export function Topbar() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Brandvertise'
  const [time, setTime] = useState('')
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Real notifications from backend
  const { data: notifData, mutate: mutateNotifs } = useSWR(
    '/api/notifications',
    fetcher<{ notifications: Notification[] }>,
    { refreshInterval: 30000 }
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

  return (
    <header className="fixed top-0 left-0 md:left-[220px] right-0 h-16 z-30
                       bg-[var(--bg-canvas)]/90 backdrop-blur-xl
                       border-b border-[var(--border-dim)]
                       flex items-center justify-between px-4 md:px-6">

      {/* LEFT */}
      <div>
        <h1 className="text-[15px] font-semibold text-[var(--text-1)] leading-none">{title}</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-[var(--text-3)]">AI ready · {time}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen((v) => !v)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors">
            <Bell size={15} className="text-[var(--text-2)]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 rounded-full bg-[var(--ai-color)]
                               ring-1 ring-[var(--bg-canvas)] text-[9px] text-white font-bold
                               flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-10 w-80 rounded-xl border border-[var(--border-base)]
                           bg-[var(--card-bg)] shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-dim)]">
                  <span className="text-sm font-semibold text-[var(--text-1)]">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] text-[var(--ai-color)] hover:text-[var(--ai-color)] transition-colors">
                        <CheckCheck size={12} />Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-[var(--text-4)] hover:text-[var(--text-2)]">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-dim)]">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell size={24} className="text-[var(--text-4)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--text-3)]">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((n) => (
                      <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                        className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-subtle)]',
                          !n.read && 'bg-[var(--ai-glow)]')}>
                        <span className="text-base flex-shrink-0 mt-0.5">{(() => { const Icon: LucideIcon = NOTIF_ICON_COMPONENTS[n.type] ?? Bell; return <Icon size={14} className="text-[var(--text-3)]" />; })()}</span>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-[13px] leading-snug', n.read ? 'text-[var(--text-3)]' : 'text-[var(--text-1)]')}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[var(--text-4)] mt-0.5">
                            {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--ai-color)] flex-shrink-0 mt-1.5" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar → settings */}
        <Link href="/settings">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600
                          flex items-center justify-center text-white text-[11px] font-semibold
                          cursor-pointer ring-2 ring-transparent hover:ring-[var(--ai-border)] transition-all">
            {initials}
          </div>
        </Link>

        <Link href="/generate">
          <AIButton className="h-8 px-4 text-[13px] font-medium rounded-lg">
            <Sparkles size={13} className="text-[var(--ai-color)]" />
            New Post
          </AIButton>
        </Link>
      </div>
    </header>
  )
}
