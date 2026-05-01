export type WorkflowStep = {
  id: 'brand' | 'calendar' | 'approve' | 'generate' | 'outputs' | 'schedule'
  label: string
  href: string
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'brand', label: 'Brand Setup', href: '/brand' },
  { id: 'calendar', label: 'Calendar', href: '/calendar/generate' },
  { id: 'approve', label: 'Approve Content', href: '/calendar' },
  { id: 'generate', label: 'Generate', href: '/generate' },
  { id: 'outputs', label: 'Outputs', href: '/outputs' },
  { id: 'schedule', label: 'Schedule', href: '/scheduler' },
]

export function getWorkflowStepIndex(pathname: string): number {
  if (pathname.startsWith('/brand')) return 0
  if (pathname.startsWith('/calendar/generate') || pathname.startsWith('/calendar/review') || pathname.startsWith('/calendar/content')) return 1
  if (pathname.startsWith('/calendar')) return 2
  if (pathname.startsWith('/generate')) return 3
  if (pathname.startsWith('/outputs')) return 4
  if (pathname.startsWith('/scheduler')) return 5
  return -1
}

export function getWorkflowProgress(pathname: string): number {
  const idx = getWorkflowStepIndex(pathname)
  if (idx < 0) return 0
  return Math.round(((idx + 1) / WORKFLOW_STEPS.length) * 100)
}

export function getNextWorkflowAction(pathname: string): { label: string; href: string } | null {
  const idx = getWorkflowStepIndex(pathname)
  if (idx < 0 || idx >= WORKFLOW_STEPS.length - 1) return null
  const next = WORKFLOW_STEPS[idx + 1]
  return { label: next.label, href: next.href }
}

export function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  if (!segments.length) return ['Home']
  return ['Home', ...segments.map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))]
}
