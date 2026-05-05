'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { PageContainer, PageHeader, SurfaceCard } from '@/components/ui/page-primitives'
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
    <PageContainer className="max-w-7xl">
      <PageHeader
        title="Calendar Content Studio"
        description="All generated calendar content is saved here. Review post details and generate each post one-by-one."
      />

      <SurfaceCard className="p-4 mt-4">
        <div className="flex flex-wrap gap-2">
          {plans.map((plan) => {
            const selected = plan.id === resolvedPlanId
            const label = `${plan.month}/${plan.year} · ${plan.total_posts} posts`
            return (
              <button
                key={plan.id}
                onClick={() => setActivePlanId(plan.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  border: selected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  background: selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  color: selected ? '#fff' : 'rgba(255,255,255,0.6)',
                }}
              >
                {label}
              </button>
            )
          })}
          {plans.length === 0 && <p className="text-sm text-white/40">No saved plans yet. Generate one from Content Plan page.</p>}
        </div>
      </SurfaceCard>

      <div className="grid gap-3 mt-4">
        {slots.map((slot) => {
          const hashtags = (slot.hashtags_draft || []).map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
          return (
            <SurfaceCard key={slot.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-white/40">
                    {slot.platform} · {slot.content_type} · {slot.format || 'single_image'}
                  </p>
                  <h3 className="text-base font-semibold text-white">{slot.topic || slot.post_idea}</h3>
                  <p className="text-sm text-white/70">{slot.post_idea}</p>
                  {slot.creative_copy && <p className="text-sm text-white/80 whitespace-pre-wrap">{slot.creative_copy}</p>}
                  {slot.caption_draft && (
                    <p className="text-sm text-white/65 whitespace-pre-wrap">{displayCaption(slot.caption_draft)}</p>
                  )}
                  {hashtags && <p className="text-xs text-white/45">{hashtags}</p>}
                </div>
                <div className="min-w-[160px] space-y-2">
                  <p className="text-xs text-white/40">Status: {slot.status}</p>
                  <button
                    onClick={() => generateSingle(slot.id)}
                    disabled={busySlotId === slot.id}
                    className="w-full rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      color: '#000',
                      opacity: busySlotId === slot.id ? 0.6 : 1,
                    }}
                  >
                    {busySlotId === slot.id ? 'Starting...' : 'Generate This Post'}
                  </button>
                </div>
              </div>
            </SurfaceCard>
          )
        })}
      </div>
    </PageContainer>
  )
}
