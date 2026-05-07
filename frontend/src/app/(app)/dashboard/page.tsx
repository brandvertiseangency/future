'use client'

import { ArrowRight, CalendarDays, Sparkles, ImageIcon, Clock3, CheckCircle2, Circle, Zap } from 'lucide-react'
import { useMemo } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { useAuth } from '@/lib/auth-context'
import { HeroAiComposer } from '@/components/dashboard/hero-ai-composer'
import { SocialPublishingConnectors } from '@/components/dashboard/social-publishing-connectors'
import { cn } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/skeleton-card'

const fetcher = (url: string) => apiCall<Record<string, unknown>>(url)

type WorkflowState = 'no-brand' | 'no-plan' | 'needs-approval' | 'needs-scheduling' | 'active'

function deriveWorkflowState(
  hasBrand: boolean,
  totalPosts: number,
  scheduledCount: number,
  approvedCount: number,
): WorkflowState {
  if (!hasBrand) return 'no-brand'
  if (totalPosts === 0) return 'no-plan'
  if (approvedCount === 0 && scheduledCount === 0) return 'needs-approval'
  if (scheduledCount === 0) return 'needs-scheduling'
  return 'active'
}

const WORKFLOW_CTA: Record<WorkflowState, { title: string; sub: string; href: string; label: string; accent?: boolean }> = {
  'no-brand': {
    title: 'Set up your brand profile',
    sub: 'Your brand DNA powers every piece of content we create.',
    href: '/onboarding',
    label: 'Start brand setup',
    accent: true,
  },
  'no-plan': {
    title: 'Generate your content plan',
    sub: 'Let AI plan a full month of content ideas based on your brand.',
    href: '/calendar/generate',
    label: 'Generate plan',
    accent: true,
  },
  'needs-approval': {
    title: 'Review your content ideas',
    sub: 'You have posts waiting for approval before they can be scheduled.',
    href: '/calendar',
    label: 'Review ideas',
    accent: true,
  },
  'needs-scheduling': {
    title: 'Schedule your approved posts',
    sub: 'Approved posts are ready — assign them a publish slot.',
    href: '/scheduler',
    label: 'Open scheduler',
    accent: true,
  },
  active: {
    title: 'Content is flowing',
    sub: 'You have posts scheduled and publishing. Keep the momentum going.',
    href: '/outputs',
    label: 'View outputs',
    accent: false,
  },
}

