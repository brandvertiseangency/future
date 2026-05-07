'use client'

import { useCallback, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { displayCaption } from '@/lib/caption'
import { getEffectivePostStatus } from '@/lib/post-status'
import { cn } from '@/lib/utils'
import { SocialIcon, getPlatformLabel } from '@/components/ui/social-icon'
import {
  Filter,
  MoreHorizontal,
  Clock,
  CalendarDays,
  CheckCircle2,
  Layers,
  Sparkles,
  Edit3,
  Calendar,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostItem = {
  id: string
  caption: string
  image_url?: string
  platform: string
  status: string
  approval_status?: string
  scheduled_at?: string
  content_type?: string
  title?: string
  social_account?: string
}

type SchedulerTab = 'schedule' | 'queue' | 'calendar' | 'posted'

const TABS: { id: SchedulerTab; label: string; icon: React.ReactNode }[] = [
  { id: 'schedule', label: 'Schedule Content', icon: <Clock size={15} /> },
  { id: 'queue', label: 'Publishing Queue', icon: <Layers size={15} /> },
  { id: 'calendar', label: 'Calendar View', icon: <CalendarDays size={15} /> },
  { id: 'posted', label: 'Posted', icon: <CheckCircle2 size={15} /> },
]

const SORT_OPTIONS = [
  { value: 'soonest', label: 'Soonest' },
  { value: 'latest', label: 'Latest' },
  { value: 'platform', label: 'Platform' },
]

// Best time to post heuristic by platform
const BEST_TIMES: Record<string, { time: string; day: string }> = {
  instagram: { time: '10:00 AM – 12:00 PM', day: 'Wednesday' },
  linkedin: { time: '9:00 AM – 11:00 AM', day: 'Tuesday' },
  facebook: { time: '1:00 PM – 3:00 PM', day: 'Thursday' },
  twitter: { time: '8:00 AM – 10:00 AM', day: 'Wednesday' },
  tiktok: { time: '7:00 PM – 9:00 PM', day: 'Friday' },
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    scheduled: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
    published: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20',
    needs_review: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    draft: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    rejected: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
    failed: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
  }
  const labels: Record<string, string> = {
    approved: 'Ready to Schedule',
    needs_review: 'Needs Review',
    draft: 'Draft',
  }
  const colorClass = styles[status] ?? 'bg-muted text-muted-foreground border-border'
  const label = labels[status] ?? (status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '))
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', colorClass)}>
      {label}
    </span>
  )
}

// ─── Schedule button ─────────────────────────────────────────────────────────

function ScheduleButton({ post, onScheduled }: { post: PostItem; onScheduled: () => void }) {
  const [busy, setBusy] = useState(false)
  const schedule = async () => {
    setBusy(true)
    try {
      const scheduledAt = post.scheduled_at || new Date(Date.now() + 3600_000).toISOString()
      await apiCall(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'scheduled', scheduled_at: scheduledAt }) })
      toast.success('Post scheduled')
      onScheduled()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to schedule') } finally { setBusy(false) }
  }
  const eff = getEffectivePostStatus(post.status, post.approval_status)
  if (eff === 'scheduled' || eff === 'published') return null
  return (
    <Button size="sm" disabled={busy || post.approval_status === 'rejected'} onClick={schedule} className="h-8 text-xs">
      {busy ? 'Scheduling…' : 'Schedule'}
    </Button>
  )
}

// ─── Row item ─────────────────────────────────────────────────────────────────

