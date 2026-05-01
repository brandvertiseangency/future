export type NextStep = {
  title: string
  reason: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function getDashboardNextStep(input: { hasScheduledPosts: boolean; hasOutputs: boolean }): NextStep {
  if (!input.hasScheduledPosts) {
    return {
      title: 'Approve content calendar',
      reason: 'No scheduled posts yet. Approvals are the fastest way to unblock scheduling and publishing.',
      primaryCta: { label: 'Review Calendar', href: '/calendar' },
      secondaryCta: { label: 'Generate Calendar', href: '/calendar/generate' },
    }
  }
  if (!input.hasOutputs) {
    return {
      title: 'Generate creatives',
      reason: 'Your plan is approved and scheduled. Generate creatives now to complete the publishing pack.',
      primaryCta: { label: 'Generate Content', href: '/generate' },
      secondaryCta: { label: 'View Scheduler', href: '/scheduler' },
    }
  }
  return {
    title: 'Schedule selected outputs',
    reason: 'You already have creatives ready. Lock posting times to complete this cycle.',
    primaryCta: { label: 'Open Scheduler', href: '/scheduler' },
    secondaryCta: { label: 'Review Outputs', href: '/outputs' },
  }
}

