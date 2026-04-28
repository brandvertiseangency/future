'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Loader2, CheckCircle2, AlertCircle, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { PageContainer, PageHeader, SurfaceCard } from '@/components/ui/page-primitives'

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
  content_type: string
  platform: string
  status: 'pending' | 'generating' | 'generated' | 'failed'
  post_id?: string
  image_url?: string
  error_message?: string
}

function GenerationQueueInner() {
  const router = useRouter()
  const params = useSearchParams()
  const jobId = params.get('jobId')

  const { data: jobData } = useSWR(
    jobId ? `/api/calendar/jobs/${jobId}` : null,
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

  if (!job) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 10 }}>
      <Loader2 size={22} color="rgba(255,255,255,0.25)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Loading job...</p>
    </div>
  )

  const isActive = (job.status === 'running' || job.status === 'queued') && !computedDone
  const isDone = job.status === 'complete' || computedDone

  return (
    <PageContainer className="max-w-4xl">

      {/* Header */}
      <PageHeader
        title={isDone ? 'Generation complete' : isActive ? 'Generating creatives...' : 'Generation paused'}
        description={`${job.completed_slots} of ${job.total_slots} posts generated${job.failed_slots > 0 ? ` · ${job.failed_slots} failed` : ''}`}
      />

      {/* Progress bar */}
      <SurfaceCard className="p-5 mb-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isActive && <Loader2 size={14} color="rgba(255,255,255,0.6)" style={{ animation: 'spin 1s linear infinite' }} />}
            {isDone && <CheckCircle2 size={14} color="rgba(200,255,200,0.7)" />}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
              {isActive ? 'Processing' : isDone ? 'Complete' : job.status}
            </span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 2,
            background: isDone
              ? 'linear-gradient(90deg, rgba(200,255,200,0.4), rgba(200,255,200,0.8))'
              : 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.75))',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {job.last_error && (
          <div className="mt-3 rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-red-300/70 mb-1">Failure reason</p>
            <p className="text-xs text-red-200/80 break-words">{job.last_error}</p>
          </div>
        )}

        {isDone && (
          <button
            onClick={() => router.push('/outputs')}
            className="btn-silver"
            style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            View all outputs <ChevronRight size={14} />
          </button>
        )}
      </SurfaceCard>

      {/* Slots list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slots.map(slot => (
          <div
            key={slot.id}
            className="card-silver"
            style={{ borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            {/* Thumbnail */}
            <div style={{
              width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {slot.image_url
                ? <img src={slot.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <ImageIcon size={16} color="rgba(255,255,255,0.15)" />
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {slot.post_idea}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                {slot.platform} · {slot.content_type}
              </p>
              {slot.status === 'failed' && slot.error_message && (
                <p style={{ fontSize: 11, color: 'rgba(248,113,113,0.85)', marginTop: 4 }} title={slot.error_message}>
                  {slot.error_message}
                </p>
              )}
            </div>

            {/* Status */}
            <div style={{ flexShrink: 0 }}>
              {slot.status === 'generated' && <CheckCircle2 size={16} color="rgba(200,255,200,0.6)" />}
              {slot.status === 'generating' && <Loader2 size={16} color="rgba(255,255,255,0.5)" style={{ animation: 'spin 1s linear infinite' }} />}
              {slot.status === 'failed' && <AlertCircle size={16} color="rgba(244,100,100,0.7)" />}
              {slot.status === 'pending' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)' }} />}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}

export default function GenerationQueuePage() {
  return <Suspense><GenerationQueueInner /></Suspense>
}
