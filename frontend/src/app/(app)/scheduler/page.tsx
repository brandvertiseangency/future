'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { addDays, format, startOfWeek } from 'date-fns'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import useSWR, { useSWRConfig } from 'swr'
import { useSearchParams } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { NextStepCard, PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { getEffectivePostStatus, getPostStatusHint, getPostStatusTone } from '@/lib/post-status'
import { logUxEvent } from '@/lib/ux-events'
import { displayCaption } from '@/lib/caption'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { CalendarClock } from 'lucide-react'

const DEFAULT_SLOT_HOUR = 10

type PostItem = {
  id: string
  caption: string
  image_url?: string
  platform: string
  status: string
  approval_status?: string
  scheduled_at?: string
  slot_topic?: string
}

type SchedulerMainTab = 'schedule' | 'queue' | 'calendar' | 'posted'

function SchedulerListCard({
  post,
  selected,
  onSelect,
}: {
  post: PostItem
  selected: boolean
  onSelect: () => void
}) {
  const cap = displayCaption(post.caption, 'Untitled post')
  const eff = getEffectivePostStatus(post.status, post.approval_status)
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5 shadow-[var(--shadow-card)] transition-colors',
        selected ? 'border-primary bg-primary/5 ring-1 ring-primary/15' : 'border-border/80 bg-card hover:border-primary/30',
      )}
    >
      <button type="button" onClick={onSelect} className="flex w-full gap-3 text-left">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-lg bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">{post.slot_topic || cap}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[11px] capitalize text-muted-foreground">{post.platform}</span>
            <StatusBadge tone={getPostStatusTone(eff)}>
              <span title={getPostStatusHint(eff)}>{eff}</span>
            </StatusBadge>
          </div>
          {post.scheduled_at ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Date(post.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          ) : null}
        </div>
      </button>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link href={`/outputs/${post.id}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-8')}>
          Edit content
        </Link>
      </div>
    </div>
  )
}

function SchedulerPreviewRail({
  selectedPost,
  comment,
  setComment,
  scheduling,
  onSchedule,
  onReschedule,
  onUnschedule,
  onDraft,
}: {
  selectedPost?: PostItem
  comment: string
  setComment: (v: string) => void
  scheduling: boolean
  onSchedule: () => void
  onReschedule: () => void
  onUnschedule: () => void
  onDraft: () => void
}) {
  const eff = selectedPost ? getEffectivePostStatus(selectedPost.status, selectedPost.approval_status) : null
  const published = eff === 'published'
  return (
    <div className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
      <SectionCard className="app-card-elevated" title="Best time to post" subtitle="Heuristic suggestion">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Weekday mornings (9–11) and early evenings (18–20) are strong defaults for most brands. Refine using native analytics for{' '}
          <span className="font-medium text-foreground">{selectedPost?.platform ?? 'each platform'}</span>.
        </p>
      </SectionCard>
      <SectionCard className="app-card-elevated h-fit" title="Selected post" subtitle="Review before scheduling">
        {selectedPost ? (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
              {selectedPost.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPost.image_url}
                  alt={displayCaption(selectedPost.caption, 'Selected post')}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="flex h-52 items-center justify-center text-muted-foreground/80">No image</div>
              )}
              <div className="pointer-events-none absolute left-2 top-2 rounded bg-card/85 px-2 py-0.5 text-[10px] font-medium capitalize text-foreground shadow-sm">
                {selectedPost.platform}
              </div>
            </div>
            <p className="text-sm text-foreground">{displayCaption(selectedPost.caption, 'No caption')}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone={getPostStatusTone(getEffectivePostStatus(selectedPost.status, selectedPost.approval_status))}>
                <span title={getPostStatusHint(getEffectivePostStatus(selectedPost.status, selectedPost.approval_status))}>
                  {getEffectivePostStatus(selectedPost.status, selectedPost.approval_status)}
                </span>
              </StatusBadge>
              <Link href={`/outputs/${selectedPost.id}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-8 shrink-0')}>
                Edit content
              </Link>
            </div>
            {selectedPost.scheduled_at ? (
              <p className="text-xs text-muted-foreground">
                Scheduled:{' '}
                <span className="font-medium text-foreground">
                  {new Date(selectedPost.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </p>
            ) : null}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Internal note</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Internal note for this schedule…"
                className="min-h-20 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <Button className="w-full" onClick={onSchedule} disabled={scheduling || published}>
              {scheduling ? 'Scheduling...' : 'Schedule Post'}
            </Button>
            <Button variant="secondary" className="w-full" onClick={onReschedule} disabled={scheduling || published}>
              Change date &amp; time
            </Button>
            <Button variant="secondary" className="w-full" onClick={onUnschedule} disabled={scheduling || published}>
              Remove from slot
            </Button>
            <Button
              variant="ghost"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDraft}
              disabled={scheduling || published}
            >
              Move to draft
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a post to inspect details.</p>
        )}
      </SectionCard>
    </div>
  )
}

