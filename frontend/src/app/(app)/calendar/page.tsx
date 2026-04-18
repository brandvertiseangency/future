'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths, getDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Sparkles } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { apiCall } from '@/lib/api'

interface PostSlot {
  id: string
  title?: string
  platform: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at: string
  caption: string
  image_url?: string
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e', linkedin: '#3b82f6', twitter: '#94a3b8',
  facebook: '#2563eb', tiktok: '#10b981',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[var(--bg-subtle)] text-[var(--text-3)] border-[var(--border-base)]',
  scheduled: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  published: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  failed: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

function PostPill({ post, onClick }: { post: PostSlot; onClick: () => void }) {
  const color = PLATFORM_COLORS[post.platform.toLowerCase()] ?? '#6366f1'
  return (
    <button onClick={onClick}
      className="w-full text-left px-2 py-0.5 rounded-md text-[10px] font-medium border truncate cursor-pointer transition-opacity hover:opacity-80"
      style={{ backgroundColor: `${color}18`, borderColor: `${color}30`, color }}>
      {post.title || post.platform}
    </button>
  )
}

function PostDrawer({ post, onClose, onDeleted }: { post: PostSlot; onClose: () => void; onDeleted: () => void }) {
  const [caption, setCaption] = useState(post.caption)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await apiCall(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify({ caption }) })
      onClose()
    } finally { setSaving(false) }
  }

  const del = async () => {
    setDeleting(true)
    try {
      await apiCall(`/api/posts/${post.id}`, { method: 'DELETE' })
      onDeleted()
      onClose()
    } finally { setDeleting(false) }
  }

  return (
    <motion.div
      initial={{ x: 480, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 480, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-[480px] bg-[var(--bg-raised)] border-l border-[var(--border-dim)] z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-dim)]">
        <div>
          <h3 className="text-[var(--text-1)] font-semibold text-base">{post.title || post.platform}</h3>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border mt-1 inline-block capitalize', STATUS_STYLES[post.status])}>
            {post.status}
          </span>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-base)] flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors">
          <X size={16} className="text-[var(--text-2)]" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {post.image_url
          ? <img src={post.image_url} alt="" className="w-full aspect-video rounded-xl object-cover border border-[var(--border-base)]" />
          : <div className="aspect-video rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-base)] flex items-center justify-center">
              <p className="text-[var(--text-4)] text-sm">No image yet</p>
            </div>
        }
        <div>
          <p className="text-[var(--text-3)] text-xs uppercase tracking-wider mb-2">Platform</p>
          <span className="px-3 py-1 rounded-full text-xs border capitalize font-medium"
            style={{ backgroundColor: `${PLATFORM_COLORS[post.platform.toLowerCase()] ?? '#6366f1'}18`, borderColor: `${PLATFORM_COLORS[post.platform.toLowerCase()] ?? '#6366f1'}30`, color: PLATFORM_COLORS[post.platform.toLowerCase()] ?? '#6366f1' }}>
            {post.platform}
          </span>
        </div>
        <div>
          <p className="text-[var(--text-3)] text-xs uppercase tracking-wider mb-2">Caption</p>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4}
            className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                       text-[var(--text-1)] text-sm resize-none focus:outline-none focus:border-violet-500/50 transition-colors" />
        </div>
        <div>
          <p className="text-[var(--text-3)] text-xs uppercase tracking-wider mb-2">Scheduled for</p>
          <p className="text-[var(--text-2)] text-sm">{post.scheduled_at ? format(new Date(post.scheduled_at), 'PPpp') : '—'}</p>
        </div>
      </div>
      <div className="px-6 py-5 border-t border-[var(--border-dim)] space-y-2">
        <ShimmerButton onClick={save} disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold">
          {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
        </ShimmerButton>
        <button onClick={del} disabled={deleting}
          className="w-full py-2 text-rose-400 text-sm hover:text-rose-300 transition-colors disabled:opacity-50">
          {deleting ? 'Deleting…' : 'Delete post'}
        </button>
      </div>
    </motion.div>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState<PostSlot | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const swrKey = `/api/posts/scheduled?year=${year}&month=${month}`
  const { data } = useSWR(swrKey, fetcher<{ posts: PostSlot[] }>, { dedupingInterval: 20000 })
  const posts = data?.posts ?? []

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = (getDay(monthStart) + 6) % 7

  const postsForDay = (day: Date) => posts.filter((p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day))

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border-base)] flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors">
            <ChevronLeft size={16} className="text-[var(--text-2)]" />
          </button>
          <h2 className="text-[var(--text-1)] font-semibold text-lg min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border-base)] flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors">
            <ChevronRight size={16} className="text-[var(--text-2)]" />
          </button>
        </div>
        <Link href="/generate">
          <ShimmerButton className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
            <Sparkles size={14} className="text-violet-300" />
            Schedule Post
          </ShimmerButton>
        </Link>
      </div>

      <div className="flex-1 flex flex-col border border-[var(--border-base)] rounded-2xl overflow-hidden bg-[var(--card-bg)]">
        <div className="grid grid-cols-7 border-b border-[var(--border-dim)]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-3 text-center text-[var(--text-3)] text-xs uppercase tracking-wider font-medium">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b border-[var(--border-dim)] opacity-30" />
          ))}
          {days.map((day) => {
            const dayPosts = postsForDay(day)
            const today = isToday(day)
            return (
              <motion.div key={day.toISOString()}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: day.getDate() * 0.01 }}
                className={cn('border-r border-b border-[var(--border-dim)] p-2 group min-h-[90px] relative',
                  today && 'bg-violet-500/[0.04]', 'hover:bg-[var(--bg-subtle)] transition-colors')}>
                <span className={cn('inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-medium mb-1',
                  today ? 'bg-violet-500 text-white' : 'text-[var(--text-3)]')}>
                  {format(day, 'd')}
                </span>
                <div className="space-y-0.5">
                  {dayPosts.map((post) => (
                    <PostPill key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                  ))}
                </div>
                <Link href="/generate"
                  className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity
                             w-5 h-5 rounded-md bg-[var(--bg-muted)] flex items-center justify-center hover:bg-[var(--border-loud)]">
                  <Plus size={10} className="text-[var(--text-2)]" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedPost(null)} />
            <PostDrawer post={selectedPost} onClose={() => setSelectedPost(null)} onDeleted={() => mutate(swrKey)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

