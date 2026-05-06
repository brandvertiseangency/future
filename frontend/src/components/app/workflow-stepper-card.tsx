'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import useSWR from 'swr'
import { WORKFLOW_STEPS, getWorkflowStepIndex } from '@/lib/workflow'
import { cn } from '@/lib/utils'
import { apiCall } from '@/lib/api'

function deriveWorkflowHighlight(
  pathname: string,
  stats: { total?: number; approved?: number; scheduled?: number; published?: number } | undefined,
  jobComplete: boolean,
): number {
  const routeIdx = getWorkflowStepIndex(pathname)
  if (routeIdx >= 0) return routeIdx

  const total = stats?.total ?? 0
  const approved = stats?.approved ?? 0
  const scheduled = (stats?.scheduled ?? 0) + (stats?.published ?? 0)
  if (scheduled > 0) return 5
  if (approved > 0 || total > 4) return 4
  if (jobComplete) return 3
  if (total > 0) return 2
  return 1
}

export function WorkflowStepperCard({ className }: { className?: string }) {
  const pathname = usePathname()
  const { data: stats } = useSWR('/api/posts/stats', (u: string) => apiCall<{ total?: number; approved?: number; scheduled?: number; published?: number }>(u), {
    revalidateOnFocus: false,
  })
  const { data: jobs } = useSWR('/api/calendar/jobs/recent?limit=1', (u: string) => apiCall<{ jobs?: { status?: string }[] }>(u), {
    revalidateOnFocus: false,
  })
  const jobComplete = jobs?.jobs?.[0]?.status === 'complete'

  const activeIdx = useMemo(
    () => deriveWorkflowHighlight(pathname, stats, jobComplete),
    [pathname, stats, jobComplete],
  )

  return (
    <aside
      className={cn(
        'app-card-elevated h-fit rounded-[var(--radius-card-lg)] border border-border/80 p-4 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Your workflow</p>
        <Link href="/calendar/generate" className="text-[11px] font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <ol className="space-y-0">
        {WORKFLOW_STEPS.map((step, idx) => {
          const complete = idx < activeIdx
          const current = idx === activeIdx

          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  'flex items-start gap-3 rounded-lg py-2.5 pl-1 pr-2 transition-colors',
                  current && 'bg-primary/[0.08]',
                  !current && 'hover:bg-muted/60',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                    complete && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                    current && 'border-primary bg-primary text-primary-foreground',
                    !complete && !current && 'border-border bg-muted/40 text-muted-foreground',
                  )}
                >
                  {complete ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span>{idx + 1}</span>}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span
                    className={cn(
                      'block text-[13px] font-medium leading-snug',
                      current ? 'text-foreground' : complete ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {current ? (
                    <span className="mt-0.5 block text-[11px] text-primary">Current step</span>
                  ) : complete ? (
                    <span className="mt-0.5 block text-[11px] text-emerald-700/90 dark:text-emerald-400/90">Completed</span>
                  ) : (
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">Pending</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