type Slot = {
  /** Local calendar day key yyyy-MM-dd (Mon–Sun current week) */
  id: string
  label: string
  postId?: string
}

function slotIdForLocalDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function buildWeekSlots(anchor = new Date()): Slot[] {
  const monday = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    return {
      id: slotIdForLocalDate(d),
      label: `${format(d, 'EEE d MMM')} · 10:00 AM`,
      postId: undefined,
    }
  })
}

/** Map a scheduled ISO time to a grid day key (local date). */
function getSlotIdFromScheduledAt(scheduledAt?: string): string | null {
  if (!scheduledAt) return null
  const d = new Date(scheduledAt)
  if (Number.isNaN(d.getTime())) return null
  return slotIdForLocalDate(d)
}

/** Next occurrence of this calendar day at default publish hour (local wall clock → ISO UTC). */
function scheduledIsoForDayKey(dayKey: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dayKey).trim())
  if (!m) return new Date().toISOString()
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!y || !mo || !d) return new Date().toISOString()
  const next = new Date(y, mo - 1, d, DEFAULT_SLOT_HOUR, 0, 0, 0)
  const now = new Date()
  if (next <= now) {
    next.setDate(next.getDate() + 7)
  }
  return next.toISOString()
}

function DraggablePost({ post, selected, onSelect }: { post: PostItem; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  const cap = displayCaption(post.caption, 'Untitled post')
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      type="button"
      className={`flex w-full gap-2 rounded-xl border px-2 py-2 text-left shadow-sm transition-colors ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary/15' : 'border-border/80 bg-card hover:border-primary/30'}`}
    >
      {post.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm text-foreground">{cap}</p>
        <p className="mt-0.5 text-xs capitalize text-muted-foreground">{post.platform}</p>
      </div>
    </button>
  )
}

function DroppableSlot({ slot, post }: { slot: Slot; post?: PostItem }) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  const cap = post ? displayCaption(post.caption, 'Post') : ''
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[92px] rounded-xl border p-2 shadow-[var(--shadow-card)] backdrop-blur-sm transition-colors ${isOver ? 'animate-pulse border-2 border-dashed border-primary bg-muted/80' : 'border-border/80 bg-card'}`}
    >
      <p className="mb-2 text-xs text-muted-foreground">{slot.label}</p>
      {post?.image_url ? (
        <div className="space-y-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="" className="aspect-square w-full rounded-lg object-cover" />
          <p className="line-clamp-2 text-xs text-foreground">{cap}</p>
        </div>
      ) : post ? (
        <p className="line-clamp-2 text-sm text-foreground">{cap}</p>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 py-2 text-muted-foreground/80">
          <span className="text-lg leading-none">+</span>
          <p className="text-xs">Drop post here</p>
        </div>
      )}
    </div>
  )
}

export default function SchedulerPage() {
  const searchParams = useSearchParams()
  const { mutate: mutateGlobal } = useSWRConfig()
  const invalidateAllPostLists = useCallback(
    () => mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/posts')),
    [mutateGlobal],
  )

  const { data, mutate, error, isLoading } = useSWR(
    '/api/posts?limit=30',
    (url: string) => apiCall<{ posts: PostItem[] }>(url),
    { revalidateOnFocus: false },
  )
  const posts = useMemo(() => data?.posts ?? [], [data?.posts])
  const sensors = useSensors(useSensor(PointerSensor))

  const [slots, setSlots] = useState<Slot[]>(() => buildWeekSlots())
  const [mainTab, setMainTab] = useState<SchedulerMainTab>('schedule')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState(false)
  const [comment, setComment] = useState('')
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleValue, setRescheduleValue] = useState('')

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const offsetStr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' }).formatToParts(new Date())
      const tz = parts.find((p) => p.type === 'timeZoneName')?.value
      return tz ? ` (${tz})` : ''
    } catch {
      return ''
    }
  }, [timezone])

  const selectedFromOutputs = useMemo(
    () => (searchParams.get('postIds') || '').split(',').map((id) => id.trim()).filter(Boolean),
    [searchParams],
  )

  const postMap = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts])
  const selectedPost = selectedPostId ? postMap.get(selectedPostId) : undefined
  const hasSlotForSelected = Boolean(selectedPost && slots.some((slot) => slot.postId === selectedPost.id))

  const filteredByTab = useMemo(() => {
    return posts.filter((p) => {
      const eff = getEffectivePostStatus(p.status, p.approval_status)
      if (mainTab === 'schedule') return eff === 'draft' || eff === 'approved'
      if (mainTab === 'queue') return eff === 'scheduled'
      if (mainTab === 'posted') return eff === 'published'
      return true
    })
  }, [posts, mainTab])

  const listForTab = mainTab === 'calendar' ? posts : filteredByTab

  const scheduleFingerprint = useMemo(
    () =>
      posts
        .filter((p) => p.status === 'scheduled' || p.status === 'published')
        .map((p) => `${p.id}:${p.scheduled_at ?? ''}`)
        .sort()
        .join('|'),
    [posts],
  )

  useEffect(() => {
    const base = buildWeekSlots()
    const scheduled = posts.filter((p) => p.status === 'scheduled' || p.status === 'published')
    setSlots(
      base.map((slot) => {
        const matched = scheduled.find((p) => getSlotIdFromScheduledAt(p.scheduled_at) === slot.id)
        return matched ? { ...slot, postId: matched.id } : { ...slot, postId: undefined }
      }),
    )
  }, [scheduleFingerprint, posts])

  useEffect(() => {
    if (listForTab.length === 0) {
      if (selectedPostId !== null) setSelectedPostId(null)
      return
    }
    if (selectedPostId && listForTab.some((p) => p.id === selectedPostId)) return
    const firstFromOutputs = selectedFromOutputs.find((id) => listForTab.some((p) => p.id === id))
    setSelectedPostId(firstFromOutputs ?? listForTab[0].id)
  }, [listForTab, selectedPostId, selectedFromOutputs])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    const overId = String(over.id)
    setSlots((prev) =>
      prev
        .map((slot) => (slot.postId === active.id ? { ...slot, postId: undefined } : slot))
        .map((slot) => (slot.id === overId ? { ...slot, postId: String(active.id) } : slot)),
    )
  }

  const openReschedule = () => {
    if (!selectedPost) return
    const base = selectedPost.scheduled_at
      ? new Date(selectedPost.scheduled_at)
      : (() => {
          const slot = slots.find((s) => s.postId === selectedPost.id)
          if (!slot?.id) return new Date()
          const parts = slot.id.split('-').map(Number)
          const [y, m, d] = parts
          return y && m && d ? new Date(y, m - 1, d, DEFAULT_SLOT_HOUR, 0, 0, 0) : new Date()
        })()
    const pad = (n: number) => String(n).padStart(2, '0')
    const local = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`
    setRescheduleValue(local)
    setRescheduleOpen(true)
  }

  const applyReschedule = async () => {
    if (!selectedPost || !rescheduleValue) return
    const d = new Date(rescheduleValue)
    if (Number.isNaN(d.getTime())) {
      toast.error('Invalid date')
      return
    }
    setScheduling(true)
    try {
      await apiCall(`/api/posts/${selectedPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'scheduled',
          scheduled_at: d.toISOString(),
          scheduler_note: comment.trim() || null,
        }),
      })
      await mutate()
      await invalidateAllPostLists()
      setRescheduleOpen(false)
      toast.success('Schedule updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setScheduling(false)
    }
  }

  const scheduleSelected = useCallback(async () => {
    if (!selectedPost) return
    let target = slots.find((slot) => slot.postId === selectedPost.id)
    if (!target) {
      const empty = slots.find((slot) => !slot.postId)
      if (!empty) {
        toast.error('No free slot this week. Open Calendar view to pick a slot or use Change date & time.')
        return
      }
      setSlots((prev) => prev.map((slot) => (slot.id === empty.id ? { ...slot, postId: selectedPost.id } : slot)))
      target = { ...empty, postId: selectedPost.id }
    }
    setScheduling(true)
    try {
      await apiCall(`/api/posts/${selectedPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'scheduled',
          scheduled_at: scheduledIsoForDayKey(target.id),
          scheduler_note: comment.trim() || null,
        }),
      })
      await mutate()
      await invalidateAllPostLists()
      logUxEvent('scheduler_post_scheduled', { postId: selectedPost.id, slotId: target.id })
      toast.success('Post scheduled')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to schedule post')
    } finally {
      setScheduling(false)
    }
  }, [selectedPost, slots, comment, mutate, invalidateAllPostLists])

  const unscheduleSelected = useCallback(async () => {
    if (!selectedPost) return
    setScheduling(true)
    try {
      await apiCall(`/api/posts/${selectedPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selectedPost.status === 'published' ? 'published' : 'draft',
          scheduled_at: null,
          scheduler_note: null,
        }),
      })
      setSlots((prev) => prev.map((slot) => (slot.postId === selectedPost.id ? { ...slot, postId: undefined } : slot)))
      await mutate()
      await invalidateAllPostLists()
      toast.success('Removed from schedule')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove from slot')
    } finally {
      setScheduling(false)
    }
  }, [selectedPost, mutate, invalidateAllPostLists])

  const deleteSelected = useCallback(async () => {
    if (!selectedPost) return
    setScheduling(true)
    try {
      await apiCall(`/api/posts/${selectedPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'draft',
          scheduled_at: null,
          scheduler_note: null,
        }),
      })
      setSlots((prev) => prev.map((slot) => (slot.postId === selectedPost.id ? { ...slot, postId: undefined } : slot)))
      setSelectedPostId(null)
      await mutate()
      await invalidateAllPostLists()
      toast.success('Post moved to draft')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update post')
    } finally {
      setScheduling(false)
    }
  }, [selectedPost, mutate, invalidateAllPostLists])

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="scheduler"
        title="Plan and automate your posting"
        description="Drag content into calendar slots and use AI timing suggestions for better performance."
      />
      <PageHeader
        variant="compact"
        title={
          <>
            Content <span className="text-pull text-primary">scheduler</span>
          </>
        }
        description="Drag and drop posts into calendar slots and publish confidently."
      />
      {error ? (
        <div className="rounded-lg border border-amber-300/60 bg-card/75 px-3 py-2 text-xs text-amber-900 backdrop-blur-sm dark:border-amber-700/50 dark:bg-card/60 dark:text-amber-200">
          Could not refresh scheduler posts right now. Please retry in a moment.
        </div>
      ) : null}
      <div className="flex flex-col gap-3 rounded-xl border border-border/65 bg-card/78 px-4 py-3 text-xs text-muted-foreground shadow-[var(--shadow-card)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <span>
          Timezone: <span className="font-medium text-foreground">{timezone}</span>
          {offsetStr}
        </span>
        <span className="text-[11px] leading-relaxed sm:text-right">Use actions in the selected-post panel to manage scheduling.</span>
      </div>
      <NextStepCard
        dense
        title={hasSlotForSelected ? 'Schedule selected post now' : 'Assign a time slot'}
        reason={
          hasSlotForSelected
            ? 'Selected post has a slot on this week’s grid and is ready to schedule.'
            : 'Pick a post, then schedule—we’ll use the first open day slot if you have not dragged one yet, or open Calendar view to arrange manually.'
        }
        primaryCta={hasSlotForSelected ? { label: 'Schedule This Post', href: '/scheduler' } : { label: 'Go to Outputs', href: '/outputs' }}
        secondaryCta={{ label: 'Review Calendar', href: '/calendar' }}
      />

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as SchedulerMainTab)} className="space-y-4">
        <TabsList variant="line" className="flex h-auto w-full max-w-full flex-wrap justify-start gap-1 rounded-xl border border-border/80 bg-muted/30 p-1">
          <TabsTrigger value="schedule" className="text-xs sm:text-sm">
            Schedule content
          </TabsTrigger>
          <TabsTrigger value="queue" className="text-xs sm:text-sm">
            Publish queue
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">
            Calendar view
          </TabsTrigger>
          <TabsTrigger value="posted" className="text-xs sm:text-sm">
            Posted
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="max-w-md border-border bg-card p-6" showCloseButton>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarClock className="h-4 w-4" />
            Change date &amp; time
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Sets when this post is scheduled to publish (local time).</p>
          <input
            type="datetime-local"
            value={rescheduleValue}
            onChange={(e) => setRescheduleValue(e.target.value)}
            className="mt-3 h-10 w-full rounded-lg border border-border px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={() => void applyReschedule()} disabled={scheduling}>
              {scheduling ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {mainTab === 'calendar' ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_340px]">
            <SectionCard className="app-card-elevated" title="Posts" subtitle="Drag into the week grid">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                  </div>
                ) : null}
                {posts.map((post) => (
                  <DraggablePost key={post.id} post={post} selected={selectedPostId === post.id} onSelect={() => setSelectedPostId(post.id)} />
                ))}
                {!isLoading && posts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-sm text-foreground">No posts available for scheduling</p>
                    <p className="mt-1 text-xs text-muted-foreground">Approve items in Calendar or generate new outputs first.</p>
                  </div>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard className="app-card-elevated" title="Calendar grid" subtitle="This week (Mon–Sun). Default slot time 10:00 when you press Schedule.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {slots.map((slot) => (
                  <DroppableSlot key={slot.id} slot={slot} post={slot.postId ? postMap.get(slot.postId) : undefined} />
                ))}
              </div>
            </SectionCard>

            <SchedulerPreviewRail
              selectedPost={selectedPost}
              comment={comment}
              setComment={setComment}
              scheduling={scheduling}
              onSchedule={() => void scheduleSelected()}
              onReschedule={() => openReschedule()}
              onUnschedule={() => void unscheduleSelected()}
              onDraft={() => void deleteSelected()}
            />
          </div>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            className="app-card-elevated"
            title={
              mainTab === 'schedule'
                ? 'Ready to schedule'
                : mainTab === 'queue'
                  ? 'Publish queue'
                  : 'Posted'
            }
            subtitle={
              mainTab === 'schedule'
                ? 'Drafts and approved posts. Scheduling uses the first open day slot or your Calendar view placement.'
                : mainTab === 'queue'
                  ? 'Items with a scheduled publish time.'
                  : 'Recently published items.'
            }
          >
            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  <SkeletonCard lines={2} />
                  <SkeletonCard lines={2} />
                </div>
              ) : null}
              {listForTab.map((post) => (
                <SchedulerListCard
                  key={post.id}
                  post={post}
                  selected={selectedPostId === post.id}
                  onSelect={() => setSelectedPostId(post.id)}
                />
              ))}
              {!isLoading && listForTab.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {mainTab === 'schedule'
                      ? 'No posts ready to schedule'
                      : mainTab === 'queue'
                        ? 'Nothing in the publish queue'
                        : 'No published posts yet'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mainTab === 'schedule'
                      ? 'Generate and approve content first, then come back to schedule.'
                      : mainTab === 'queue'
                        ? 'Schedule a post from the "Schedule content" tab to see it here.'
                        : 'Published posts will appear here after they go live.'}
                  </p>
                  {mainTab === 'schedule' ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Link href="/calendar/generate" className={cn(buttonVariants({ size: 'sm', variant: 'default' }))}>
                        Generate plan
                      </Link>
                      <Link href="/outputs" className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }))}>
                        View outputs
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>
          <SchedulerPreviewRail
            selectedPost={selectedPost}
            comment={comment}
            setComment={setComment}
            scheduling={scheduling}
            onSchedule={() => void scheduleSelected()}
            onReschedule={() => openReschedule()}
            onUnschedule={() => void unscheduleSelected()}
            onDraft={() => void deleteSelected()}
          />
        </div>
      )}
    </PageContainer>
  )
}
