'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  AlertCircle,
  RefreshCcw,
  Minus,
  Plus,
  Bookmark,
  Info,
  HelpCircle,
  Check,
  ChevronRight,
} from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SocialIcon } from '@/components/ui/social-icon'

// ─── Types & constants ────────────────────────────────────────────────────────

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(value: string) {
  if (!value) return ''
  const [year, month] = value.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

const PLAN_LIMITS: Record<string, number> = { free: 12, trial: 12, pro: 30, agency: 60 }

const FREQUENCY_OPTIONS = [
  { value: '1', label: '1 post per week' },
  { value: '2', label: '2 posts per week' },
  { value: '3', label: '3 posts per week' },
  { value: '4', label: '4 posts per week' },
  { value: '5', label: '5 posts per week' },
  { value: 'daily', label: 'Daily' },
]

type MixKey = 'promotional' | 'educational' | 'engagement' | 'bts' | 'inspirational'

const MIX_ITEMS: { key: MixKey; label: string; description: string; emoji: string }[] = [
  { key: 'promotional', label: 'Promotional', description: 'Showcase products, offers and company updates', emoji: '📣' },
  { key: 'educational', label: 'Educational', description: 'Share tips, guides and how-to content', emoji: '📚' },
  { key: 'engagement', label: 'Engagement', description: 'Polls, questions, quizzes & community', emoji: '💬' },
  { key: 'bts', label: 'Behind the Scenes', description: 'Team, process and brand stories', emoji: '🎬' },
  { key: 'inspirational', label: 'Inspirational', description: 'Motivate and inspire your audience', emoji: '⭐' },
]

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'] as const
type Platform = (typeof PLATFORMS)[number]

const DEFAULT_PILLARS = ['Product Quality', 'Customer Trust', 'Innovation', 'Sustainability']

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Something went wrong'
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.error === 'ONBOARDING_INCOMPLETE') return 'Complete your brand profile before generating a plan.'
    if (parsed?.error === 'insufficient_credits') return `Not enough credits. Need ${parsed?.creditsRequired ?? 'more'}, have ${parsed?.creditsAvailable ?? 0}.`
    if (typeof parsed?.message === 'string') return parsed.message
    if (typeof parsed?.error === 'string') return parsed.error
  } catch { /* ignore */ }
  return raw
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, title: 'Configure', sub: 'Set your preferences' },
    { n: 2, title: 'Review Plan', sub: 'See your content ideas' },
    { n: 3, title: 'Approve', sub: 'Finalize and continue' },
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => {
        const state = s.n < current ? 'done' : s.n === current ? 'active' : 'upcoming'
        return (
          <div
            key={s.n}
            className={cn(
              'rounded-xl border px-4 py-3 transition-colors',
              state === 'active' && 'border-primary bg-primary/8 ring-1 ring-primary/20',
              state === 'done' && 'border-border/60 bg-card/60',
              state === 'upcoming' && 'border-border/40 bg-card/30',
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                  state === 'active' && 'bg-primary text-white',
                  state === 'done' && 'bg-primary/20 text-primary',
                  state === 'upcoming' && 'bg-muted text-muted-foreground',
                )}
              >
                {state === 'done' ? <Check size={10} strokeWidth={3} /> : s.n}
              </span>
              {i < 2 && (
                <div className={cn('hidden sm:flex flex-1 h-px', state === 'done' ? 'bg-primary/40' : 'bg-border/40')} />
              )}
            </div>
            <p className={cn('text-[13px] font-semibold', state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground')}>
              {s.title}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Number stepper ───────────────────────────────────────────────────────────

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-l-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <div className="flex h-9 min-w-[3rem] items-center justify-center border-y border-border bg-card px-3 text-sm font-semibold text-foreground">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-r-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function CalendarGenerateInner() {
  const router = useRouter()

  const { data: brandData } = useSWR('/api/brands/current', (u: string) => apiCall<{ brand?: { plan?: string } }>(u), { revalidateOnFocus: false })
  const { data: brandMeData } = useSWR('/api/brand/me', (u: string) => apiCall<{ brand?: { plan?: string } }>(u), { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', (u: string) => apiCall<{ balance: number; plan?: string }>(u), { revalidateOnFocus: false })
  const { data: latestPlanData } = useSWR('/api/calendar/plans/latest', (u: string) => apiCall<{ plan?: { id: string } }>(u), { revalidateOnFocus: false })

  const credits = creditsData?.balance ?? 0
  const plan = brandMeData?.brand?.plan ?? brandData?.brand?.plan ?? creditsData?.plan ?? 'trial'
  const maxPosts = PLAN_LIMITS[plan] ?? 12

  const [month, setMonth] = useState(getCurrentMonth())
  const [postCount, setPostCount] = useState(12)
  const [frequency, setFrequency] = useState('3')
  const [mix, setMix] = useState<Record<MixKey, number>>({
    promotional: 30,
    educational: 25,
    engagement: 20,
    bts: 15,
    inspirational: 10,
  })
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram'])
  const [pillars, setPillars] = useState<string[]>(['Product Quality', 'Customer Trust'])
  const [customPillar, setCustomPillar] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0)
  const creditsNeeded = postCount * 2
  const hasCredits = credits >= creditsNeeded
  const canGenerate = hasCredits && mixTotal === 100 && !generating

  const updateMix = (key: MixKey, delta: number) => {
    setMix((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, prev[key] + delta)) }))
  }

  const resetToRecommended = () => {
    setMix({ promotional: 30, educational: 25, engagement: 20, bts: 15, inspirational: 10 })
  }

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const togglePillar = (p: string) => {
    setPillars((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  const addCustomPillar = () => {
    const trimmed = customPillar.trim()
    if (trimmed && !pillars.includes(trimmed)) {
      setPillars((prev) => [...prev, trimmed])
    }
    setCustomPillar('')
  }

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setError('')
    try {
      const response = await apiCall<{ planId: string }>('/api/calendar/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ month, postCount, mixPreferences: mix, platforms: selectedPlatforms, pillars }),
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      })
      router.push(`/calendar?planId=${response.planId}`)
    } catch (e) {
      setError(parseApiError(e))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageContainer className="max-w-7xl space-y-6">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Calendar
        </Link>
      </div>

      {/* Step indicator */}
      <StepIndicator current={1} />

      {/* Page heading */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground">
            Generate Content Plan
            <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a full month of content ideas tailored to your brand. Review and approve before moving to content generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
        {/* ── Left: Configuration ── */}
        <div className="space-y-5">
          {/* Plan Configuration */}
          <section className="app-card-elevated p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Plan Configuration</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Define the basics for your content plan.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Month */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Month</label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Number of Posts */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Number of Posts</label>
                  <span className="text-xs text-muted-foreground">{postCount} posts will be planned</span>
                </div>
                <Stepper value={postCount} min={4} max={maxPosts} onChange={setPostCount} />
              </div>

              {/* Frequency */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Posting Frequency</label>
                  <Info size={12} className="text-muted-foreground/60" />
                </div>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Content Mix */}
          <section className="app-card-elevated p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Content Mix</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Choose the types of content you want to focus on this month.</p>
              </div>
              <button
                type="button"
                onClick={resetToRecommended}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Sparkles size={12} />
                Recommended Mix
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {MIX_ITEMS.map(({ key, label, description, emoji }) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-[13px] font-semibold text-foreground">{label}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => updateMix(key, -5)}
                      disabled={mix[key] <= 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground hover:bg-muted disabled:opacity-40"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-base font-bold text-foreground tabular-nums">{mix[key]}%</span>
                    <button
                      type="button"
                      onClick={() => updateMix(key, 5)}
                      disabled={mix[key] >= 100}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground hover:bg-muted disabled:opacity-40"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium', mixTotal === 100 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400')}>
              <div className={cn('h-1.5 w-1.5 rounded-full', mixTotal === 100 ? 'bg-emerald-500' : 'bg-amber-500')} />
              Total: {mixTotal}% {mixTotal === 100 ? '— perfect balance' : `— needs to equal 100% (${mixTotal > 100 ? 'reduce' : 'increase'} by ${Math.abs(100 - mixTotal)}%)`}
            </div>
          </section>

          {/* Platforms */}
          <section className="app-card-elevated p-5 space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Platforms */}
              <div>
                <h2 className="mb-3 text-base font-semibold text-foreground">Platforms</h2>
                <p className="mb-3 text-xs text-muted-foreground">Select where this content will be planned.</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const active = selectedPlatforms.includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                          active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/60',
                        )}
                      >
                        <SocialIcon platform={p} size={16} />
                        {p === 'twitter' ? 'Twitter / X' : p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content Pillars */}
              <div>
                <h2 className="mb-3 text-base font-semibold text-foreground">Content Pillars <span className="text-muted-foreground font-normal text-sm">(Optional)</span></h2>
                <p className="mb-3 text-xs text-muted-foreground">Guide AI to generate ideas aligned with your core topics.</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_PILLARS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePillar(p)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        pillars.includes(p)
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:bg-muted/60',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  {pillars.filter((p) => !DEFAULT_PILLARS.includes(p)).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePillar(p)}
                      className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {p} ×
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      value={customPillar}
                      onChange={(e) => setCustomPillar(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomPillar()}
                      placeholder="+ Add Pillar"
                      className="h-8 w-28 rounded-full border border-dashed border-border bg-transparent px-3 text-xs text-muted-foreground outline-none focus:border-primary focus:text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Generation failed</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              </div>
              <Button variant="secondary" size="sm" className="ml-auto shrink-0" onClick={handleGenerate} disabled={generating}>
                <RefreshCcw size={13} className="mr-1.5" /> Retry
              </Button>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Bookmark size={14} />
              Save as Default
            </button>
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              size="lg"
              className="gap-2 px-8"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Planning calendar…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content Plan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── Right: Plan Summary ── */}
        <div className="space-y-4 xl:sticky xl:top-6">
          <div className="app-card-elevated p-5 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Plan Summary</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Preview of your plan details</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Month', value: monthLabel(month) },
                { label: 'Total Posts', value: postCount },
                { label: 'Frequency', value: FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label ?? frequency },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}

              {/* Platforms */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Platforms</span>
                <div className="flex items-center gap-1.5">
                  {selectedPlatforms.slice(0, 3).map((p) => (
                    <SocialIcon key={p} platform={p} size={16} />
                  ))}
                  {selectedPlatforms.length > 3 && (
                    <span className="text-xs font-semibold text-muted-foreground">+{selectedPlatforms.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Content Mix</p>
              <div className="space-y-1.5">
                {MIX_ITEMS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-70" />
                    <span className="flex-1 text-muted-foreground">{label}</span>
                    <span className="font-semibold tabular-nums text-foreground">{mix[key]}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Credits Required</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">{creditsNeeded}</span>
                <div className="text-xs text-muted-foreground">
                  <p>Estimated credits to generate this plan.</p>
                  <p className={cn('mt-0.5 font-semibold', hasCredits ? 'text-emerald-500' : 'text-destructive')}>
                    Your Balance: {credits} credits
                  </p>
                </div>
              </div>
              {!hasCredits && (
                <Link
                  href="/pricing"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Buy more credits <ChevronRight size={12} />
                </Link>
              )}
            </div>

            {latestPlanData?.plan?.id && (
              <div className="border-t border-border pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/calendar?planId=${latestPlanData?.plan?.id ?? ''}`)}
                >
                  Open Latest Plan
                </Button>
              </div>
            )}
          </div>

          {/* Need Help */}
          <div className="app-card-elevated p-4 space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle size={15} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Need Help?</p>
            </div>
            <p className="text-xs text-muted-foreground">Learn how planning works and get the best results.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View Guide <ChevronRight size={12} />
            </Link>
          </div>
        </div>
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