const QUICK_LINKS = [
  { href: '/generate', label: 'Generate content', icon: Sparkles, hint: 'Create posts from a brief' },
  { href: '/calendar/generate', label: 'Plan calendar', icon: CalendarDays, hint: 'AI-planned month of ideas' },
  { href: '/outputs', label: 'View outputs', icon: ImageIcon, hint: 'Review all generated posts' },
  { href: '/scheduler', label: 'Publish queue', icon: Clock3, hint: 'Schedule posts for publishing' },
] as const

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? 'there'

  const { data: brandData, isLoading: brandLoading } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: creditsData, isLoading: creditsLoading } = useSWR('/api/credits/balance', fetcher, { revalidateOnFocus: false })
  const { data: statsData, isLoading: statsLoading } = useSWR('/api/posts/stats', fetcher, { revalidateOnFocus: false })

  const brand = (brandData as { brand?: { name?: string } })?.brand
  const credits = (creditsData as { balance?: number; plan?: string })?.balance ?? 0
  const plan = (creditsData as { plan?: string })?.plan ?? 'trial'
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const creditPct = Math.min((credits / maxCredits) * 100, 100)
  const isLowCredits = credits > 0 && creditPct < 15

  const totalPosts = (statsData as { total?: number })?.total ?? 0
  const scheduledCount = (statsData as { scheduled?: number })?.scheduled ?? 0
  const approvedCount = (statsData as { approved?: number })?.approved ?? 0
  const brandName = brand?.name ?? 'My Brand'
  const hasBrand = Boolean(brand?.name)

  const isLoading = brandLoading || statsLoading

  const workflowState = useMemo(
    () => deriveWorkflowState(hasBrand, totalPosts, scheduledCount, approvedCount),
    [hasBrand, totalPosts, scheduledCount, approvedCount],
  )
  const cta = WORKFLOW_CTA[workflowState]

  const onboardingChecklist = useMemo(() => [
    { label: 'Brand profile set up', done: hasBrand, href: '/onboarding' },
    { label: 'Content plan generated', done: totalPosts > 0, href: '/calendar/generate' },
    { label: 'Posts scheduled', done: scheduledCount > 0, href: '/scheduler' },
  ], [hasBrand, totalPosts, scheduledCount])

  const showChecklist = workflowState !== 'active'

  return (
    <PageContainer className="max-w-none space-y-6 px-0 pb-10">
      <PageIntroModal
        pageKey="dashboard"
        title="Welcome to your AI Design Hub"
        description="Start with Brand AI below, then move into your content pipeline when you are ready."
      />

      {/* Hero — AI composer */}
      <section className="relative overflow-hidden border-y border-border/45 bg-transparent px-4 py-10 md:px-8 md:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_48%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_90%)]" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center pt-6 text-center md:pt-10">
          <SocialPublishingConnectors />
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)] md:text-5xl">
            Time to ship, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
            Ask Brand AI to create campaigns, content plans, landing-page angles, and growth ideas for {brandName}.
          </p>
          <div className="mt-8 w-full">
            <HeroAiComposer showHeadline={false} />
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 space-y-4">
        {/* Contextual next-action card */}
        {isLoading ? (
          <SkeletonCard lines={2} />
        ) : (
          <div className={cn(
            'relative overflow-hidden rounded-[var(--radius-card-lg)] border p-5',
            cta.accent
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/65 bg-card/82 backdrop-blur-sm',
          )}>
            {cta.accent && (
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_0%_100%,rgba(0,59,255,0.06),transparent)]" />
            )}
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  cta.accent ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                )}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{cta.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cta.sub}</p>
                </div>
              </div>
              <Link href={cta.href}>
                <Button
                  size="sm"
                  variant={cta.accent ? 'default' : 'secondary'}
                  className="shrink-0 gap-1.5"
                >
                  {cta.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Onboarding progress checklist — shown for new users */}
        {showChecklist && !isLoading && (
          <div className="rounded-[var(--radius-card)] border border-border/65 bg-card/82 p-4 backdrop-blur-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Getting started</p>
            <div className="space-y-2">
              {onboardingChecklist.map(({ label, done, href }) => (
                <div key={label} className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <Link
                    href={href}
                    className={cn(
                      'text-sm transition-colors',
                      done ? 'text-muted-foreground line-through' : 'font-medium text-foreground hover:text-primary',
                    )}
                  >
                    {label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        {!statsLoading ? (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                label: 'Credits',
                value: `${credits}`,
                sub: `${Math.round(creditPct)}% of ${maxCredits}`,
                warn: isLowCredits,
                href: '/pricing',
              },
              { label: 'Posts generated', value: `${totalPosts}`, sub: 'Total workspace posts' },
              {
                label: 'Scheduled',
                value: `${scheduledCount}`,
                sub: scheduledCount > 0 ? 'Posts queued to publish' : 'None scheduled yet',
              },
              { label: 'Engagement', value: '—', sub: 'Connect analytics to unlock' },
            ].map(({ label, value, sub, warn, href }) => (
              <div
                key={label}
                className={cn(
                  'rounded-[var(--radius-card)] border p-4',
                  warn ? 'border-amber-300/60 bg-amber-50/50 dark:border-amber-700/40 dark:bg-amber-950/20' : 'border-border/65 bg-card/82 backdrop-blur-sm',
                )}
              >
                <p className={cn('text-[10px] font-semibold uppercase tracking-[0.12em]', warn ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>{label}</p>
                <p className={cn('mt-1 text-2xl font-bold tabular-nums leading-tight', warn ? 'text-amber-700 dark:text-amber-300' : 'text-foreground')}>{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                {warn && href ? (
                  <Link href={href} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400">
                    Upgrade plan
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        )}

        {/* Quick actions */}
        <div className="rounded-[var(--radius-card-lg)] border border-border/65 bg-card/82 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick actions</p>
            <Link href="/generate" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              All tools
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_LINKS.map(({ href, label, icon: Icon, hint }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-3 text-sm transition hover:border-primary/40 hover:bg-muted/55"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/15">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground leading-tight">{label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{hint}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
