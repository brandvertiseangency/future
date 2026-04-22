'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { apiCall } from '@/lib/api'

interface Job {
  id: string
  status: 'queued' | 'running' | 'complete' | 'failed' | 'paused'
  total_slots: number
  completed_slots: number
  created_at: string
}

const STATUS_CONFIG = {
  queued:   { color: 'rgba(255,255,255,0.4)',  icon: Clock,        label: 'Queued'     },
  running:  { color: 'rgba(255,255,255,0.85)', icon: Loader2,      label: 'Generating' },
  complete: { color: 'rgba(200,255,200,0.7)',  icon: CheckCircle2, label: 'Complete'   },
  failed:   { color: 'rgba(244,63,94,0.8)',    icon: AlertCircle,  label: 'Failed'     },
  paused:   { color: 'rgba(255,255,255,0.3)',  icon: Clock,        label: 'Paused'     },
}

export function GenQueue() {
  const router = useRouter()
  const { data } = useSWR(
    '/api/calendar/jobs/recent',
    (url: string) => apiCall<{ jobs: Job[] }>(url),
    { refreshInterval: 5000, revalidateOnFocus: false }
  )
  const jobs: Job[] = (data as any)?.jobs ?? []

  return (
    <div className="card-silver" style={{ borderRadius: 14, padding: '16px 18px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
        Generation Queue
      </p>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No active jobs</p>
          <button
            onClick={() => router.push('/calendar/generate')}
            style={{
              marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)',
              background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Start generating →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.slice(0, 4).map(job => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.queued
            const Icon = cfg.icon
            const pct = job.total_slots > 0 ? (job.completed_slots / job.total_slots) * 100 : 0

            return (
              <div
                key={job.id}
                onClick={() => router.push(`/generate/queue?jobId=${job.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon
                      size={12}
                      color={cfg.color}
                      style={job.status === 'running' ? { animation: 'spin 1s linear infinite' } : {}}
                    />
                    <span style={{ fontSize: 12, color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontVariantNumeric: 'tabular-nums' }}>
                    {job.completed_slots}/{job.total_slots}
                  </span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 1,
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.7))',
                    transition: 'width 0.4s ease',
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
