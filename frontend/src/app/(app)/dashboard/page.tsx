'use client'

import { CalendarDays, ImageIcon, Clock3, Upload, ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { NextStepCard, PageContainer } from '@/components/ui/page-primitives'
import { StatCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { AppHero } from '@/components/app/app-hero'
import { SectionShell } from '@/components/ui/section-shell'
import { getDashboardNextStep } from '@/lib/workflow-next-step'
import { logUxEvent } from '@/lib/ux-events'
import { displayCaption } from '@/lib/caption'
import { BrandChat } from '@/components/dashboard/brand-chat'
import { useAuth } from '@/lib/auth-context'
import { WorkflowStepperCard } from '@/components/app/workflow-stepper-card'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => apiCall<Record<string, unknown>>(url)

const QUICK_LINKS = [
  { href: '/assets', label: 'Upload assets', icon: Upload },
  { href: '/generate', label: 'Generate content', icon: Sparkles },
  { href: '/scheduler', label: 'Open scheduler', icon: Clock3 },
  { href: '/calendar', label: 'View calendar', icon: CalendarDays },
] as const

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? 'there'

  const { data: brandData, error: brandError } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: creditsData, error: creditsError } = useSWR('/api/credits/balance', fetcher, { revalidateOnFocus: false })
  const { data: statsData, error: statsError } = useSWR('/api/posts/stats', fetcher, { revalidateOnFocus: false })
  const { data: scheduledData, error: scheduledError } = useSWR('/api/posts/scheduled?week=current', fetcher, {
    revalidateOnFocus: false,
  })
  const { data: outputsData, error: outputsError } = useSWR('/api/posts?limit=4', fetcher, { revalidateOnFocus: false })

  const brand = (brandData as { brand?: { name?: string } })?.brand
  const credits = (creditsData as { balance?: number; plan?: string })?.balance ?? 0
  const plan = (creditsData as { plan?: string })?.plan ?? 'trial'
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const creditsUsedPct = Math.min(Math.round((credits / Math.max(maxCredits, 1)) * 100), 100)

  const totalPosts = (statsData as { total?: number })?.total ?? 0
  const scheduledCount = (statsData as { scheduled?: number })?.scheduled ?? 0
  const scheduledPosts = ((scheduledData as { posts?: unknown[] })?.posts ?? []).length
  const postsLeft = Math.max(0, 30 - totalPosts)
  const reelsLeft = Math.max(0, 10 - Math.floor(totalPosts / 3))
  const recentOutputs = (
    (outputsData as { posts?: { id: string; caption?: string; image_url?: string; created_at?: string }[] })?.posts ?? []
  ).slice(0, 4)
  const brandName = brand?.name ?? 'My Brand'
  const usedPercent = Math.min(Math.round((totalPosts / 30) * 100), 100)
  const nextStep = getDashboardNextStep({ hasScheduledPosts: scheduledPosts > 0, hasOutputs: recentOutputs.length > 0 })
  const hasDataError = Boolean(brandError || creditsError || statsError || scheduledError || outputsError)

  const engagementPlaceholder = useMemo(
    () => ({ value: '—', sub: 'Connect analytics to see engagement', delta: undefined as string | undefined }),
    [],
  )

  useEffect(() => {
    logUxEvent('dashboard_next_step_rendered', { title: nextStep.title })
  }, [nextStep.title])

  return (
    <PageContainer className="space-y-6 md:space-y-8">
      <PageIntroModal
        pageKey="dashboard"
        title="Welcome to your AI Design Hub"
        description="Start with Brand AI below, then move into your content pipeline when you are ready."
      />

      <AppHero
        greeting={<>Hey {firstName}, how can we help today?</>}
        subtitle={
          <>
            You&apos;re in <span className="font-medium text-foreground">{brandName}</span>
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span className="text-muted-foreground">
              Credits <span className="font-semibold text-foreground">{credits}</span>
            </span>
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span className="text-muted-foreground">
              Scheduled this week <span className="font-semibold text-foreground">{scheduledPosts}</span>
            </span>
          </>
        }
      />

      {hasDataError ? (
        <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          Some dashboard metrics could not be refreshed. Values may be stale; please retry in a moment.
        </div>
      ) : null}

      <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="min-w-0 space-y-6 md:space-y-8">
          <div className="bv-surface-hero app-card-elevated overflow-hidden rounded-[var(--radius-card-lg)] border border-primary/15 shadow-[var(--shadow-card)]">
            <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.06] to-transparent px-4 py-3 md:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Brand AI</p>
              <h3 className="font-display text-xl font-normal tracking-tight text-foreground md:text-2xl">Ask your Brand AI</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Strategy, campaigns, captions, and ideas grounded in your brand profile.
              </p>
            </div>
            <div className="bg-card/40 p-3 md:p-4">
              <BrandChat brand={brand} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Content credits"
              value={`${credits} / ${maxCredits}`}
              sublabel={`${creditsUsedPct}% of plan headroom`}
              delta={undefined}
            />
            <StatCard
              label="Content generated"
              value={totalPosts}
              sublabel="All-time posts in workspace"
              delta={totalPosts > 0 ? 'Trends available in analytics soon' : undefined}
            />
            <StatCard
              label="Posts scheduled"
              value={scheduledCount}
              sublabel="Total scheduled in library"
              delta={scheduledPosts > 0 ? `+${scheduledPosts} this week` : undefined}
            />
            <StatCard
              label="Engagement (avg.)"
              value={engagementPlaceholder.value}
              sublabel={engagementPlaceholder.sub}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="lg:col-span-5">
              <NextStepCard
                dense
                title={nextStep.title}
                reason={`${nextStep.reason} You're ${usedPercent}% through this month's workflow.`}
                primaryCta={nextStep.primaryCta}
                secondaryCta={nextStep.secondaryCta}
              />
            </div>
            <div className="lg:col-span-4">
              <SectionShell
                title="Recent outputs"
                description="Latest creatives."
                contentClassName="mt-0"
              >
                <div className="flex gap-3 overflow-x-auto pb-1 pt-1 [-webkit-overflow-scrolling:touch]">
                  {recentOutputs.length === 0 ? (
                    <div className="min-w-[200px] flex-1 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                      <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">No outputs yet</p>
                      <Link href="/generate" className="mt-2 inline-block text-xs font-semibold text-primary">
                        Generate
                      </Link>
                    </div>
                  ) : (
                    recentOutputs.map((output) => (
                      <Link
                        key={output.id}
                        href={`/outputs/${output.id}`}
                        className="group w-[140px] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition hover:border-primary/40"
                      >
                        <div className="aspect-square bg-muted">
                          {output.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={output.image_url}
                              alt=""
                              className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <p className="line-clamp-2 p-2 text-[11px] font-medium leading-snug text-foreground">
                          {displayCaption(output.caption, 'Output')}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </SectionShell>
            </div>
            <div className="lg:col-span-3">
              <div className="app-card-elevated h-full rounded-[var(--radius-card-lg)] border border-border/80 p-4 shadow-[var(--shadow-card)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick actions</p>
                <ul className="mt-3 space-y-1">
                  {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition hover:bg-muted/70"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/agents"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Explore all tools
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:hidden">
            <StatCard label="Posts left" value={postsLeft} />
            <StatCard label="Reels left" value={reelsLeft} />
            <StatCard label="Credits" value={credits} />
            <StatCard label="Workflow" value={`${usedPercent}%`} />
          </div>
        </div>

        <WorkflowStepperCard className="xl:sticky xl:top-24" />
      </div>

      <div
        className={cn(
          'flex flex-col gap-3 rounded-[var(--radius-card-lg)] border border-primary/20 bg-primary/[0.06] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6',
        )}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Want better results?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Complete your brand setup and upload more assets to improve AI accuracy.
            </p>
          </div>
        </div>
        <Link href="/brand/edit">
          <Button className="w-full shrink-0 md:w-auto">Improve brand setup</Button>
        </Link>
      </div>
    </PageContainer>
  )
}
