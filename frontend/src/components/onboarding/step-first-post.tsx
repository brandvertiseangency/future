'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Sparkles, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { AIButton } from '@/components/ui/ai-button'
import { cn } from '@/lib/utils'

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
    try {
      await apiCall('/api/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({
          brandName: onboardingData.brandName,
          description: onboardingData.description,
          industry: onboardingData.industry,
          industryLabel: onboardingData.industryLabel,
          tone: onboardingData.tone,
          styles: onboardingData.vibeStyles?.length ? onboardingData.vibeStyles : (onboardingData.styles || []),
          audienceAgeMin: onboardingData.audienceAgeMin || 22,
          audienceAgeMax: onboardingData.audienceAgeMax || 45,
          audienceGender: onboardingData.audienceGender || 'mixed',
          audienceLocation: onboardingData.audienceCity || '',
          audienceInterests: onboardingData.audienceLifestyle?.length ? onboardingData.audienceLifestyle : (onboardingData.interests || []),
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
          autoSchedule: onboardingData.autoSchedule,
          extractedStyleProfile: onboardingData.extractedStyleProfile,
          referenceImageUrls: (onboardingData.referenceImages || []).map((r) => r.url).slice(0, 5),
        }),
      })
    } catch { /* non-blocking */ }
  }

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setError('')
    // Complete onboarding in parallel (non-blocking)
    completeOnboarding()
    try {
      const res = await apiCall<{ planId: string }>('/api/calendar/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ month, postCount, mixPreferences: mix }),
      })
      reset()
      router.push(`/calendar/review?planId=${res.planId}`)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate plan. Please try again.')
      setGenerating(false)
    }
  }

  const handleSkip = async () => {
    await completeOnboarding()
    reset()
    router.push('/dashboard')
  }

  return (
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
  )
}
