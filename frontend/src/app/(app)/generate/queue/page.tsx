'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'

interface Job {
  id: string
  status: 'queued' | 'running' | 'paused' | 'complete' | 'failed'
  total_slots: number
  completed_slots: number
  failed_slots: number
  last_error?: string
}

interface SlotDetail {
  id: string
  post_idea: string
  status: 'pending' | 'generating' | 'generated' | 'failed'
}

function GenerationQueueInner() {
  const router = useRouter()
  const params = useSearchParams()
  const jobId = params.get('jobId')
  const { data: recentJobs } = useSWR(
    !jobId ? '/api/calendar/jobs/recent?limit=1' : null,
    (u: string) => apiCall<{ jobs?: Job[] }>(u),
    { revalidateOnFocus: false }
  )
  const resolvedJobId = jobId ?? recentJobs?.jobs?.[0]?.id ?? null

  const { data: jobData } = useSWR(
    resolvedJobId ? `/api/calendar/jobs/${resolvedJobId}` : null,
    (u: string) => apiCall<{ job: Job; slots: SlotDetail[] }>(u),
    {
      // Reduce DB/network pressure on long-running pages.
      refreshInterval: (data) => ((data as any)?.job?.status === 'running' || (data as any)?.job?.status === 'queued') ? 10000 : 0,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    }
  )

  const job: Job | undefined = (jobData as any)?.job
  const slots: SlotDetail[] = (jobData as any)?.slots ?? []
  const pct = job ? Math.round((job.completed_slots / Math.max(job.total_slots, 1)) * 100) : 0
  const computedDone = !!job && job.total_slots > 0 && (job.completed_slots + (job.failed_slots || 0)) >= job.total_slots

  if (!resolvedJobId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#6B7280]">
        No active generation job found.
      </div>
    )
  }
  if (!job) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#6B7280]"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading job...</div>

  const isActive = (job.status === 'running' || job.status === 'queued') && !computedDone
  const isDone = job.status === 'complete' || computedDone
  const etaMinutes = Math.max(1, Math.ceil((job.total_slots - job.completed_slots) * 0.6))
  const currentItem = slots.find((slot) => slot.status === 'generating') ?? slots.find((slot) => slot.status === 'pending')

  return (
    <PageContainer className="max-w-4xl">

      {/* Header */}
      <PageHeader
        title={isDone ? 'Generation complete' : <>Generating <span className="text-highlight">Creatives</span></>}
        description={`${job.completed_slots} of ${job.total_slots} completed`}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <SectionCard title="Progress" subtitle="Live generation status">
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F7F7F8]">
                {isActive ? <Loader2 className="h-8 w-8 animate-spin text-[#111111]" /> : <CheckCircle2 className="h-8 w-8 text-[#111111]" />}
              </div>
              <p className="text-3xl font-semibold text-[#111111]">{pct}%</p>
              <p className="text-sm text-[#6B7280]">{isDone ? 'Completed' : 'Generating...'}</p>
            </div>

            <div className="h-2 rounded-full bg-[#EFEFF1]">
              <div className="h-2 rounded-full bg-[#111111] transition-all" style={{ width: `${pct}%` }} />
            </div>

            <div className="space-y-2 text-sm">
              {['Analyzing Brand', 'Building Strategy', 'Writing Captions', 'Generating Visuals', 'Finalizing Content'].map((step, idx) => {
                const stepDone = pct >= (idx + 1) * 20
                return (
                  <div key={step} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                    <span className="text-[#111111]">{step}</span>
                    <span className="text-xs text-[#6B7280]">{stepDone ? 'Done' : 'In progress'}</span>
                  </div>
                )
              })}
            </div>

            {!isDone && (
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] px-3 py-2 text-xs text-[#6B7280]">
                Estimated time remaining: <span className="font-medium text-[#111111]">{etaMinutes}m</span>
              </div>
            )}

            {isDone && (
              <Button onClick={() => router.push('/outputs')} className="w-full">
                View Outputs
              </Button>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Live Activity" subtitle="Latest queue logs">
          {currentItem && (
            <div className="mb-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs">
              <p className="text-[#6B7280]">Currently generating</p>
              <p className="text-[#111111]">{currentItem.post_idea}</p>
            </div>
          )}
          <div className="space-y-2">
            {slots.slice(0, 10).map((slot) => (
              <div key={slot.id} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                <p className="text-[#111111]">{slot.post_idea}</p>
                <p className="text-xs text-[#6B7280]">{slot.status}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  )
}

export default function GenerationQueuePage() {
  return <Suspense><GenerationQueueInner /></Suspense>
}