function PostRow({
  post,
  selected,
  onSelect,
}: {
  post: PostItem
  selected: boolean
  onSelect: () => void
}) {
  const caption = displayCaption(post.caption, post.title ?? 'Untitled post')
  const status = getEffectivePostStatus(post.status, post.approval_status)
  const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-all',
        selected
          ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30 hover:bg-muted/20',
      )}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Layers size={20} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">{caption.split('\n')[0].slice(0, 70) || 'Untitled post'}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{caption.slice(0, 80)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <SocialIcon platform={post.platform} size={13} />
            <span className="text-[11px] font-medium text-muted-foreground capitalize">
              {post.social_account ? `@${post.social_account}` : getPlatformLabel(post.platform)}
            </span>
          </div>
          {post.content_type && (
            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] capitalize text-muted-foreground">
              {post.content_type.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Schedule for */}
      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <p className="text-[11px] font-medium text-muted-foreground">Schedule for</p>
        {scheduledDate ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs text-muted-foreground">
              {scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Not set</p>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex shrink-0 flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
        <StatusPill status={status} />
        <div className="flex items-center gap-1">
          <ScheduleButton post={post} onScheduled={() => {}} />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Preview panel ────────────────────────────────────────────────────────────

function PreviewPanel({ post, onClose }: { post: PostItem; onClose: () => void }) {
  const caption = displayCaption(post.caption, post.title ?? '')
  const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null
  const bestTime = BEST_TIMES[post.platform?.toLowerCase()] ?? { time: '9:00 AM – 11:00 AM', day: 'Tuesday' }

  return (
    <div className="app-card-elevated flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Content Preview</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <Layers size={40} />
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div>
          <p className="text-sm leading-relaxed text-foreground line-clamp-4">{caption}</p>
        </div>
      )}

      {/* Scheduling details */}
      <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Scheduling Details</p>
        {[
          {
            label: 'Platform',
            value: (
              <span className="flex items-center gap-1.5">
                <SocialIcon platform={post.platform} size={14} />
                <span className="font-medium capitalize">{getPlatformLabel(post.platform)}</span>
              </span>
            ),
          },
          { label: 'Post Type', value: post.content_type?.replace('_', ' ') ?? 'Image Post' },
          {
            label: 'Date',
            value: scheduledDate
              ? scheduledDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Not set',
          },
          {
            label: 'Time',
            value: scheduledDate
              ? scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              : '—',
          },
          { label: 'Time Zone', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Edit content button */}
      <Link href={`/outputs/${post.id}`}>
        <Button variant="secondary" size="sm" className="w-full gap-1.5">
          <Edit3 size={13} /> Edit Content
        </Button>
      </Link>

      {/* Best time to post */}
      <div className="rounded-xl border border-border/60 bg-primary/5 p-3 space-y-1">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-primary" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Best Time to Post</p>
        </div>
        <p className="text-[11px] text-muted-foreground">Based on your audience activity</p>
        <p className="text-sm font-bold text-primary">{bestTime.time}</p>
        <p className="text-xs text-muted-foreground">{bestTime.day}</p>
      </div>
    </div>
  )
}

// ─── Calendar View (simple week grid) ────────────────────────────────────────

function CalendarView({ posts }: { posts: PostItem[] }) {
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayPosts = posts.filter((p) => {
            if (!p.scheduled_at) return false
            const d = new Date(p.scheduled_at)
            return d.toDateString() === day.toDateString()
          })
          const isToday = day.toDateString() === today.toDateString()
          return (
            <div key={day.toISOString()} className="min-h-[120px]">
              <div className={cn('mb-2 rounded-lg px-2 py-1 text-center text-xs font-semibold', isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                <p>{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p>{day.getDate()}</p>
              </div>
              <div className="space-y-1.5">
                {dayPosts.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-2">
                    <SocialIcon platform={p.platform} size={12} />
                    <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      {displayCaption(p.caption, 'Post').slice(0, 40)}
                    </p>
                  </div>
                ))}
                {dayPosts.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/40 p-2 text-center text-[10px] text-muted-foreground/40">
                    Empty
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Scheduler main ───────────────────────────────────────────────────────────

function SchedulerInner() {
  const { mutate: mutateKeys } = useSWRConfig()
  const [activeTab, setActiveTab] = useState<SchedulerTab>('schedule')
  const [sortBy, setSortBy] = useState('soonest')
  const [selected, setSelected] = useState<PostItem | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    '/api/posts?limit=100',
    (url: string) => apiCall<{ posts?: PostItem[] }>(url),
    { revalidateOnFocus: false },
  )
  const posts = useMemo(() => data?.posts ?? [], [data?.posts])

  const invalidate = useCallback(
    () => mutateKeys((key) => typeof key === 'string' && key.startsWith('/api/posts')),
    [mutateKeys],
  )

  const toSchedule = useMemo(() => {
    const base = posts.filter((p) => {
      const eff = getEffectivePostStatus(p.status, p.approval_status)
      return eff === 'approved' || eff === 'scheduled'
    })
    if (sortBy === 'soonest') return base.sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''))
    if (sortBy === 'latest') return base.sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
    return base.sort((a, b) => a.platform.localeCompare(b.platform))
  }, [posts, sortBy])

  const queued = useMemo(() => posts.filter((p) => getEffectivePostStatus(p.status, p.approval_status) === 'scheduled'), [posts])
  const published = useMemo(() => posts.filter((p) => getEffectivePostStatus(p.status, p.approval_status) === 'published'), [posts])

  const scheduleAll = async () => {
    if (!toSchedule.length) return
    setBulkBusy(true)
    try {
      await Promise.all(
        toSchedule
          .filter((p) => getEffectivePostStatus(p.status, p.approval_status) === 'approved')
          .map((p) =>
            apiCall(`/api/posts/${p.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ status: 'scheduled', scheduled_at: p.scheduled_at || new Date(Date.now() + 3600_000).toISOString() }),
            }),
          ),
      )
      await mutate(); await invalidate()
      toast.success(`${toSchedule.length} posts scheduled`)
    } catch { toast.error('Failed to schedule all') } finally { setBulkBusy(false) }
  }

  const currentList = activeTab === 'queue' ? queued : activeTab === 'posted' ? published : toSchedule

  return (
    <PageContainer className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scheduler</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule and publish your content across platforms.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-1.5 h-9">
            <Calendar size={14} /> Bulk Schedule
          </Button>
          <Button size="sm" className="gap-1.5 h-9" onClick={scheduleAll} disabled={bulkBusy || !toSchedule.length}>
            {bulkBusy ? 'Scheduling…' : `Schedule All (${toSchedule.filter((p) => getEffectivePostStatus(p.status, p.approval_status) === 'approved').length})`}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto scrollbar-hide">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {activeTab === 'calendar' ? (
        <CalendarView posts={posts} />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px] xl:items-start">
          {/* ── Left: list ── */}
          <div className="space-y-4">
            {/* List header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-foreground">
                  {activeTab === 'schedule' ? 'Content to Schedule' : activeTab === 'queue' ? 'Publishing Queue' : 'Posted Content'}
                  {' '}
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                    {currentList.length}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'schedule' ? 'Review, customize and schedule your content.' : activeTab === 'queue' ? 'Posts queued for publishing.' : 'Successfully published posts.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Filter size={12} /> Filter
                </button>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground outline-none"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Items */}
            {isLoading ? (
              <div className="space-y-3">
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 py-16 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {activeTab === 'schedule' ? 'No content ready to schedule' : activeTab === 'queue' ? 'Queue is empty' : 'Nothing published yet'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeTab === 'schedule' ? 'Approve content in the Calendar to start scheduling.' : 'Schedule content to see it here.'}
                </p>
                {activeTab === 'schedule' && (
                  <Link href="/calendar" className="mt-4">
                    <Button size="sm" variant="secondary">Review Calendar</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentList.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    selected={selected?.id === post.id}
                    onSelect={() => setSelected((p) => p?.id === post.id ? null : post)}
                  />
                ))}
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Showing 1 to {currentList.length} of {currentList.length} results
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Preview panel ── */}
          <div className="xl:sticky xl:top-6">
            {selected ? (
              <PreviewPanel post={selected} onClose={() => setSelected(null)} />
            ) : (
              <div className="app-card-elevated flex flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Layers size={22} />
                </div>
                <p className="text-sm font-semibold text-foreground">Content Preview</p>
                <p className="text-xs text-muted-foreground">Select a post from the list to preview it here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default function SchedulerPage() {
  return (
    <Suspense>
      <SchedulerInner />
    </Suspense>
  )
}
