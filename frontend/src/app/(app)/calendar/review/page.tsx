'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { displayCaption } from '@/lib/caption'
import { getFirebaseAuth } from '@/lib/firebase'
import { Edit2, Trash2, CheckCircle2, Loader2, ChevronLeft, Check } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')
async function getToken() { try { return (await getFirebaseAuth()?.currentUser?.getIdToken()) ?? null } catch { return null } }

interface Slot {
  id: string
  slot_date: string
  day_of_week: string
  topic?: string
  content_type: 'post' | 'reel' | 'carousel' | 'story'
  format?: string
  content_category: string
  post_idea: string
  creative_copy?: string
  creative_brief?: string
  caption_draft?: string
  hashtags_draft?: string[]
  platform: string
  status: string
}

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  post:     { bg: '#F7F7F8', border: '#E5E7EB', text: '#6B7280', label: 'Post' },
  reel:     { bg: '#F7F7F8', border: '#E5E7EB', text: '#6B7280', label: 'Reel' },
  carousel: { bg: '#F7F7F8', border: '#E5E7EB', text: '#6B7280', label: 'Carousel' },
  story:    { bg: '#F7F7F8', border: '#E5E7EB', text: '#6B7280', label: 'Story' },
}

function SlotCard({ slot, selected, onToggle, onDelete, onEdit }: {
  slot: Slot
  selected: boolean
  onToggle: () => void
  onDelete: () => void
  onEdit: (value: { topic?: string; post_idea?: string; creative_copy?: string; caption_draft?: string; hashtags_draft?: string[]; creative_brief?: string }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [topic, setTopic] = useState(slot.topic || '')
  const [idea, setIdea] = useState(slot.post_idea)
  const [creativeCopy, setCreativeCopy] = useState(slot.creative_copy || '')
  const [captionDraft, setCaptionDraft] = useState(slot.caption_draft || '')
  const [hashtagsDraft, setHashtagsDraft] = useState((slot.hashtags_draft || []).join(', '))
  const [creativeBrief, setCreativeBrief] = useState(slot.creative_brief || '')
  const styles = TYPE_STYLES[slot.content_type] ?? TYPE_STYLES.post
  const date = new Date(slot.slot_date)
  const day = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className="app-card bg-card border border-border"
      style={{
        borderRadius: 12, padding: '12px 14px',
        borderColor: selected ? '#191919' : undefined,
        position: 'relative', transition: 'border-color 0.15s',
      }}
    >
      {/* Select checkbox */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 18, height: 18, borderRadius: 5,
          background: selected ? '#191919' : '#fff',
          border: `1px solid ${selected ? '#191919' : '#D1D5DB'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {selected && <Check size={10} color="#fff" strokeWidth={3} />}
      </button>

      {/* Date */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{day} {dateStr}</span>
        <span style={{
          marginLeft: 6, fontSize: 9, padding: '2px 6px', borderRadius: 4,
          background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text,
        }}>
          {styles.label}
        </span>
      </div>

      {/* Idea */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            autoFocus
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onBlur={() => {
              onEdit({
                topic,
                post_idea: idea,
                creative_copy: creativeCopy,
                caption_draft: captionDraft,
                hashtags_draft: hashtagsDraft.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                creative_brief: creativeBrief,
              })
              setEditing(false)
            }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #D1D5DB',
              borderRadius: 7, padding: '8px 9px', color: '#191919', fontSize: 13,
              outline: 'none', fontFamily: 'inherit',
            }}
            placeholder="Topic"
          />
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onBlur={() => {
              onEdit({
                topic,
                post_idea: idea,
                creative_copy: creativeCopy,
                caption_draft: captionDraft,
                hashtags_draft: hashtagsDraft.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                creative_brief: creativeBrief,
              })
              setEditing(false)
            }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #D1D5DB',
              borderRadius: 7, padding: '6px 8px', color: '#191919', fontSize: 13,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            rows={3}
          />
          <textarea
            value={creativeCopy}
            onChange={e => setCreativeCopy(e.target.value)}
            onBlur={() => {
              onEdit({
                topic,
                post_idea: idea,
                creative_copy: creativeCopy,
                caption_draft: captionDraft,
                hashtags_draft: hashtagsDraft.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                creative_brief: creativeBrief,
              })
              setEditing(false)
            }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #D1D5DB',
              borderRadius: 7, padding: '6px 8px', color: '#374151', fontSize: 12,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            rows={3}
            placeholder="Creative copy"
          />
          <textarea
            value={captionDraft}
            onChange={e => setCaptionDraft(e.target.value)}
            onBlur={() => {
              onEdit({
                topic,
                post_idea: idea,
                creative_copy: creativeCopy,
                caption_draft: captionDraft,
                hashtags_draft: hashtagsDraft.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                creative_brief: creativeBrief,
              })
              setEditing(false)
            }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #D1D5DB',
              borderRadius: 7, padding: '6px 8px', color: '#374151', fontSize: 12,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            rows={3}
            placeholder="Caption draft"
          />
          <input
            value={hashtagsDraft}
            onChange={e => setHashtagsDraft(e.target.value)}
            onBlur={() => {
              onEdit({
                topic,
                post_idea: idea,
                creative_copy: creativeCopy,
                caption_draft: captionDraft,
                hashtags_draft: hashtagsDraft.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                creative_brief: creativeBrief,
              })
              setEditing(false)
            }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #D1D5DB',
              borderRadius: 7, padding: '8px 9px', color: '#374151', fontSize: 12,
              outline: 'none', fontFamily: 'inherit',
            }}
            placeholder="Hashtags (comma-separated)"
          />
          <textarea
            value={creativeBrief}
            onChange={e => setCreativeBrief(e.target.value)}
            onBlur={() => {
              onEdit({
                topic,
                post_idea: idea,
                creative_copy: creativeCopy,
                caption_draft: captionDraft,
                hashtags_draft: hashtagsDraft.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                creative_brief: creativeBrief,
              })
              setEditing(false)
            }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #D1D5DB',
              borderRadius: 7, padding: '6px 8px', color: '#374151', fontSize: 12,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            rows={3}
            placeholder="Creative brief (composition, lighting, product placement...)"
          />
        </div>
      ) : (
        <div style={{ marginBottom: 8, paddingRight: 24 }}>
          {slot.topic && (
            <p style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.35, marginBottom: 6 }}>
              Topic: {slot.topic}
            </p>
          )}
          <p style={{ fontSize: 14, color: '#191919', lineHeight: 1.45, marginBottom: slot.creative_brief ? 8 : 0 }}>
            {idea}
          </p>
          {slot.creative_copy && (
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.35, marginBottom: 6, whiteSpace: 'pre-wrap' }}>
              Creative Copy: {slot.creative_copy}
            </p>
          )}
          {slot.caption_draft && (
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.35, marginBottom: 6, whiteSpace: 'pre-wrap' }}>
              Caption: {displayCaption(slot.caption_draft)}
            </p>
          )}
          {slot.hashtags_draft && slot.hashtags_draft.length > 0 && (
            <p style={{ fontSize: 10.5, color: '#6B7280', lineHeight: 1.3 }}>
              Hashtags: {slot.hashtags_draft.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
            </p>
          )}
          {slot.creative_brief && (
            <p style={{ fontSize: 10.5, color: '#6B7280', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
              {slot.creative_brief}
            </p>
          )}
        </div>
      )}

      {/* Platform + category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#6B7280' }}>{slot.platform}</span>
        {slot.format && (
          <span style={{ fontSize: 10, color: '#6B7280' }}>· {slot.format}</span>
        )}
        {slot.content_category && (
          <span style={{ fontSize: 10, color: '#6B7280' }}>· {slot.content_category}</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:bg-muted"
          aria-label="Edit slot"
        >
          <Edit2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
          aria-label="Remove slot"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        surface="light"
        tone="danger"
        title="Remove this slot?"
        description="It will not be generated when you approve the plan."
        confirmLabel="Remove"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          onDelete()
        }}
      />
    </div>
  )
}

function CalendarReviewInner() {
  const router = useRouter()
  const params = useSearchParams()
  const planId = params.get('planId')
  const { data: latestPlanData } = useSWR(
    !planId ? '/api/calendar/plans/latest' : null,
    (u: string) => apiCall<any>(u),
    { revalidateOnFocus: false }
  )
  const resolvedPlanId = planId || latestPlanData?.plan?.id || null

  useEffect(() => {
    if (!planId && latestPlanData?.plan?.id) {
      router.replace(`/calendar/review?planId=${latestPlanData.plan.id}`)
    }
  }, [planId, latestPlanData, router])

  const { data: planData } = useSWR(
    resolvedPlanId ? `/api/calendar/plans/${resolvedPlanId}` : null,
    (u: string) => apiCall<any>(u),
    { revalidateOnFocus: false }
  )
  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (u: string) => apiCall<{ balance?: number }>(u),
    { revalidateOnFocus: false }
  )
  const creditBalance = creditsData?.balance ?? 0

  const plan = planData?.plan ?? planData
  const allSlots: Slot[] = planData?.slots ?? []
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string, { topic?: string; post_idea?: string; creative_copy?: string; caption_draft?: string; hashtags_draft?: string[]; creative_brief?: string }>>({})
  const [approving, setApproving] = useState(false)

  const slots = allSlots.filter(s => !deletedIds.has(s.id))
  const approvedCount = selected.size === 0 ? slots.length : selected.size
  const creditsNeeded = approvedCount * 2
  const insufficientCredits = creditBalance < creditsNeeded && slots.length > 0

  const toggleAll = () => {
    if (selected.size === slots.length) setSelected(new Set())
    else setSelected(new Set(slots.map(s => s.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  // Group by date
  const byDate: Record<string, Slot[]> = {}
  slots.forEach(s => {
    const d = s.slot_date.split('T')[0]
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(s)
  })

  const handleApprove = async () => {
    if (!resolvedPlanId) return
    if (insufficientCredits) {
      toast.error('Not enough credits to approve this selection.')
      return
    }
    setApproving(true)
    try {
      const slotIds = selected.size > 0 ? Array.from(selected) : slots.map(s => s.id)
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/calendar/plans/${resolvedPlanId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ selectedSlotIds: slotIds, slotEdits: edits }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { jobId } = await res.json()
      router.push(`/generate/queue?jobId=${jobId}`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve plan')
    } finally {
      setApproving(false)
    }
  }

  if (!planData) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading plan" />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="max-w-6xl">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 10, fontSize: 12 }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <PageHeader
            title="Review your calendar"
            description={`${slots.length} posts planned. Edit or remove any item before approval.`}
          />
        </div>

        {/* Approve CTA */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => void handleApprove()}
            disabled={approving || slots.length === 0 || insufficientCredits}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {approving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Approve & Generate
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Costs {creditsNeeded} credits · Balance {creditBalance}
            {insufficientCredits ? (
              <>
                {' '}
                ·{' '}
                <Link href="/settings#billing" className="font-medium text-red-600 underline-offset-2 hover:underline">
                  Top up
                </Link>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selected.size === 0 ? 'All posts selected' : `${selected.size} selected`}
          </p>
        </div>
      </div>

      {/* Select all */}
      <SectionCard title="Selection" subtitle="Choose which slots to include in generation." className="mb-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            checked={slots.length > 0 && (selected.size === 0 || selected.size === slots.length)}
            onChange={toggleAll}
          />
          <span>
            {slots.length > 0 && (selected.size === 0 || selected.size === slots.length)
              ? 'Deselect all slots'
              : 'Select all slots'}
          </span>
        </label>
      </SectionCard>

      {/* Grid by date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
          <div key={date}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {dateSlots.map(slot => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  selected={selected.size === 0 || selected.has(slot.id)}
                  onToggle={() => toggleOne(slot.id)}
                  onDelete={() => setDeletedIds(prev => new Set([...prev, slot.id]))}
                  onEdit={(value) => setEdits(prev => ({ ...prev, [slot.id]: { ...(prev[slot.id] || {}), ...value } }))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}

export default function CalendarReviewPage() {
  return <Suspense><CalendarReviewInner /></Suspense>
}
