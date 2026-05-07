'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { CalendarWorkflowStepper } from '@/components/app/calendar-workflow-stepper'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { toast } from 'sonner'
import { displayCaption } from '@/lib/caption'

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

type Plan = {
  id: string
  month: number
  year: number
  status: string
  total_posts: number
  created_at: string
}

type Slot = {
  id: string
  topic?: string
  content_type: string
  format?: string
  post_idea: string
  creative_copy?: string
  caption_draft?: string
  hashtags_draft?: string[]
  platform: string
  status: string
}

export default function CalendarContentPage() {
  const router = useRouter()
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [busySlotId, setBusySlotId] = useState<string | null>(null)

  const { data: plansData } = useSWR('/api/calendar/plans', (u: string) => apiCall<{ plans: Plan[] }>(u), {
    revalidateOnFocus: false,
  })
  const plans = plansData?.plans ?? []

  const resolvedPlanId = activePlanId || plans[0]?.id || null
  const { data: detailData, mutate } = useSWR(
    resolvedPlanId ? `/api/calendar/plans/${resolvedPlanId}` : null,
    (u: string) => apiCall<{ plan: Plan; slots: Slot[] }>(u),
    { revalidateOnFocus: false }
  )

  const slots = useMemo(() => detailData?.slots ?? [], [detailData])

  const generateSingle = async (slotId: string) => {
    if (!resolvedPlanId) return
    setBusySlotId(slotId)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/calendar/plans/${resolvedPlanId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ selectedSlotIds: [slotId] }),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      router.push(`/generate/queue?jobId=${json.jobId}`)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start generation')
    } finally {
      setBusySlotId(null)
      mutate()
    }
  }

  return (
    <PageContainer className="max-w-7xl space-y-6">
      <div className="flex items-center justify-end">
        <CalendarWorkflowStepper />
      </div>
      <PageHeader
        variant="hero"
        title={<>Content <span className="text-pull text-primary">studio</span></>}
        description="All generated calendar content is saved here. Review post details and generate each post one-by-one."
      />

      <div className="app-card-elevated rounded-[var(--radius-card-lg)] border border-border/80 bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Saved plans</p>
        <div className="flex flex-wrap gap-2">
          {plans.map((plan) => {
            const selected = plan.id === resolvedPlanId
            const label = `${plan.month}/${plan.year} · ${plan.total_posts} posts`
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setActivePlanId(plan.id)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/35 hover:text-foreground',
                )}
              >
                {label}
              </button>
            )
          })}
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground">No saved plans yet. Generate one from the content plan page.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {slots.map((slot) => {
          const hashtags = (slot.hashtags_draft || []).map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
          return (
            <div
              key={slot.id}
              className="app-card-elevated overflow-hidden rounded-[var(--radius-card-lg)] border border-border/80 bg-card shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
                <div className="min-w-0 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {slot.platform} · {slot.content_type} · {slot.format || 'single_image'}
                  </p>
                  <h3 className="text-base font-semibold text-foreground">{slot.topic || slot.post_idea}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{displayCaption(slot.post_idea, 'Post idea')}</p>
                  {slot.creative_copy && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{slot.creative_copy}</p>
                  )}
                  {slot.caption_draft && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{displayCaption(slot.caption_draft)}</p>
                  )}
                  {hashtags ? <p className="text-xs text-muted-foreground">{hashtags}</p> : null}
                </div>
                <div className="w-full shrink-0 space-y-2 border-t border-border pt-4 md:w-[200px] md:border-l md:border-t-0 md:pl-5 md:pt-0">
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-medium text-foreground">{slot.status}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => generateSingle(slot.id)}
                    disabled={busySlotId === slot.id}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busySlotId === slot.id ? 'Starting…' : 'Generate this post'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PageContainer>
  )
}
