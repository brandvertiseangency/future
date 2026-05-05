'use client'

import { CalendarDays, ImageIcon, Wand2, LayoutGrid } from 'lucide-react'
import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { NextStepCard, PageContainer } from '@/components/ui/page-primitives'
import { SectionCard, StatCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { AppHero } from '@/components/app/app-hero'
import { QuickActionGrid } from '@/components/app/quick-action-grid'
import { SectionShell } from '@/components/ui/section-shell'
import { getDashboardNextStep } from '@/lib/workflow-next-step'
import { logUxEvent } from '@/lib/ux-events'
import { displayCaption } from '@/lib/caption'
import { BrandChat } from '@/components/dashboard/brand-chat'
import { useAuth } from '@/lib/auth-context'

const fetcher = (url: string) => apiCall<Record<string, unknown>>(url)

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? 'there'

  const { data: brandData, error: brandError } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: creditsData, error: creditsError } = useSWR('/api/credits/balance', fetcher, { revalidateOnFocus: false })
  const { data: statsData, error: statsError } = useSWR('/api/posts/stats', fetcher, { revalidateOnFocus: false })
  const { data: scheduledData, error: scheduledError } = useSWR('/api/posts/scheduled?week=current', fetcher, { revalidateOnFocus: false })
  const { data: outputsData, error: outputsError } = useSWR('/api/posts?limit=4', fetcher, { revalidateOnFocus: false })

  const brand = (brandData as { brand?: { name?: string } })?.brand
  const credits = (creditsData as { balance?: number })?.balance ?? 0
  const totalPosts = (statsData as { total?: number })?.total ?? 0
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

  useEffect(() => {
    logUxEvent('dashboard_next_step_rendered', { title: nextStep.title })
  }, [nextStep.title])

  return (
    <PageContainer className="space-y-8 md:space-y-10">
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

      <SectionShell
        title="Jump in"
        description="Pick a workflow — each opens the right tool for the job."
        contentClassName="mt-0"
      >
        <QuickActionGrid
          items={[
            {
              href: '/calendar/generate',
              title: 'Plan your month',
              description: 'Set mix and volume, then generate a review-ready calendar.',
              icon: Wand2,
            },
            {
              href: '/calendar',
              title: 'Content calendar',
              description: 'Review ideas, edit captions, and approve before generation.',
              icon: CalendarDays,
            },
            {
              href: '/generate',
              title: 'Quick create',
              description: 'One-off posts with your brand DNA — not tied to the calendar.',
              icon: LayoutGrid,
            },
            {
              href: '/outputs',
              title: 'Outputs',
              description: 'Browse generated creatives, versions, and download assets.',
              icon: ImageIcon,
            },
          ]}
        />
      </SectionShell>

      <div className="app-card-elevated overflow-hidden border border-border/80">
        <div className="border-b border-border/80 bg-muted/20 px-4 py-3 md:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Brand AI</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Strategy, captions, and ideas grounded in your profile.</p>
        </div>
        <div className="p-3 md:p-5">
          <BrandChat brand={brand} />
        </div>
      </div>

      <NextStepCard
        dense
        title={nextStep.title}
        reason={`${nextStep.reason} You're ${usedPercent}% through this month's workflow.`}
        primaryCta={nextStep.primaryCta}
        secondaryCta={nextStep.secondaryCta}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Posts left" value={postsLeft} />
        <StatCard label="Reels left" value={reelsLeft} />
        <StatCard label="Credits" value={credits} />
        <StatCard label="Workflow" value={`${usedPercent}%`} />
      </div>

      <SectionCard title="More shortcuts" subtitle="Jump straight into tools.">
        <div className="flex flex-wrap gap-2">
          <Link href="/generate">
            <Button size="sm" className="h-9 gap-1.5">
              <Wand2 className="h-3.5 w-3.5" />
              Quick generate
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="secondary" size="sm" className="h-9 gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar table
            </Button>
          </Link>
          <Link href="/settings#brand">
            <Button variant="outline" size="sm" className="h-9">
              Brand identity
            </Button>
          </Link>
        </div>
      </SectionCard>

      <SectionShell
        title="Recent outputs"
        description="Latest generated creatives from your workspace."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentOutputs.length === 0 ? (
            <div className="col-span-full rounded-[var(--radius-card)] border border-dashed border-border bg-muted/25 p-12 text-center">
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.25} />
              <p className="text-sm font-medium text-foreground">No outputs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Try Brand AI above, or open Quick generate.</p>
              <Link href="/generate" className="mt-4 inline-block">
                <Button size="sm">Create something</Button>
              </Link>
            </div>
          ) : (
            recentOutputs.map((output) => (
              <Link key={output.id} href={`/outputs/${output.id}`} className="app-card-elevated group block overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  {output.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={output.image_url}
                      alt={displayCaption(output.caption, 'Output image')}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{displayCaption(output.caption, 'Untitled output')}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {output.created_at ? new Date(output.created_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </SectionShell>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Usage" subtitle="Monthly progress">
          <div className="flex items-center gap-4">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
              style={{
                background: `conic-gradient(var(--primary) ${usedPercent}%, var(--muted) ${usedPercent}% 100%)`,
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card">{usedPercent}%</div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Posts <span className="font-semibold text-foreground">{totalPosts}/30</span>
              </p>
              <p className="text-muted-foreground">
                Reels <span className="font-semibold text-foreground">{10 - reelsLeft}/10</span>
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Calendar" subtitle="Publishing momentum">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Scheduled this week</span>
            <span className="font-medium text-foreground">{scheduledPosts}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((scheduledPosts / 10) * 100, 100)}%` }} />
          </div>
          <Link href="/scheduler" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
            Open scheduler
          </Link>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
