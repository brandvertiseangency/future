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
import { AIButton } from '@/components/ui/ai-button'
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
  instagram: '#e1306c', linkedin: '#0077b5', twitter: '#94a3b8',
  facebook: '#1877f2', tiktok: '#ff0050',
}

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-white/[0.06] text-white/40 border-white/[0.10]',
  scheduled: 'bg-white/[0.08] text-white/60 border-white/[0.14]',
  published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  failed:    'bg-rose-500/15 text-rose-400 border-rose-500/25',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => apiCall(url)

function PostPill({ post, onClick }: { post: PostSlot; onClick: () => void }) {
  const color = PLATFORM_COLORS[post.platform.toLowerCase()] ?? '#6366f1'
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-0.5 rounded-md text-[10px] font-medium border truncate hover:opacity-80 transition-opacity"
      style={{ backgroundColor: `${color}18`, borderColor: `${color}30`, color }}
    >
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
    try { await apiCall(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify({ caption }) }); onClose() }
    finally { setSaving(false) }
  }
  const del = async () => {
    setDeleting(true)
    try { await apiCall(`/api/posts/${post.id}`, { method: 'DELETE' }); onDeleted(); onClose() }
    finally { setDeleting(false) }
  }

  const platformColor = PLATFORM_COLORS[post.platform.toLowerCase()] ?? '#6366f1'

  return (
    <motion.div
      initial={{ x: 480, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 480, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed right-0 top-0 h-full w-[440px] bg-[#070707] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div>
          <h3 className="text-white font-semibold text-[15px] tracking-[-0.01em]">{post.title || post.platform}</h3>
          <span className={cn('text-[10px] px-2 py-0.5 rounded-md border mt-1 inline-block capitalize font-medium', STATUS_STYLES[post.status])}>
            {post.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <X size={14} className="text-white/50" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
        {post.image_url
          ? <img src={post.image_url} alt="" className="w-full aspect-video rounded-xl object-cover border border-white/[0.08]" />
          : <div className="aspect-video rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <p className="text-white/20 text-sm">No image yet</p>
            </div>
        }
        <div>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">Platform</p>
          <span className="px-3 py-1 rounded-full text-[11px] border capitalize font-medium"
            style={{ backgroundColor: `${platformColor}18`, borderColor: `${platformColor}30`, color: platformColor }}>
            {post.platform}
          </span>
        </div>
        <div>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">Caption</p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
                       text-white/75 text-[13px] resize-none focus:outline-none focus:border-white/[0.20] transition-colors"
          />
        </div>
        <div>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">Scheduled for</p>
          <p className="text-white/50 text-[13px]">{post.scheduled_at ? format(new Date(post.scheduled_at), 'PPpp') : '—'}</p>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-white/[0.07] space-y-2">
        <AIButton onClick={save} disabled={saving} className="w-full py-2.5 rounded-xl text-[13px] font-semibold">
          {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
        </AIButton>
        <button
          onClick={del}
          disabled={deleting}
          className="w-full py-2 text-rose-400/70 text-[12px] hover:text-rose-400 transition-colors disabled:opacity-50"
        >
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
  const { data } = useSWR(swrKey, fetcher, { dedupingInterval: 20000 })
  const posts = data?.posts ?? []

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = (getDay(monthStart) + 6) % 7

  const postsForDay = (day: Date) => posts.filter((p: PostSlot) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day))

  return (
    <div className="px-6 py-6 h-[calc(100vh-56px)] flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
          >
            <ChevronLeft size={14} className="text-white/50" />
          </button>
          <h2 className="text-white font-semibold text-[16px] tracking-[-0.02em] min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
          >
            <ChevronRight size={14} className="text-white/50" />
          </button>
        </div>
        <Link href="/generate">
          <AIButton className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold">
            <Sparkles size={13} />
            Schedule Post
          </AIButton>
        </Link>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.07] bg-[#080808] overflow-hidden min-h-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-2.5 text-center text-white/25 text-[10px] uppercase tracking-widest font-semibold">
              {d}
            </div>
          ))}
        </div>
        {/* Cells */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b border-white/[0.05]" />
          ))}
          {days.map((day) => {
            const dayPosts = postsForDay(day)
            const today = isToday(day)
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: day.getDate() * 0.008 }}
                className={cn(
                  'border-r border-b border-white/[0.05] p-2 group min-h-[80px] relative transition-colors',
                  today ? 'bg-white/[0.04]' : 'hover:bg-white/[0.025]'
                )}
              >
                <span className={cn(
                  'inline-flex w-5 h-5 rounded-full items-center justify-center text-[11px] font-medium mb-1.5',
                  today ? 'bg-white text-black font-bold' : 'text-white/30'
                )}>
                  {format(day, 'd')}
                </span>
                <div className="space-y-0.5">
                  {dayPosts.map((post: PostSlot) => (
                    <PostPill key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                  ))}
                </div>
                <Link href="/generate"
                  className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity
                             w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12]"
                >
                  <Plus size={9} className="text-white/50" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedPost(null)}
            />
            <PostDrawer post={selectedPost} onClose={() => setSelectedPost(null)} onDeleted={() => mutate(swrKey)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

