'use client'

import { ArrowRight, CalendarDays, ImageIcon } from 'lucide-react'
import { useMemo } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { PageContainer } from '@/components/ui/page-primitives'
import { StatCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { useAuth } from '@/lib/auth-context'
import { HeroAiComposer } from '@/components/dashboard/hero-ai-composer'
import { SocialPublishingConnectors } from '@/components/dashboard/social-publishing-connectors'

const fetcher = (url: string) => apiCall<Record<string, unknown>>(url)

const QUICK_LINKS = [
  { href: '/generate', label: 'Create landing page draft' },
  { href: '/calendar/generate', label: 'Plan content calendar' },
  { href: '/outputs', label: 'Review latest outputs' },
  { href: '/scheduler', label: 'Open publish queue' },
] as const

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? 'there'

  const { data: brandData } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', fetcher, { revalidateOnFocus: false })
  const { data: statsData } = useSWR('/api/posts/stats', fetcher, { revalidateOnFocus: false })

  const brand = (brandData as { brand?: { name?: string } })?.brand
  const credits = (creditsData as { balance?: number; plan?: string })?.balance ?? 0
  const plan = (creditsData as { plan?: string })?.plan ?? 'trial'
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500

  const totalPosts = (statsData as { total?: number })?.total ?? 0
  const scheduledCount = (statsData as { scheduled?: number })?.scheduled ?? 0
  const brandName = brand?.name ?? 'My Brand'

  const engagementPlaceholder = useMemo(
    () => ({ value: '—', sub: 'Connect analytics to unlock' }),
    [],
  )

  return (
    <PageContainer className="max-w-none space-y-6 px-0 pb-10">
      <PageIntroModal
        pageKey="dashboard"
        title="Welcome to your AI Design Hub"
        description="Start with Brand AI below, then move into your content pipeline when you are ready."
      />

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

      <section className="px-4 md:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Content credits" value={`${credits} / ${maxCredits}`} sublabel="Current plan balance" />
          <StatCard label="Content generated" value={totalPosts} sublabel="Workspace total posts" />
          <StatCard label="Posts scheduled" value={scheduledCount} sublabel="Queued to publish" />
          <StatCard label="Engagement (avg.)" value={engagementPlaceholder.value} sublabel={engagementPlaceholder.sub} />
        </div>
      </section>

      <section className="px-4 pb-2 md:px-8">
        <div className="rounded-[var(--radius-card-lg)] border border-border/65 bg-card/82 p-4 shadow-[var(--shadow-card)] backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Templates</p>
            <Link href="/generate" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Browse all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-3 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted/55"
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8">
        <Link
          href="/brand/edit"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/60"
        >
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Improve brand setup
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>
    </PageContainer>
  )
}
