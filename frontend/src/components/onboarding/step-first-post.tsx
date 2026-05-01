'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { AIButton } from '@/components/ui/ai-button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-white/70 animate-pulse" />
          </div>
          <h3 className="text-white font-bold text-xl tracking-tight">Building your plan{dots}</h3>
          <p className="text-white/35 text-sm">Creating {postCount} AI-powered posts for your brand</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-white/60 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-[11px] text-white/25 font-mono tabular-nums">{progress}%</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {GENERATION_STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i)
            const isActive = activeStep === i && !isDone
            return (
              <div key={i} className={cn(
                'flex items-center gap-3 transition-all duration-300',
                isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-25'
              )}>
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {isDone
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : isActive
                    ? <Loader2 size={16} className="text-white/60 animate-spin" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  }
                </div>
                <span className={cn(
                  'text-sm',
                  isDone ? 'text-white/50 line-through' : isActive ? 'text-white/90' : 'text-white/30'
                )}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-center text-[11px] text-white/20">
          This usually takes 10–15 seconds
        </p>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-4 py-3 space-y-3">
            <p className="text-rose-400 text-sm">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={onRetry}
                className="flex-1 py-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
              >
                Try again
              </button>
              <button
                onClick={onSkip}
                className="flex-1 py-2 rounded-lg text-white/30 hover:text-white/60 text-sm transition-all"
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
    await apiCall('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify({
        brandName: onboardingData.brandName,
        description: onboardingData.description,
        industry: onboardingData.industry,
        industryLabel: onboardingData.industryLabel,
        tone: onboardingData.tone,
        styles: onboardingData.vibeStyles?.length ? onboardingData.vibeStyles : (onboardingData.styles || []),
        audienceAgeMin: onboardingData.audienceAgeMin || onboardingData.ageRange?.[0] || 22,
        audienceAgeMax: onboardingData.audienceAgeMax || onboardingData.ageRange?.[1] || 45,
        audienceGender: onboardingData.audienceGender || 'mixed',
        audienceLocation: onboardingData.audienceCity || onboardingData.location || '',
        audienceInterests: onboardingData.audienceLifestyle?.length ? onboardingData.audienceLifestyle : (onboardingData.interests || []),
        activePlatforms: onboardingData.activePlatforms?.length ? onboardingData.activePlatforms : (onboardingData.platforms || []),
        platforms: onboardingData.activePlatforms?.length ? onboardingData.activePlatforms : (onboardingData.platforms || []),
        goals: onboardingData.goals || [],
        colorPrimary: onboardingData.colorPrimary,
        colorSecondary: onboardingData.colorSecondary,
        colorAccent: onboardingData.colorAccent,
        fontMood: onboardingData.fontMood,
        priceSegment: onboardingData.priceSegment,
        industrySubtype: onboardingData.industrySubtype,
        uspKeywords: onboardingData.uspKeywords,
        industryAnswers: onboardingData.industryAnswers,
        weeklyPostCount: onboardingData.weeklyPostCount,
        contentMix: onboardingData.contentMix,
        preferredPostingTimes: onboardingData.preferredPostingTimes || [],
        autoSchedule: onboardingData.autoSchedule,
        extractedStyleProfile: onboardingData.extractedStyleProfile,
        referenceImageUrls: (onboardingData.referenceImages || []).map((r) => r.url).slice(0, 5),
        // Brand identity fields
        tagline: onboardingData.tagline || '',
        website: onboardingData.website || '',
        phone: onboardingData.phone || '',
        address: onboardingData.address || onboardingData.city || '',
        logoUrl: onboardingData.logoUrl || '',
      }),
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

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000) // 60s timeout
    try {
      // Ensure onboarding data + products are persisted before generating plan
      await completeOnboarding()
      await syncProducts()

      const res = await apiCall<{ planId: string }>('/api/calendar/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ month, postCount, mixPreferences: mix }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      reset()
      router.push(`/calendar/review?planId=${res.planId}`)
    } catch (e: any) {
      clearTimeout(timeout)
      const msg = e?.name === 'AbortError'
        ? 'Generation timed out. The AI is busy — please try again.'
        : (e?.message ?? 'Failed to generate plan. Please try again.')
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
      reset()
      router.push('/dashboard')
    } catch (e: any) {
      const message = 'Could not save onboarding yet. Please check your connection and try again.'
      console.warn('Onboarding skip save failed', e)
      setError(message)
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      {generating && (
        <GeneratingOverlay
          postCount={postCount}
          error={error}
          onRetry={() => { setError(''); setGenerating(false); setTimeout(handleGenerate, 50) }}
          onSkip={handleSkip}
        />
      )}
      <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <Calendar size={15} className="text-white/60" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Content Calendar
          </span>
        </div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Plan your content</h2>
        <p className="text-white/40 text-sm mt-2 leading-relaxed">
          AI will create a full month of post ideas using your Brand DNA.
          Review and approve each one before anything is generated.
        </p>
      </div>

      {/* Config card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-6">

        {/* Month */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 block mb-2">Month</label>
          <input
            type="month" value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        {/* Post count */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">How many posts?</label>
            <span className="text-white font-semibold text-sm tabular-nums">{postCount}</span>
          </div>
          <input
            type="range" min={4} max={maxPosts} step={1} value={postCount}
            onChange={(e) => setPostCount(Number(e.target.value))}
            className="w-full accent-white/70"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/25">4 min</span>
            <span className="text-[10px] text-white/25">{maxPosts} max ({plan})</span>
          </div>
        </div>

        {/* Content mix */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">Content mix</label>
            <span className={cn('text-[11px] font-mono', mixTotal === 100 ? 'text-emerald-400' : 'text-rose-400')}>
              {mixTotal}% {mixTotal === 100 ? '✓' : '(must = 100%)'}
            </span>
          </div>
          <div className="space-y-3">
            {MIX_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-white/55 text-xs w-36 flex-shrink-0">{MIX_LABELS[key]}</span>
                <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-white/40 transition-all" style={{ width: `${mix[key]}%` }} />
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => adjustMix(key, -5)} className="w-5 h-5 rounded bg-white/[0.06] text-white/50 hover:bg-white/10 text-xs transition-all">−</button>
                  <span className="text-white text-xs font-mono w-6 text-center">{mix[key]}</span>
                  <button onClick={() => adjustMix(key, 5)} className="w-5 h-5 rounded bg-white/[0.06] text-white/50 hover:bg-white/10 text-xs transition-all">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className={cn(
        'px-4 py-3 rounded-xl border text-sm',
        hasCredits ? 'bg-white/[0.02] border-white/[0.06] text-white/50' : 'bg-rose-500/[0.06] border-rose-500/25 text-rose-400'
      )}>
        {hasCredits
          ? `Will use ${creditsNeeded} credits — ${credits - creditsNeeded} remaining after`
          : `Not enough credits. Need ${creditsNeeded}, have ${credits}.`}
      </div>

      {error && <p className="text-rose-400 text-xs">{error}</p>}

      {/* CTA */}
      <div className="space-y-3">
        <AIButton
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full justify-center py-3 text-sm font-semibold"
        >
          {generating
            ? <><Loader2 size={15} className="animate-spin" /> Building your content plan...</>
            : <><Sparkles size={15} /> Generate Content Plan</>
          }
        </AIButton>
        <p className="text-center text-[11px] text-white/20">Credits charged only after you approve &amp; confirm</p>
        <button onClick={handleSkip} className="w-full text-center text-white/25 hover:text-white/50 text-sm transition-colors py-2">
          Skip for now — go to dashboard →
        </button>
      </div>
    </div>
    </>
  )
}
