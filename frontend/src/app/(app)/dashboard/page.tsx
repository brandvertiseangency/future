'use client'

import { CalendarDays, ImageIcon, Sparkles, WandSparkles } from 'lucide-react'
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
  const recentOutputs = ((outputsData as { posts?: { id: string; caption?: string; image_url?: string; created_at?: string }[] })?.posts ?? []).slice(0, 4)
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
        description="This is your control center where you track progress and generate content."
      />
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-8 md:px-10 md:py-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Studio</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl md:leading-[1.08]">
          Dashboard <span className="text-pull text-primary">overview</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Welcome back — here&apos;s what&apos;s happening for <span className="font-medium text-foreground">{brandName}</span>.
        </p>
      </header>
      {hasDataError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Some dashboard metrics could not be refreshed. Values may be stale; please retry in a moment.
        </div>
      ) : null}

      <NextStepCard
        title={nextStep.title}
        reason={`${nextStep.reason} You're ${usedPercent}% through this month's workflow.`}
        primaryCta={nextStep.primaryCta}
        secondaryCta={nextStep.secondaryCta}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Posts Remaining" value={postsLeft} />
        <StatCard label="Reels Remaining" value={reelsLeft} />
        <StatCard label="Credits Left" value={credits} />
        <StatCard label="Active Brand" value={brandName} />
      </div>

      <SectionCard title="Quick Actions" subtitle="Create your next output in one click.">
        <div className="flex flex-wrap gap-3">
          <Link href="/generate">
            <Button className="h-10"><WandSparkles className="mr-2 h-4 w-4" />Generate Content</Button>
          </Link>
          <Link href="/brand">
            <Button variant="secondary" className="h-10">Edit Brand</Button>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Recent Outputs" subtitle="Latest generated creatives.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentOutputs.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
              No outputs yet. Start from Generate Content.
            </div>
          ) : (
            recentOutputs.map((output) => (
              <div key={output.id} className="app-card group overflow-hidden transition-shadow hover:shadow-md">
                <div className="aspect-[4/3] bg-muted">
                  {output.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={output.image_url} alt={displayCaption(output.caption, 'Output image')} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm text-foreground">{displayCaption(output.caption, 'Untitled output')}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{output.created_at ? new Date(output.created_at).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Usage Summary" subtitle="Monthly consumption overview">
          <div className="flex items-center gap-4">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
              style={{
                background: `conic-gradient(var(--primary) ${usedPercent}%, var(--muted) ${usedPercent}% 100%)`,
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card">
                {usedPercent}%
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Posts <span className="font-semibold text-foreground">{totalPosts}/30</span></p>
              <p className="text-muted-foreground">Reels <span className="font-semibold text-foreground">{10 - reelsLeft}/10</span></p>
              <p className="text-muted-foreground">Credits <span className="font-semibold text-foreground">{credits}/200</span></p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Calendar Overview" subtitle="Weekly publishing map">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Scheduled this week</span>
            <span className="font-medium text-foreground">{scheduledPosts}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((scheduledPosts / 10) * 100, 100)}%` }} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <Sparkles className="h-4 w-4" />
            Keep approving content to increase publishing momentum.
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="rounded-md border border-border bg-card p-2 text-center">
                <p className="text-[10px] text-muted-foreground">{day}</p>
                <p className="text-sm font-semibold text-foreground">{index < scheduledPosts ? 1 : 0}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Activity Timeline" subtitle="Recent workflow events">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="rounded-lg border border-border bg-card px-3 py-2">Brand profile configured</li>
            <li className="rounded-lg border border-border bg-card px-3 py-2">Calendar plan generated</li>
            <li className="rounded-lg border border-border bg-card px-3 py-2">Posts approved and ready for creatives</li>
          </ul>
        </SectionCard>
        <SectionCard title="Smart Suggestion" subtitle="AI recommendation based on your activity">
          <p className="text-sm leading-relaxed text-muted-foreground">Try generating reels this week to improve engagement variety.</p>
          <Link href="/generate" className="mt-3 inline-block">
            <Button variant="secondary">Generate Reels</Button>
          </Link>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
