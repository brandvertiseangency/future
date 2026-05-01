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
    <div className="md:ml-[240px] border-b border-[#E5E7EB] bg-white px-4 py-2 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {WORKFLOW_STEPS.map((step, idx) => {
            const complete = idx < currentIdx
            const current = idx === currentIdx
            return (
              <div key={step.id} className="flex items-center gap-2">
                <Link
                  href={step.href}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-colors',
                    current && 'border-[#111111] bg-[#111111] text-white',
                    complete && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    !current && !complete && 'border-[#E5E7EB] bg-[#F7F7F8] text-[#6B7280] hover:bg-[#F3F4F6]'
                  )}
                >
                  {complete ? <Check className="h-3 w-3" /> : null}
                  {step.label}
                </Link>
                {idx < WORKFLOW_STEPS.length - 1 ? <span className="text-[#9CA3AF]">→</span> : null}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-[#6B7280]">Workflow completion</p>
        <p className="text-xs font-semibold text-[#111111]">{progress}%</p>
      </div>
    </div>
  )
}
