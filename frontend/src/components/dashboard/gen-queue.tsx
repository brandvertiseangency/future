'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'

interface Job {
  id: string
  status: 'queued' | 'running' | 'complete' | 'failed' | 'paused'
  total_slots: number
  completed_slots: number
  created_at: string
}

// Animated status dot
function StatusDot({ status }: { status: Job['status'] }) {
  const styles: Record<Job['status'], { color: string; glow: string; animate: boolean }> = {
    running:  { color: '#ffffff',  glow: 'rgba(255,255,255,0.5)', animate: true  },
    queued:   { color: 'rgba(255,255,255,0.35)', glow: 'transparent', animate: false },
    complete: { color: 'rgba(180,255,180,0.7)',  glow: 'rgba(180,255,180,0.3)', animate: false },
    failed:   { color: '#f43f5e', glow: 'rgba(244,63,94,0.4)', animate: false },
    paused:   { color: 'rgba(255,255,255,0.2)',  glow: 'transparent', animate: false },
  }
  const s = styles[status] ?? styles.queued
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10, flexShrink: 0 }}>
      {s.animate && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: s.color, opacity: 0.3,
          animation: 'ping-dot 1.5s cubic-bezier(0,0,0.2,1) infinite',
        }} />
      )}
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: s.color,
        boxShadow: s.animate ? `0 0 6px ${s.glow}` : 'none',
      }} />
    </span>
  )
}

const STATUS_LABEL: Record<Job['status'], string> = {
  running: 'Generating', queued: 'Queued', complete: 'Complete', failed: 'Failed', paused: 'Paused',
}

export function GenQueue() {
  const router = useRouter()
  const { data } = useSWR(
    '/api/calendar/jobs/recent',
    (url: string) => apiCall<{ jobs: Job[] }>(url),
    {
      refreshInterval: 15000,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    }
  )
  const jobs: Job[] = (data as any)?.jobs ?? []

  return (
    <div className="card-silver" style={{ borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          Queue
        </p>
        {jobs.length > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            padding: '2px 6px', borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
          }}>
            {jobs.length} job{jobs.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: '0 0 8px' }}>No active jobs</p>
          <button
            onClick={() => router.push('/calendar/generate')}
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.35)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            Start generating →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.slice(0, 4).map(job => {
            const pct = job.total_slots > 0 ? (job.completed_slots / job.total_slots) * 100 : 0
            return (
              <div
                key={job.id}
                onClick={() => router.push(`/generate/queue?jobId=${job.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <StatusDot status={job.status} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                    {STATUS_LABEL[job.status]}
                  </span>
                  <span style={{
                    fontSize: 10, fontVariantNumeric: 'tabular-nums',
                    color: 'rgba(255,255,255,0.25)',
                    padding: '1px 5px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    {job.completed_slots}/{job.total_slots}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 1,
                    width: `${pct}%`,
                    background: job.status === 'failed'
                      ? 'rgba(244,63,94,0.7)'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.65))',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
