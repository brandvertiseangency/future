'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import { apiCall } from '@/lib/api'
import { displayCaption } from '@/lib/caption'
import { getFirebaseAuth } from '@/lib/firebase'
import {
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Check,
  Search,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

async function getToken() {
  try {
    return (await getFirebaseAuth()?.currentUser?.getIdToken()) ?? null
  } catch {
    return null
  }
}

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

type SlotEdit = {
  topic?: string
  post_idea?: string
  creative_copy?: string
  caption_draft?: string
  hashtags_draft?: string[]
  creative_brief?: string
}

function formatDayLabel(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function CalendarReviewInner() {
  const router = useRouter()
  const { mutate: mutateKeys } = useSWRConfig()
  const params = useSearchParams()
  const planId = params.get('planId')
  const { data: latestPlanData } = useSWR(
    !planId ? '/api/calendar/plans/latest' : null,
    (u: string) => apiCall<any>(u),
    { revalidateOnFocus: false },
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
    { revalidateOnFocus: false },
  )
  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (u: string) => apiCall<{ balance?: number }>(u),
    { revalidateOnFocus: false },
  )
  const creditBalance = creditsData?.balance ?? 0

  const allSlots: Slot[] = planData?.slots ?? []

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string, SlotEdit>>({})
  const [approving, setApproving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | Slot['content_type']>('all')

  const slots = useMemo(() => allSlots.filter((s) => !deletedIds.has(s.id)), [allSlots, deletedIds])

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (typeFilter !== 'all' && s.content_type !== typeFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return [s.topic, s.post_idea, s.creative_copy, s.caption_draft]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [slots, search, typeFilter])

  const approvedCount = selected.size === 0 ? slots.length : selected.size
  const creditsNeeded = approvedCount * 2
  const insufficientCredits = creditBalance < creditsNeeded && slots.length > 0

  const allSelected = slots.length > 0 && (selected.size === 0 || selected.size === slots.length)

  const toggleAll = () => {
    if (selected.size === slots.length) setSelected(new Set())
    else setSelected(new Set(slots.map((s) => s.id)))
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Group by date
  const byDate = useMemo(() => {
    const map: Record<string, Slot[]> = {}
    filteredSlots.forEach((s) => {
      const d = s.slot_date.split('T')[0]
      if (!map[d]) map[d] = []
      map[d].push(s)
    })
    return map
  }, [filteredSlots])

  const handleApprove = async () => {
    if (!resolvedPlanId) return
    if (insufficientCredits) {
      toast.error('Not enough credits to approve this selection.')
      return
    }
    setApproving(true)
    try {
      const slotIds = selected.size > 0 ? Array.from(selected) : slots.map((s) => s.id)
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/calendar/plans/${resolvedPlanId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ selectedSlotIds: slotIds, slotEdits: edits }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { jobId } = await res.json()
      await mutateKeys((key) => typeof key === 'string' && key.startsWith('/api/posts'))
      router.push(`/generate/queue?jobId=${jobId}`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve plan')
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

  const editingSlot = editingId ? slots.find((s) => s.id === editingId) ?? null : null

  return (
    <PageContainer className="max-w-[1200px] space-y-5">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft size={14} /> Back to calendar
      </button>

      <PageHeader
        variant="hero"
        title={
          <>
            Approve <span className="text-pull text-primary">plan</span>
          </>
        }
        description={`${slots.length} posts planned. Select, edit or remove items before generating creatives.`}
      />

      {/* Sticky toolbar */}
      <div className="sticky top-2 z-30 rounded-xl border border-border bg-card/95 p-3 shadow-[var(--shadow-card)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary"
                checked={allSelected}
                onChange={toggleAll}
              />
              {allSelected ? 'All selected' : `${selected.size} selected`}
            </label>

            <div className="relative w-full min-w-[180px] flex-1 sm:w-auto sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics, ideas, captions…"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex h-9 rounded-lg border border-border bg-background p-0.5">
              {(['all', 'post', 'reel', 'carousel', 'story'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    'rounded-md px-2.5 text-xs font-medium capitalize transition-colors',
                    typeFilter === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden text-right text-xs leading-tight text-muted-foreground md:block">
              <p>
                Costs <span className="font-semibold text-foreground">{creditsNeeded}</span> credits ·{' '}
                <span className="font-medium text-foreground">{creditBalance}</span> available
              </p>
              {insufficientCredits ? (
                <Link href="/settings#billing" className="font-medium text-destructive underline-offset-2 hover:underline">
                  Top up credits
                </Link>
              ) : null}
            </div>
            <Button
              size="default"
              onClick={() => void handleApprove()}
              disabled={approving || slots.length === 0 || insufficientCredits}
            >
              {approving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve &amp; generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Date groups */}
      {filteredSlots.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No matching slots</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try changing the type filter or clearing the search.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateSlots]) => (
              <section key={date} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {formatDayLabel(date)}
                  </p>
                  <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {dateSlots.length} post{dateSlots.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {dateSlots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      selected={selected.size === 0 || selected.has(slot.id)}
                      onToggle={() => toggleOne(slot.id)}
                      onEdit={() => setEditingId(slot.id)}
                      onDelete={() => setDeleteId(slot.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      {/* Edit Drawer */}
      {editingSlot ? (
        <SlotEditDrawer
          slot={editingSlot}
          initial={edits[editingSlot.id]}
          onClose={() => setEditingId(null)}
          onSave={(value) => {
            setEdits((prev) => ({ ...prev, [editingSlot.id]: { ...(prev[editingSlot.id] || {}), ...value } }))
            setEditingId(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        tone="danger"
        title="Remove this slot?"
        description="It won't be generated when you approve the plan."
        confirmLabel="Remove"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) setDeletedIds((prev) => new Set([...prev, deleteId]))
          setDeleteId(null)
        }}
      />
    </PageContainer>
  )
}

function SlotCard({
  slot,
  selected,
  onToggle,
  onEdit,
  onDelete,
}: {
  slot: Slot
  selected: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const dateShort = formatShortDate(slot.slot_date)
  const typeLabel = slot.content_type
  return (
    <article
      className={cn(
        'group relative flex min-h-[180px] flex-col rounded-xl border bg-card p-4 transition-shadow',
        selected
          ? 'border-primary/40 shadow-[var(--shadow-card)]'
          : 'border-border hover:border-primary/30',
      )}
    >
      {/* Top row: date + type + select */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-foreground">{dateShort}</span>
          <span className="rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
            {typeLabel}
          </span>
          <span className="rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
            {slot.platform}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
            selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-transparent hover:border-foreground/40',
          )}
          aria-pressed={selected}
          aria-label={selected ? 'Deselect slot' : 'Select slot'}
        >
          <Check size={11} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 space-y-1.5">
        {slot.topic ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            {slot.topic}
          </p>
        ) : null}
        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {displayCaption(slot.post_idea, 'Untitled post idea')}
        </p>
        {slot.creative_copy ? (
          <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {slot.creative_copy}
          </p>
        ) : null}
        {slot.hashtags_draft && slot.hashtags_draft.length > 0 ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {slot.hashtags_draft
              .slice(0, 5)
              .map((h) => (h.startsWith('#') ? h : `#${h}`))
              .join(' ')}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border/70 pt-2">
        <Button size="sm" variant="ghost" onClick={onEdit} className="flex-1 justify-start text-muted-foreground hover:text-foreground">
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onDelete}
          aria-label="Remove slot"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  )
}

function SlotEditDrawer({
  slot,
  initial,
  onClose,
  onSave,
}: {
  slot: Slot
  initial?: SlotEdit
  onClose: () => void
  onSave: (value: SlotEdit) => void
}) {
  const [topic, setTopic] = useState(initial?.topic ?? slot.topic ?? '')
  const [postIdea, setPostIdea] = useState(initial?.post_idea ?? slot.post_idea)
  const [creativeCopy, setCreativeCopy] = useState(initial?.creative_copy ?? slot.creative_copy ?? '')
  const [captionDraft, setCaptionDraft] = useState(initial?.caption_draft ?? slot.caption_draft ?? '')
  const [hashtagsDraft, setHashtagsDraft] = useState(
    (initial?.hashtags_draft ?? slot.hashtags_draft ?? []).join(', '),
  )
  const [creativeBrief, setCreativeBrief] = useState(initial?.creative_brief ?? slot.creative_brief ?? '')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const submit = () => {
    onSave({
      topic: topic.trim() || undefined,
      post_idea: postIdea,
      creative_copy: creativeCopy,
      caption_draft: captionDraft,
      hashtags_draft: hashtagsDraft
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      creative_brief: creativeBrief,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex justify-end bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-full w-full max-w-lg flex-col bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {formatShortDate(slot.slot_date)} · {slot.content_type}
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-foreground">Edit slot</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Field label="Topic">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="Topic"
            />
          </Field>
          <Field label="Post idea">
            <textarea
              value={postIdea}
              onChange={(e) => setPostIdea(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
            />
          </Field>
          <Field label="Creative copy">
            <textarea
              value={creativeCopy}
              onChange={(e) => setCreativeCopy(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
              placeholder="Hook, body, CTA…"
            />
          </Field>
          <Field label="Caption draft">
            <textarea
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
            />
          </Field>
          <Field label="Hashtags" help="Comma-separated, # optional">
            <input
              value={hashtagsDraft}
              onChange={(e) => setHashtagsDraft(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="brandvertise, design, ai"
            />
          </Field>
          <Field label="Creative brief" help="Composition, lighting, props…">
            <textarea
              value={creativeBrief}
              onChange={(e) => setCreativeBrief(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
            />
          </Field>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Save changes
          </Button>
        </footer>
      </div>
    </div>
  )
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        {help ? <span className="text-[10px] text-muted-foreground/80">{help}</span> : null}
      </span>
      {children}
    </label>
  )
}

export default function CalendarReviewPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </PageContainer>
      }
    >
      <CalendarReviewInner />
    </Suspense>
  )
}
