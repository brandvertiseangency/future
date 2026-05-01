export type CanonicalWorkflowState =
  | 'needs_brand'
  | 'calendar_planning'
  | 'needs_approval'
  | 'generating'
  | 'ready_outputs'
  | 'ready_schedule'

export function mapPostStatusToWorkflow(status?: string): CanonicalWorkflowState {
  if (!status) return 'needs_approval'
  if (status === 'draft') return 'needs_approval'
  if (status === 'approved') return 'generating'
  if (status === 'published' || status === 'scheduled') return 'ready_schedule'
  return 'needs_approval'
}

export function mapJobStatusToWorkflow(status?: string): CanonicalWorkflowState {
  if (!status) return 'calendar_planning'
  if (status === 'queued' || status === 'running' || status === 'paused') return 'generating'
  if (status === 'complete') return 'ready_outputs'
  return 'needs_approval'
}
