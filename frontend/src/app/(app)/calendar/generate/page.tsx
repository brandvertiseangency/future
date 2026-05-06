'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, ChevronLeft, AlertCircle, RefreshCcw } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageIntroModal } from '@/components/app/page-intro-modal'

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const PLAN_LIMITS: Record<string, number> = { free: 12, pro: 30, agency: 60 }

const MIX_LABELS: Record<string, string> = {
  promotional: 'Promotional',
  educational: 'Educational',
  testimonial: 'Testimonial',
  bts: 'Behind the Scenes',
  festive: 'Festive / Seasonal',
}

function ContentMixSliders({
  mix, onChange,
}: {
  mix: Record<string, number>
  onChange: (m: Record<string, number>) => void
}) {
  const total = Object.values(mix).reduce((a, b) => a + b, 0)

  const update = (key: string, val: number) => {
    const next = { ...mix, [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Content Mix</label>
        <span className={cn('text-xs', total === 100 ? 'text-emerald-700' : 'text-red-600')}>
          {total}% {total === 100 ? 'OK' : '(must be 100%)'}
        </span>
      </div>
      <div className="space-y-3">
        {Object.entries(mix).map(([key, val]) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-foreground">{MIX_LABELS[key] ?? key}</span>
              <span className="text-sm text-muted-foreground">{val}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5} value={val}
              onChange={e => update(key, Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Something went wrong'
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.error === 'ONBOARDING_INCOMPLETE') {
      return 'Onboarding is incomplete. Please complete your brand profile and publishing preferences first.'
    }
    if (parsed?.error === 'insufficient_credits') {
      return `Not enough credits. Need ${parsed?.creditsRequired ?? 'more'} credits, available ${parsed?.creditsAvailable ?? 0}.`
    }
    if (parsed?.message && typeof parsed.message === 'string') return parsed.message
    if (parsed?.error && typeof parsed.error === 'string') return parsed.error
  } catch {
    // ignore parse errors
  }
  if (raw.includes('<!doctype html') || raw.includes('<html')) return 'Server returned an unexpected response. Please try again.'
  return raw
}

function getOnboardingMissingFromBrand(brand: any): string[] {
  if (!brand) return ['brand profile']
  const mix = brand.content_type_mix && typeof brand.content_type_mix === 'object'
    ? brand.content_type_mix
    : {}
  const mixTotal = (Object.values(mix) as unknown[]).reduce((sum: number, value) => sum + (Number(value) || 0), 0)

  return [
    !brand.name ? 'brand name' : '',
    !brand.description ? 'brand description' : '',
    !brand.industry ? 'industry' : '',
    !Array.isArray(brand.goals) || brand.goals.length === 0 ? 'goals' : '',
    !Array.isArray(brand.styles) || brand.styles.length === 0 ? 'styles' : '',
    !brand.audience_location ? 'audience location' : '',
    !Array.isArray(brand.audience_interests) || brand.audience_interests.length === 0 ? 'audience interests' : '',
    !Array.isArray(brand.active_platforms) || brand.active_platforms.length === 0 ? 'active platforms' : '',
    mixTotal !== 100 ? 'content mix (must total 100)' : '',
  ].filter(Boolean)
}

function CalendarGenerateInner() {
  const router = useRouter()

  const { data: brandData } = useSWR('/api/brands/current', (u: string) => apiCall<any>(u), { revalidateOnFocus: false })
  const { data: brandMeData } = useSWR('/api/brand/me', (u: string) => apiCall<any>(u), { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', (u: string) => apiCall<{ balance: number }>(u), { revalidateOnFocus: false })
  const { data: latestPlanData } = useSWR('/api/calendar/plans/latest', (u: string) => apiCall<any>(u), { revalidateOnFocus: false })

  const brand = brandMeData?.brand ?? brandData?.brand ?? brandData
  const credits = creditsData?.balance ?? 0

  const [month, setMonth] = useState(getCurrentMonth())
  const [postCount, setPostCount] = useState(12)
  const [mix, setMix] = useState({ promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const plan = brand?.plan ?? 'free'
  const maxPosts = PLAN_LIMITS[plan] ?? 12
  const creditsNeeded = postCount * 2
  const hasCredits = credits >= creditsNeeded
  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0)
  const missingOnboarding = getOnboardingMissingFromBrand(brand)
  const onboardingReady = missingOnboarding.length === 0
  const canGenerate = hasCredits && mixTotal === 100 && onboardingReady && !generating
  const latestPlanId = latestPlanData?.plan?.id

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setError('')
    try {
      const response = await apiCall<{ planId: string }>('/api/calendar/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ month, postCount, mixPreferences: mix }),
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      })
      router.push(`/calendar/review?planId=${response.planId}`)
    } catch (e: unknown) {
      setError(parseApiError(e))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageContainer className="max-w-6xl space-y-6">
      <PageIntroModal
        pageKey="calendar-generate"
        title="Plan your content with AI"
        description="Set your monthly content mix and generate a review-ready calendar."
      />
      <div className="flex flex-col gap-4">
        <Link
          href="/calendar"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to calendar
        </Link>

        <nav aria-label="Plan steps" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { n: 1, title: 'Configure', sub: 'Set your preferences', state: 'current' as const },
            { n: 2, title: 'Review plan', sub: 'See your content ideas', state: 'next' as const },
            { n: 3, title: 'Approve', sub: 'Finalize and continue', state: 'next' as const },
          ].map((s) => (
            <div
              key={s.n}
              className={cn(
                'rounded-xl border px-3 py-3 text-left transition-colors',
                s.state === 'current' ? 'border-primary bg-primary/[0.07] ring-1 ring-primary/15' : 'border-border/80 bg-card/80',
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Step {s.n}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </nav>
      </div>

      <PageHeader
        variant="hero"
        title={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary md:h-8 md:w-8" />
            <span>
              Generate <span className="text-pull text-primary">content plan</span>
            </span>
          </span>
        }
        description="Create a full month of content ideas tailored to your brand. Review and approve before credits are used."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px] xl:items-start">
        <SectionCard className="app-card-elevated" title="Plan configuration" subtitle="Month, volume, and content mix (must total 100%).">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Month</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">How many posts?</label>
                <span className="text-sm font-semibold text-foreground">{postCount}</span>
              </div>
              <input
                type="range"
                min={4}
                max={maxPosts}
                step={1}
                value={postCount}
                onChange={e => setPostCount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>4 min</span>
                <span>{maxPosts} max ({plan})</span>
              </div>
            </div>

            <ContentMixSliders mix={mix} onChange={(m) => setMix(m as typeof mix)} />
          </div>
        </SectionCard>

        <SectionCard className="app-card-elevated xl:sticky xl:top-24 h-fit" title="Summary" subtitle="Credits and actions">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <StatusBadge tone="neutral">{String(plan).toUpperCase()}</StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits needed</span>
              <span className="text-sm font-semibold text-foreground">{creditsNeeded}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="text-sm font-semibold text-foreground">{credits}</span>
            </div>
            <div className={cn('rounded-lg border px-3 py-2 text-xs', hasCredits ? 'border-border bg-muted/40 text-muted-foreground' : 'border-red-200 bg-red-50 text-red-600')}>
              {hasCredits ? `Will use ${creditsNeeded} credits — ${credits - creditsNeeded} remaining after.` : `Not enough credits. Need ${creditsNeeded}, have ${credits}.`}
            </div>
            {!onboardingReady ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Complete onboarding before generating a plan. Missing: {missingOnboarding.join(', ')}.
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link href="/onboarding"><Button size="sm" variant="secondary">Complete Onboarding</Button></Link>
                  <Link href="/brand/edit"><Button size="sm" variant="secondary">Fix in brand setup</Button></Link>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2 text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Generation failed</p>
                    <p className="mt-1 text-xs">{error}</p>
                  </div>
                </div>
                <Button variant="secondary" className="mt-3 w-full" onClick={handleGenerate} disabled={generating}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            ) : null}

            {latestPlanId ? (
              <div className="grid grid-cols-1 gap-2">
                <Button variant="secondary" onClick={() => router.push(`/calendar/review?planId=${latestPlanId}`)}>
                  Open latest plan
                </Button>
                <Button variant="secondary" onClick={() => router.push('/calendar/content')}>
                  Open Content Studio
                </Button>
              </div>
            ) : null}

            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
              <p className="text-xs font-semibold text-foreground">Need help?</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Guides for mix, frequency, and approvals.</p>
              <Link href="/dashboard" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                View guide
              </Link>
            </div>

            <div className="border-t border-border pt-4">
              <Button onClick={handleGenerate} disabled={!canGenerate} className="h-11 w-full">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Planning calendar…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate content plan
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
                Credits are charged only after you approve and confirm in review.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  )
}

export default function CalendarGeneratePage() {
  return (
    <Suspense>
      <CalendarGenerateInner />
    </Suspense>
  )
}
