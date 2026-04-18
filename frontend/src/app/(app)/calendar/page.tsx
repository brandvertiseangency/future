'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths, getDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface PostSlot {
  id: string
  title: string
  platform: 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'tiktok'
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  date: Date
  caption: string
  imageUrl?: string
  isAI?: boolean
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e',
  linkedin: '#3b82f6',
  twitter: '#94a3b8',
  facebook: '#2563eb',
  tiktok: '#10b981',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[var(--bg-subtle)] text-[var(--text-3)] border-[var(--border-base)]',
  scheduled: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  published: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  failed: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
}

const DEMO_POSTS: PostSlot[] = [
  { id: '1', title: 'Product Launch', platform: 'instagram', status: 'scheduled', date: new Date(), caption: 'Exciting news! 🚀', isAI: true },
  { id: '2', title: 'Industry Tip', platform: 'linkedin', status: 'draft', date: new Date(), caption: "Here's what we learned..." },
  { id: '3', title: 'Behind the Scenes', platform: 'instagram', status: 'published', date: new Date(Date.now() - 86400000 * 2), caption: 'Our team at work 📸', isAI: true },
  { id: '4', title: 'Weekly Update', platform: 'twitter', status: 'scheduled', date: new Date(Date.now() + 86400000 * 3), caption: 'Weekly roundup thread 🧵' },
]

function PostPill({ post, onClick }: { post: PostSlot; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-0.5 rounded-md text-[10px] font-medium border truncate cursor-pointer transition-opacity hover:opacity-80"
      style={{ backgroundColor: `${PLATFORM_COLORS[post.platform]}18`, borderColor: `${PLATFORM_COLORS[post.platform]}30`, color: PLATFORM_COLORS[post.platform] }}
    >
      {post.isAI && <span className="mr-1 opacity-70">✦</span>}
      {post.title}
    </button>
  )
}

function PostDrawer({ post, onClose }: { post: PostSlot; onClose: () => void }) {
  const [caption, setCaption] = useState(post.caption)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ x: 480, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 480, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-[480px] bg-[var(--bg-raised)] border-l border-[var(--border-dim)] z-50 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-dim)]">
        <div>
          <h3 className="text-[var(--text-1)] font-semibold text-base">{post.title}</h3>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border mt-1 inline-block capitalize', STATUS_STYLES[post.status])}>
            {post.status}
          </span>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-base)]
                     flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors">
          <X size={16} className="text-[var(--text-2)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="aspect-video rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-base)] flex items-center justify-center">
          <p className="text-[var(--text-4)] text-sm">No image yet</p>
        </div>

        <div>
          <p className="text-[var(--text-3)] text-xs uppercase tracking-wider mb-2">Platform</p>
          <span
            className="px-3 py-1 rounded-full text-xs border capitalize font-medium"
            style={{ backgroundColor: `${PLATFORM_COLORS[post.platform]}18`, borderColor: `${PLATFORM_COLORS[post.platform]}30`, color: PLATFORM_COLORS[post.platform] }}
          >
            {post.platform}
          </span>
        </div>

        <div>
          <p className="text-[var(--text-3)] text-xs uppercase tracking-wider mb-2">Caption</p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                       text-[var(--text-1)] text-sm resize-none
                       focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        <div>
          <p className="text-[var(--text-3)] text-xs uppercase tracking-wider mb-2">Scheduled for</p>
          <p className="text-[var(--text-2)] text-sm">{format(post.date, 'PPpp')}</p>
        </div>
      </div>

      <div className="px-6 py-5 border-t border-[var(--border-dim)] space-y-2">
        <ShimmerButton onClick={save} disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold">
          {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
        </ShimmerButton>
        <button className="w-full py-2 text-rose-400 text-sm hover:text-rose-300 transition-colors">
          Delete post
        </button>
      </div>
    </motion.div>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState<PostSlot | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = (getDay(monthStart) + 6) % 7

  const postsForDay = (day: Date) => DEMO_POSTS.filter((p) => isSameDay(p.date, day))

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border-base)]
                       flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <ChevronLeft size={16} className="text-[var(--text-2)]" />
          </button>
          <h2 className="text-[var(--text-1)] font-semibold text-lg min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border-base)]
                       flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <ChevronRight size={16} className="text-[var(--text-2)]" />
          </button>
        </div>

        <ShimmerButton className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
          <Sparkles size={14} className="text-violet-300" />
          Schedule Post
        </ShimmerButton>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col border border-[var(--border-base)] rounded-2xl overflow-hidden bg-[var(--card-bg)]">
        <div className="grid grid-cols-7 border-b border-[var(--border-dim)]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-3 text-center text-[var(--text-3)] text-xs uppercase tracking-wider font-medium">
              {d}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b border-[var(--border-dim)] opacity-30" />
          ))}

          {days.map((day) => {
            const posts = postsForDay(day)
            const today = isToday(day)
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: day.getDate() * 0.01 }}
                className={cn(
                  'border-r border-b border-[var(--border-dim)] p-2 group min-h-[90px] relative',
                  today && 'bg-violet-500/[0.04]',
                  'hover:bg-[var(--bg-subtle)] transition-colors'
                )}
              >
                <span className={cn(
                  'inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-medium mb-1',
                  today ? 'bg-violet-500 text-white' : 'text-[var(--text-3)]'
                )}>
                  {format(day, 'd')}
                </span>

                <div className="space-y-0.5">
                  {posts.map((post) => (
                    <PostPill key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                  ))}
                </div>

                <button className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity
                                   w-5 h-5 rounded-md bg-[var(--bg-muted)] flex items-center justify-center
                                   hover:bg-[var(--border-loud)]">
                  <Plus size={10} className="text-[var(--text-2)]" />
                </button>
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
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedPost(null)}
            />
            <PostDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
