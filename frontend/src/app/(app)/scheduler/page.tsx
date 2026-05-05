'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import useSWR, { useSWRConfig } from 'swr'
import { useSearchParams } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { NextStepCard, PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { getEffectivePostStatus, getPostStatusHint, getPostStatusTone } from '@/lib/post-status'
import { logUxEvent } from '@/lib/ux-events'
import { displayCaption } from '@/lib/caption'
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
      className={`flex w-full gap-2 rounded-lg border px-2 py-2 text-left ${selected ? 'border-primary bg-muted' : 'border-border bg-card'}`}
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
      className={`min-h-[88px] rounded-lg border p-2 transition-colors ${isOver ? 'border-dashed border-2 border-primary bg-muted animate-pulse' : 'border-border bg-card'}`}
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
    if (!selectedPostId && posts.length > 0) {
      const firstFromOutputs = selectedFromOutputs.find((id) => posts.some((p) => p.id === id))
      setSelectedPostId(firstFromOutputs ?? posts[0].id)
    }
  }, [posts, selectedPostId, selectedFromOutputs])

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
    const target = slots.find((slot) => slot.postId === selectedPost.id)
    if (!target) {
      toast.error('Drag this post into a time slot first')
      return
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'TEXTAREA' || (event.target as HTMLElement)?.tagName === 'INPUT') return
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void scheduleSelected()
      }
      if (event.key.toLowerCase() === 'u') {
        event.preventDefault()
        void unscheduleSelected()
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        void deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [scheduleSelected, unscheduleSelected, deleteSelected])

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="scheduler"
        title="Plan and automate your posting"
        description="Drag content into calendar slots and use AI timing suggestions for better performance."
      />
      <PageHeader
        title={<>Content <span className="text-highlight">Scheduler</span></>}
        description="Drag and drop posts into calendar slots and publish confidently."
      />
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not refresh scheduler posts right now. Please retry in a moment.
        </div>
      ) : null}
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        Timezone: <span className="font-medium text-foreground">{timezone}</span>
        {offsetStr}
      </div>
      <NextStepCard
        title={hasSlotForSelected ? 'Schedule selected post now' : 'Assign selected post to a time slot'}
        reason={
          hasSlotForSelected
            ? 'Selected post has a valid slot assignment and is ready to schedule.'
            : 'Scheduling is blocked until a post is dropped into one of the calendar slots.'
        }
        primaryCta={hasSlotForSelected ? { label: 'Schedule This Post', href: '/scheduler' } : { label: 'Go to Outputs', href: '/outputs' }}
        secondaryCta={{ label: 'Review Calendar', href: '/calendar' }}
      />
      <p className="text-xs text-muted-foreground">
        Shortcuts: <kbd className="rounded border border-border px-1">Ctrl/Cmd + Enter</kbd> schedule,{' '}
        <kbd className="rounded border border-border px-1">U</kbd> remove from slot, <kbd className="rounded border border-border px-1">Backspace</kbd> move to draft.
      </p>

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

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_340px]">
          <SectionCard title="Posts" subtitle="Ready to schedule">
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

          <SectionCard title="Calendar Grid" subtitle="This week (Mon–Sun). Default slot time 10:00 when you press Schedule.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {slots.map((slot) => (
                <DroppableSlot key={slot.id} slot={slot} post={slot.postId ? postMap.get(slot.postId) : undefined} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Selected Post Details" subtitle="Review before scheduling" className="xl:sticky xl:top-20 h-fit">
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
                <div className="flex justify-end">
                  <StatusBadge tone={getPostStatusTone(getEffectivePostStatus(selectedPost.status, selectedPost.approval_status))}>
                    <span title={getPostStatusHint(getEffectivePostStatus(selectedPost.status, selectedPost.approval_status))}>
                      {getEffectivePostStatus(selectedPost.status, selectedPost.approval_status)}
                    </span>
                  </StatusBadge>
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
                <Button className="w-full" onClick={() => void scheduleSelected()} disabled={scheduling}>
                  {scheduling ? 'Scheduling...' : 'Schedule Post'}
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => openReschedule()} disabled={scheduling}>
                  Change date &amp; time
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => void unscheduleSelected()} disabled={scheduling}>
                  Remove from slot
                </Button>
                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => void deleteSelected()} disabled={scheduling}>
                  Move to draft
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a post to inspect details.</p>
            )}
          </SectionCard>
        </div>
      </DndContext>
    </PageContainer>
  )
}
