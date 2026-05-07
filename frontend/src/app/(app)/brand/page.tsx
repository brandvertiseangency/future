'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'
import { apiCall } from '@/lib/api'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { buttonVariants } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { cn } from '@/lib/utils'

export default function BrandOverviewPage() {
  const { data, isLoading } = useSWR(
    '/api/brands/current',
    (url: string) => apiCall<{ brand?: Record<string, unknown> | null }>(url),
    { revalidateOnFocus: false }
  )
  const brand = data?.brand ?? null

  if (isLoading) {
    return (
      <PageContainer className="space-y-4">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={4} />
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-foreground" />
          Loading brand…
        </div>
      </PageContainer>
    )
  }

  if (!brand) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader title="Brand" description="No default brand found yet. Finish onboarding or create a brand profile." />
        <SectionCard className="app-card-elevated" title="Get started" subtitle="Set up your brand so agents and calendars can use your DNA.">
          <Link href="/onboarding" className={cn(buttonVariants())}>
            Continue onboarding
          </Link>
        </SectionCard>
      </PageContainer>
    )
  }

  const goals = Array.isArray(brand.goals) ? (brand.goals as string[]) : []
  const platforms = Array.isArray(brand.active_platforms) ? (brand.active_platforms as string[]) : []

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="brand"
        title="Your brand at a glance"
        description="This overview reflects what is stored for your workspace. Edit details in Brand setup."
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          variant="compact"
          title={
            <>
              <span className="text-pull text-primary">Brand</span> overview
            </>
          }
          description="Read-only summary of your default brand. Changes apply across generation, calendar, and agents."
        />
        <Link href="/brand/edit" className={cn(buttonVariants(), 'shrink-0 sm:mt-1')}>
          Edit brand setup
        </Link>
      </div>

      <SectionCard className="app-card-elevated" title="Identity" subtitle="Name, positioning, and audience signals.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Brand name</p>
            <p className="mt-1 text-sm font-medium text-foreground">{String(brand.name ?? '—')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Industry</p>
            <p className="mt-1 text-sm font-medium text-foreground">{String(brand.industry ?? '—')}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">Tagline</p>
            <p className="mt-1 text-sm text-foreground">{brand.tagline ? String(brand.tagline) : '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{brand.description ? String(brand.description) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Audience location</p>
            <p className="mt-1 text-sm text-foreground">{brand.audience_location ? String(brand.audience_location) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Website</p>
            <p className="mt-1 text-sm text-foreground">{brand.website ? String(brand.website) : '—'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="app-card-elevated" title="Goals & channels" subtitle="What we optimise for and where you publish.">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Goals</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {goals.length ? goals.map((g) => (
                <span key={g} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">{g}</span>
              )) : <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active platforms</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {platforms.length ? platforms.map((p) => (
                <span key={p} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">{p}</span>
              )) : <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </div>
          {brand.weekly_post_count != null ? (
            <div>
              <p className="text-xs text-muted-foreground">Weekly post target</p>
              <p className="mt-1 text-sm font-medium text-foreground">{String(brand.weekly_post_count)}</p>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard className="app-card-elevated" title="Visual system" subtitle="Palette and cues we send to creative prompts.">
        <div className="flex flex-wrap items-center gap-4">
          {['color_primary', 'color_secondary', 'color_accent'].map((key) => {
            const hex = brand[key] ? String(brand[key]) : null
            if (!hex) return null
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="h-10 w-10 rounded-lg border border-border shadow-sm" style={{ backgroundColor: hex }} title={hex} />
                <span className="text-xs text-muted-foreground">{key.replace('color_', '')}</span>
              </div>
            )
          })}
          {!brand.color_primary && !brand.color_secondary && !brand.color_accent ? (
            <p className="text-sm text-muted-foreground">No colours on file.</p>
          ) : null}
        </div>
      </SectionCard>
    </PageContainer>
  )
}
