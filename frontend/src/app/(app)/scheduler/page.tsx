'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'

type PostItem = {
  id: string
  caption: string
  image_url?: string
  platform: string
  status: string
  scheduled_at?: string
}

type Slot = {
  id: string
  label: string
  postId?: string
}

function DraggablePost({ post, selected, onSelect }: { post: PostItem; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-2 text-left ${selected ? 'border-[#111111] bg-[#F3F4F6]' : 'border-[#E5E7EB] bg-white'}`}
    >
      <p className="line-clamp-1 text-sm text-[#111111]">{post.caption || 'Untitled post'}</p>
      <p className="mt-1 text-xs text-[#6B7280] capitalize">{post.platform}</p>
    </button>
  )
}

function DroppableSlot({ slot, post }: { slot: Slot; post?: PostItem }) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  return (
    <div ref={setNodeRef} className={`min-h-[76px] rounded-lg border p-2 ${isOver ? 'border-[#111111] bg-[#F3F4F6]' : 'border-[#E5E7EB] bg-white'}`}>
      <p className="mb-2 text-xs text-[#6B7280]">{slot.label}</p>
      {post ? <p className="line-clamp-2 text-sm text-[#111111]">{post.caption}</p> : <p className="text-xs text-[#9CA3AF]">Drop post here</p>}
    </div>
  )
}

export default function SchedulerPage() {
  const searchParams = useSearchParams()
  const { data, mutate, error, isLoading } = useSWR('/api/posts?limit=30', (url: string) => apiCall<{ posts: PostItem[] }>(url), { revalidateOnFocus: false })
  const posts = data?.posts ?? []
  const sensors = useSensors(useSensor(PointerSensor))

  const [slots, setSlots] = useState<Slot[]>([
    { id: 'mon-10', label: 'Mon · 10:00 AM' },
    { id: 'tue-10', label: 'Tue · 10:00 AM' },
    { id: 'wed-10', label: 'Wed · 10:00 AM' },
    { id: 'thu-10', label: 'Thu · 10:00 AM' },
    { id: 'fri-10', label: 'Fri · 10:00 AM' },
    { id: 'sat-10', label: 'Sat · 10:00 AM' },
  ])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(posts[0]?.id ?? null)
  const [scheduling, setScheduling] = useState(false)
  const [comment, setComment] = useState('')
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const hydratedFromServerRef = useRef(false)
  const selectedFromOutputs = useMemo(
    () => (searchParams.get('postIds') || '').split(',').map((id) => id.trim()).filter(Boolean),
    [searchParams]
  )

  const postMap = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts])
  const selectedPost = selectedPostId ? postMap.get(selectedPostId) : undefined

  const getSlotIdFromScheduledAt = (scheduledAt?: string) => {
    if (!scheduledAt) return null
    const d = new Date(scheduledAt)
    if (Number.isNaN(d.getTime())) return null
    const dayToken = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]
    const hour = String(d.getHours())
    const slotId = `${dayToken}-${hour}`
    return slots.some((slot) => slot.id === slotId) ? slotId : null
  }

  useEffect(() => {
    if (!selectedPostId && posts.length > 0) {
      const firstFromOutputs = selectedFromOutputs.find((id) => posts.some((p) => p.id === id))
      setSelectedPostId(firstFromOutputs ?? posts[0].id)
    }
  }, [posts, selectedPostId, selectedFromOutputs])

  useEffect(() => {
    if (hydratedFromServerRef.current) return
    if (!posts.length) return
    const scheduled = posts.filter((post) => post.status === 'scheduled' || post.status === 'published')
    if (!scheduled.length) {
      hydratedFromServerRef.current = true
      return
    }
    setSlots((prev) =>
      prev.map((slot) => {
        const matched = scheduled.find((post) => getSlotIdFromScheduledAt(post.scheduled_at) === slot.id)
        return matched ? { ...slot, postId: matched.id } : slot
      })
    )
    hydratedFromServerRef.current = true
  }, [posts, slots])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    setSlots((prev) => prev.map((slot) => slot.id === over.id ? { ...slot, postId: String(active.id) } : slot))
  }

  const getNextScheduledIso = (slotId: string) => {
    const [dayToken, hourToken] = slotId.split('-')
    const dayMap: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 }
    const targetDow = dayMap[dayToken] ?? 1
    const targetHour = Number(hourToken) || 10
    const now = new Date()
    const next = new Date(now)
    const delta = (targetDow - now.getDay() + 7) % 7
    next.setDate(now.getDate() + delta)
    next.setHours(targetHour, 0, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 7)
    return next.toISOString()
  }

  const scheduleSelected = async () => {
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
          scheduled_at: getNextScheduledIso(target.id),
        }),
      })
      await mutate()
      toast.success('Post scheduled')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to schedule post')
    } finally {
      setScheduling(false)
    }
  }

  const unscheduleSelected = async () => {
    if (!selectedPost) return
    setScheduling(true)
    try {
      await apiCall(`/api/posts/${selectedPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selectedPost.status === 'published' ? 'published' : 'draft',
          scheduled_at: null,
        }),
      })
      setSlots((prev) => prev.map((slot) => (slot.postId === selectedPost.id ? { ...slot, postId: undefined } : slot)))
      await mutate()
      toast.success('Post moved back to queue')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule post')
    } finally {
      setScheduling(false)
    }
  }

  const deleteSelected = async () => {
    if (!selectedPost) return
    setScheduling(true)
    try {
      await apiCall(`/api/posts/${selectedPost.id}`, { method: 'DELETE' })
      setSlots((prev) => prev.map((slot) => (slot.postId === selectedPost.id ? { ...slot, postId: undefined } : slot)))
      setSelectedPostId(null)
      await mutate()
      toast.success('Post deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post')
    } finally {
      setScheduling(false)
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="scheduler"
        title="Plan and automate your posting"
        description="Drag content into time slots and use AI timing suggestions for better performance."
      />
      <PageHeader title={<>Content <span className="text-highlight">Scheduler</span></>} description="Drag and drop posts into calendar slots and publish confidently." />
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not refresh scheduler posts right now. Please retry in a moment.
        </div>
      ) : null}
      <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#6B7280]">
        Timezone: <span className="font-medium text-[#111111]">{timezone}</span> · Best time suggestion: 10:00 AM to 12:00 PM
      </div>

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
            </div>
          </SectionCard>

          <SectionCard title="Calendar Grid" subtitle="Drop posts into day/time cells">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => (
                <DroppableSlot key={slot.id} slot={slot} post={slot.postId ? postMap.get(slot.postId) : undefined} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Selected Post Details" subtitle="Review before scheduling" className="xl:sticky xl:top-20 h-fit">
            {selectedPost ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]">
                  {selectedPost.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedPost.image_url} alt={selectedPost.caption || 'Selected post'} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-[#9CA3AF]">No image</div>
                  )}
                </div>
                <p className="text-sm text-[#111111]">{selectedPost.caption}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge tone="neutral">{selectedPost.platform}</StatusBadge>
                  <StatusBadge tone={selectedPost.status === 'approved' ? 'success' : 'neutral'}>{selectedPost.status}</StatusBadge>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#6B7280]">Comments</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add notes for this scheduled post..."
                    className="min-h-20 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#111111]"
                  />
                </div>
                <Button className="w-full" onClick={scheduleSelected} disabled={scheduling}>
                  {scheduling ? 'Scheduling...' : 'Schedule Post'}
                </Button>
                <Button variant="secondary" className="w-full" onClick={unscheduleSelected} disabled={scheduling}>Reschedule</Button>
                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={deleteSelected} disabled={scheduling}>Delete Post</Button>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">Select a post to inspect details.</p>
            )}
          </SectionCard>
        </div>
      </DndContext>
    </PageContainer>
  )
}
