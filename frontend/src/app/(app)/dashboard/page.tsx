'use client'

import { CalendarDays, ImageIcon, WandSparkles } from 'lucide-react'
import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { NextStepCard, PageContainer } from '@/components/ui/page-primitives'
import { SectionCard, StatCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { getDashboardNextStep } from '@/lib/workflow-next-step'
import { logUxEvent } from '@/lib/ux-events'
import { displayCaption } from '@/lib/caption'
import { BrandChat } from '@/components/dashboard/brand-chat'

const fetcher = (url: string) => apiCall<Record<string, unknown>>(url)

export default function DashboardPage() {
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

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Studio</p>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl md:leading-[1.12]">
          {brandName}
          <span className="text-pull text-primary"> · </span>
          <span className="text-muted-foreground">home</span>
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Credits <span className="font-medium text-foreground">{credits}</span>
          <span className="mx-2 text-border">·</span>
          Scheduled this week <span className="font-medium text-foreground">{scheduledPosts}</span>
        </p>
      </div>

      {hasDataError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          Some dashboard metrics could not be refreshed. Values may be stale; please retry in a moment.
        </div>
      ) : null}

      <BrandChat brand={brand} />

      <NextStepCard
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

      <SectionCard title="Shortcuts" subtitle="Outside the chat — jump straight into tools.">
        <div className="flex flex-wrap gap-2">
          <Link href="/generate">
            <Button size="sm" className="h-9 gap-1.5">
              <WandSparkles className="h-3.5 w-3.5" />
              Quick generate
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="secondary" size="sm" className="h-9 gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Content calendar
            </Button>
          </Link>
          <Link href="/brand">
            <Button variant="outline" size="sm" className="h-9">
              Brand profile
            </Button>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Recent outputs" subtitle="Latest generated creatives.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentOutputs.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
              No outputs yet. Try Brand AI above, or open Quick generate.
            </div>
          ) : (
            recentOutputs.map((output) => (
              <div key={output.id} className="app-card group overflow-hidden transition-shadow hover:shadow-md">
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
                  <p className="line-clamp-2 text-sm text-foreground">{displayCaption(output.caption, 'Untitled output')}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {output.created_at ? new Date(output.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

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
          <Link href="/scheduler" className="mt-4 inline-block text-xs font-medium text-primary hover:underline">
            Open scheduler
          </Link>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
