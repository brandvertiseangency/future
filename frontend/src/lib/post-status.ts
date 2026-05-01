export type EffectivePostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'failed'

export function getEffectivePostStatus(status?: string, approvalStatus?: string): EffectivePostStatus {
  if (status === 'published') return 'published'
  if (status === 'scheduled') return 'scheduled'
  if (status === 'failed') return 'failed'
  if (approvalStatus === 'approved' || status === 'approved') return 'approved'
  return 'draft'
}

export function getPostStatusTone(status: EffectivePostStatus): 'neutral' | 'success' | 'warning' {
  if (status === 'approved' || status === 'scheduled' || status === 'published') return 'success'
  if (status === 'failed') return 'warning'
  return 'neutral'
}

export function getPostStatusHint(status: EffectivePostStatus): string {
  if (status === 'draft') return 'Draft: requires approval before scheduling'
  if (status === 'approved') return 'Approved: ready to schedule or publish'
  if (status === 'scheduled') return 'Scheduled: queued for publishing at selected time'
  if (status === 'published') return 'Published: already posted to destination channel'
  return 'Failed: generation or publishing encountered an error'
}

