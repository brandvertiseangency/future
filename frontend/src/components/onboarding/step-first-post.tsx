'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'
import { useOnboardingStore, type OnboardingData } from '@/stores/onboarding'
import { apiCall, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { AIButton } from '@/components/ui/ai-button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { logUxEvent } from '@/lib/ux-events'
import { StepHeader } from '@/components/onboarding/primitives/onboarding-shell'

const GENERATION_STEPS = [
  { label: 'Analysing your Brand DNA…',        duration: 2200 },
  { label: 'Mapping your content calendar…',   duration: 2600 },
  { label: 'Writing post ideas & captions…',   duration: 3000 },
  { label: 'Optimising for your platforms…',   duration: 2400 },
  { label: 'Finalising your content plan…',    duration: 1800 },
]

function GeneratingOverlay({
  postCount,
  error,
  onRetry,
  onSkip,
}: {
  postCount: number
  error: string
  onRetry: () => void
  onSkip: () => void
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [dots, setDots] = useState('.')

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(dotsInterval)
  }, [])

  useEffect(() => {
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    GENERATION_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => {
        setActiveStep(i)
        if (i > 0) setCompletedSteps(c => [...c, i - 1])
      }, elapsed))
      elapsed += step.duration
    })
    // Mark last step done shortly before real completion
    timers.push(setTimeout(() => {
      setCompletedSteps(c => [...c, GENERATION_STEPS.length - 1])
    }, elapsed))
    return () => timers.forEach(clearTimeout)
  }, [])

  const progress = Math.round(
    ((completedSteps.length / GENERATION_STEPS.length) * 100)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Sparkles size={22} className="animate-pulse text-foreground/70" />
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Building your plan{dots}</h3>
          <p className="text-sm text-muted-foreground">Creating {postCount} AI-powered posts for your brand</p>
        </div>

        <div className="space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">{progress}%</p>
        </div>

        <div className="space-y-2.5">
          {GENERATION_STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i)
            const isActive = activeStep === i && !isDone
            return (
              <div key={i} className={cn(
                'flex items-center gap-3 transition-opacity duration-300',
                isDone || isActive ? 'opacity-100' : 'opacity-40',
              )}>
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isDone
                    ? <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                    : isActive
                    ? <Loader2 size={15} className="animate-spin text-foreground/60" />
                    : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  }
                </div>
                <span className={cn(
                  'text-sm',
                  isDone ? 'text-muted-foreground line-through' : isActive ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          This can take up to a couple of minutes when the AI is busy
        </p>

        {error && (
          <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                Skip → Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const MIX_KEYS = ['promotional', 'educational', 'testimonial', 'bts', 'festive'] as const
const MIX_LABELS: Record<string, string> = {
  promotional: 'Promotional',
  educational: 'Educational',
  testimonial: 'Testimonial',
  bts: 'Behind the Scenes',
  festive: 'Festive / Seasonal',
}
const PLAN_LIMITS: Record<string, number> = { free: 12, pro: 30, agency: 60 }

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Failed to generate plan. Please try again.'
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.error === 'ONBOARDING_INCOMPLETE' && parsed?.missingBySection && typeof parsed.missingBySection === 'object') {
      const parts: string[] = []
      for (const [section, fields] of Object.entries(parsed.missingBySection as Record<string, unknown>)) {
        if (Array.isArray(fields) && fields.length) {
          parts.push(`${section}: ${fields.join(', ')}`)
        }
      }
      if (parts.length) {
        return `Complete required onboarding fields (${parts.join(' · ')}).`
      }
    }
    if (typeof parsed?.message === 'string' && parsed.message.trim()) return parsed.message
    if (typeof parsed?.error === 'string' && parsed.error.trim()) return parsed.error
  } catch {
    // ignore parse errors
  }
  if (raw.includes('<!doctype html') || raw.includes('<html')) return 'Server returned an unexpected response. Please try again.'
  return raw
}

function mixTotals100(mix: OnboardingData['contentMix']): boolean {
  if (!mix || typeof mix !== 'object') return false
  const total =
    (Number(mix.promotional) || 0) +
    (Number(mix.educational) || 0) +
    (Number(mix.testimonial) || 0) +
    (Number(mix.bts) || 0) +
    (Number(mix.festive) || 0)
  return total === 100
}

/** Ensures POST /api/onboarding/complete passes server validation (incl. skip path). */
function buildOnboardingCompletePayload(onboardingData: OnboardingData) {
  const styles = onboardingData.vibeStyles?.length
    ? onboardingData.vibeStyles
    : onboardingData.styles?.length
      ? onboardingData.styles
      : ['minimal']

  const audienceInterests =
    onboardingData.audienceLifestyle?.length
      ? onboardingData.audienceLifestyle
      : onboardingData.interests?.length
        ? onboardingData.interests
        : ['To be refined after onboarding']

  const activePlatforms =
    onboardingData.activePlatforms?.length
      ? onboardingData.activePlatforms
      : onboardingData.platforms?.length
        ? onboardingData.platforms
        : ['instagram']

  const goals = onboardingData.goals?.length ? onboardingData.goals : ['Increase Brand Awareness']

  const contentMix = mixTotals100(onboardingData.contentMix)
    ? onboardingData.contentMix
    : { promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 }

  const industryAnswers =
    onboardingData.industryAnswers && Object.keys(onboardingData.industryAnswers).length > 0
      ? onboardingData.industryAnswers
      : { skipped: true }

  const descriptionRaw = (onboardingData.description || '').trim()
  const description =
    descriptionRaw.length >= 10
      ? descriptionRaw
      : 'Brand positioning will be refined after onboarding. Premium, trustworthy, and growth-focused.'

  const audienceLocation = (onboardingData.audienceCity || onboardingData.location || '').trim() || 'To be confirmed'

  return {
    brandName: onboardingData.brandName,
    description,
    industry: onboardingData.industry,
    industryLabel: onboardingData.industryLabel,
    tone: onboardingData.tone,
    styles,
    audienceAgeMin: onboardingData.audienceAgeMin || onboardingData.ageRange?.[0] || 22,
    audienceAgeMax: onboardingData.audienceAgeMax || onboardingData.ageRange?.[1] || 45,
    audienceGender: onboardingData.audienceGender || 'mixed',
    audienceLocation,
    audienceInterests,
    activePlatforms,
    platforms: activePlatforms,
    goals,
    colorPrimary: onboardingData.colorPrimary,
    colorSecondary: onboardingData.colorSecondary,
    colorAccent: onboardingData.colorAccent,
    fontMood: onboardingData.fontMood,
    priceSegment: onboardingData.priceSegment,
    industrySubtype: onboardingData.industrySubtype,
    uspKeywords: onboardingData.uspKeywords,
    industryAnswers,
    weeklyPostCount: onboardingData.weeklyPostCount,
    contentMix,
    preferredPostingTimes: onboardingData.preferredPostingTimes?.length ? onboardingData.preferredPostingTimes : ['09:00', '18:00'],
    autoSchedule: onboardingData.autoSchedule,
    extractedStyleProfile: onboardingData.extractedStyleProfile,
    referenceImageUrls: (onboardingData.referenceImages || []).map((r) => r.url).slice(0, 5),
    tagline: onboardingData.tagline || '',
    website: onboardingData.website || '',
    phone: onboardingData.phone || '',
    address: onboardingData.address || onboardingData.city || '',
    logoUrl: onboardingData.logoUrl || '',
  }
}

function getNextMonth() {
  const d = new Date()
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

export function StepFirstPost() {
  const router = useRouter()
  const { data: onboardingData, reset } = useOnboardingStore()

  const { data: brandData } = useSWR('/api/brands/current', (u: string) => apiCall<any>(u), { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', (u: string) => apiCall<{ balance: number }>(u), { revalidateOnFocus: false })

  const brand = brandData?.brand ?? brandData
  const credits = creditsData?.balance ?? 0
  const plan = brand?.plan ?? 'free'
  const maxPosts = PLAN_LIMITS[plan] ?? 12

  const [month, setMonth] = useState(getNextMonth())
  const [postCount, setPostCount] = useState(Math.min((onboardingData.weeklyPostCount || 4) * 4, maxPosts))
  const [mix, setMix] = useState({
    promotional: onboardingData.contentMix?.promotional ?? 30,
    educational: onboardingData.contentMix?.educational ?? 25,
    testimonial: onboardingData.contentMix?.testimonial ?? 20,
    bts: onboardingData.contentMix?.bts ?? 15,
    festive: onboardingData.contentMix?.festive ?? 10,
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const creditsNeeded = postCount * 2
  const hasCredits = credits >= creditsNeeded
  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0)
  const canGenerate = hasCredits && mixTotal === 100 && !generating

  const adjustMix = (key: string, delta: number) => {
    setMix((m) => ({ ...m, [key]: Math.max(0, Math.min(100, (m[key as keyof typeof m] ?? 0) + delta)) }))
  }

  const completeOnboarding = async () => {
    const auth = getFirebaseAuth()
    await auth?.currentUser?.getIdToken(true)
    await apiCall('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(buildOnboardingCompletePayload(onboardingData)),
    })
  }

  const syncProducts = async () => {
    try {
      const products = onboardingData.products || []
      if (!Array.isArray(products) || products.length === 0) return
      await apiCall('/api/brand-products/sync-from-onboarding', {
        method: 'POST',
        body: JSON.stringify({ products }),
      })
    } catch {
      // Product sync is non-blocking. The brand brief itself must already be persisted.
    }
  }

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setError('')

    try {
      // Ensure onboarding data + products are persisted before generating plan
      await completeOnboarding()
      await syncProducts()

      const res = await apiCall<{ planId: string }>('/api/calendar/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ month, postCount, mixPreferences: mix }),
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      })
      logUxEvent('onboarding_generate_plan_success', { postCount, planId: res.planId })
      reset()
      router.push(`/calendar/review?planId=${res.planId}`)
    } catch (e: any) {
      const raw = e instanceof Error ? e.message : ''
      const msg =
        e?.name === 'AbortError' || raw.includes('timed out after')
          ? 'Generation timed out. The AI is busy — please try again.'
          : parseApiError(e)
      logUxEvent('onboarding_generate_plan_failed', { postCount, error: msg })
      setError(msg)
      setGenerating(false)
    }
  }

  const handleSkip = async () => {
    setError('')
    setGenerating(true)
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    try {
      let lastError: unknown = null
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          await completeOnboarding()
          lastError = null
          break
        } catch (err) {
          lastError = err
          if (attempt < 2) await sleep(500 * (attempt + 1))
        }
      }
      if (lastError) throw lastError

      await syncProducts()
      logUxEvent('onboarding_skip_completed', { hasProducts: Array.isArray(onboardingData.products) && onboardingData.products.length > 0 })
      reset()
      router.push('/dashboard')
    } catch (e: unknown) {
      const detail = parseApiError(e)
      const message =
        detail.startsWith('Complete required onboarding')
          ? detail
          : 'Could not save onboarding yet. Please check your connection and try again.'
      console.warn('Onboarding skip save failed', e)
      logUxEvent('onboarding_skip_failed', { error: message })
      setError(message)
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      {(generating || Boolean(error)) && (
        <GeneratingOverlay
          postCount={postCount}
          error={error}
          onRetry={() => {
            setError('')
            setGenerating(false)
            setTimeout(() => {
              void handleGenerate()
            }, 50)
          }}
          onSkip={handleSkip}
        />
      )}
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40">
            <Calendar size={15} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Content Calendar
          </span>
        </div>
        <StepHeader
          title="Plan your content"
          description="AI will create a full month of post ideas using your Brand DNA. Review and approve each one before anything is generated."
        />

        <div className="mt-6 space-y-5">
          <div className="space-y-5 rounded-2xl border border-border bg-muted/30 p-5">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground/40 focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">How many posts?</label>
                <span className="text-sm font-semibold tabular-nums text-foreground">{postCount}</span>
              </div>
              <input
                type="range"
                min={4}
                max={maxPosts}
                step={1}
                value={postCount}
                onChange={(e) => setPostCount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between">
                <span className="text-[10px] text-muted-foreground">4 min</span>
                <span className="text-[10px] text-muted-foreground">{maxPosts} max ({plan})</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Content mix</label>
                <span className={cn('font-mono text-[11px]', mixTotal === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')}>
                  {mixTotal}% {mixTotal === 100 ? '✓' : '(must = 100%)'}
                </span>
              </div>
              <div className="space-y-2.5">
                {MIX_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-xs text-foreground">{MIX_LABELS[key]}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground/60 transition-all" style={{ width: `${mix[key]}%` }} />
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button type="button" onClick={() => adjustMix(key, -5)} className="h-5 w-5 rounded bg-muted text-xs text-muted-foreground hover:bg-muted/70">−</button>
                      <span className="w-6 text-center font-mono text-xs text-foreground">{mix[key]}</span>
                      <button type="button" onClick={() => adjustMix(key, 5)} className="h-5 w-5 rounded bg-muted text-xs text-muted-foreground hover:bg-muted/70">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            hasCredits ? 'border-border bg-muted/30 text-muted-foreground' : 'border-destructive/30 bg-destructive/10 text-destructive',
          )}>
            {hasCredits
              ? `Will use ${creditsNeeded} credits — ${credits - creditsNeeded} remaining after`
              : `Not enough credits. Need ${creditsNeeded}, have ${credits}.`}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="space-y-3 pt-2">
            <AIButton
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="h-11 w-full justify-center text-sm font-semibold"
            >
              {generating
                ? <><Loader2 size={15} className="animate-spin" /> Building your content plan...</>
                : <><Sparkles size={15} /> Generate Content Plan</>
              }
            </AIButton>
            <p className="text-center text-[11px] text-muted-foreground">Credits charged only after you approve &amp; confirm</p>
            <button type="button" onClick={handleSkip} className="block w-full py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
              Skip for now — go to dashboard →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
