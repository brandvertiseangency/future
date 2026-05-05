'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import useSWR from 'swr'
import { WORKFLOW_STEPS, getWorkflowProgress, getWorkflowStepIndex } from '@/lib/workflow'
import { cn } from '@/lib/utils'
import { apiCall } from '@/lib/api'

export function WorkflowProgress() {
  const pathname = usePathname()
  const currentIdx = getWorkflowStepIndex(pathname)
  const baseProgress = getWorkflowProgress(pathname)
  const { data: stats } = useSWR('/api/posts/stats', (u: string) => apiCall<{ approved?: number; scheduled?: number; total?: number }>(u), { revalidateOnFocus: false })
  const { data: jobs } = useSWR('/api/calendar/jobs/recent?limit=1', (u: string) => apiCall<{ jobs?: { status?: string }[] }>(u), { revalidateOnFocus: false })
  const hasApproved = (stats?.approved ?? 0) > 0
  const hasScheduled = (stats?.scheduled ?? 0) > 0
  const hasGenerated = jobs?.jobs?.[0]?.status === 'complete'
  const progress = Math.max(
    baseProgress,
    hasApproved ? 50 : 0,
    hasGenerated ? 84 : 0,
    hasScheduled ? 100 : 0
  )

  return (
    <div className="md:ml-[260px] border-b border-border/80 bg-muted/30 px-4 py-1.5 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
          {WORKFLOW_STEPS.map((step, idx) => {
            const complete = idx < currentIdx
            const current = idx === currentIdx
            return (
              <div key={step.id} className="flex shrink-0 items-center gap-1.5">
                <Link
                  href={step.href}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors',
                    current && 'border-primary bg-primary text-primary-foreground shadow-sm',
                    complete && 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
                    !current && !complete && 'border-transparent bg-card text-muted-foreground hover:border-border hover:text-foreground'
                  )}
                >
                  {complete ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                  {step.label}
                </Link>
                {idx < WORKFLOW_STEPS.length - 1 ? (
                  <span className="text-muted-foreground/40 text-[10px]" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="hidden shrink-0 items-baseline gap-1.5 sm:flex">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Done</span>
          <span className="text-xs font-semibold tabular-nums text-foreground">{progress}%</span>
        </div>
      </div>
    </div>
  )
}
