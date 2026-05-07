'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ONBOARDING_SECTIONS, getOnboardingProgress } from '@/lib/onboarding-flow'
import { getSectionValidity } from '@/lib/onboarding-schemas'
import { MotionSection } from '@/components/onboarding/primitives/onboarding-shell'
import { logUxEvent } from '@/lib/ux-events'
import { cn } from '@/lib/utils'
import Grainient from '@/components/effects/grainient'

import { StepWelcome } from '@/components/onboarding/step-welcome'
import { StepBrandIdentity } from '@/components/onboarding/step-brand-identity'
import { StepIndustry } from '@/components/onboarding/step-industry'
import { StepPersonality } from '@/components/onboarding/step-personality'
import { StepVisualIdentity } from '@/components/onboarding/step-visual-identity'
import { StepAudience } from '@/components/onboarding/step-audience'
import { StepGoals } from '@/components/onboarding/step-goals'
import { StepIndustryConfig } from '@/components/onboarding/step-industry-config'
import { StepReferences } from '@/components/onboarding/step-references'
import { StepProductLibrary } from '@/components/onboarding/step-product-library'
import { StepCalendarPrefs } from '@/components/onboarding/step-calendar-prefs'
import { StepFirstPost } from '@/components/onboarding/step-first-post'

const STEPS = [
  StepWelcome,
  StepBrandIdentity,
  StepIndustry,
  StepPersonality,
  StepVisualIdentity,
  StepAudience,
  StepGoals,
  StepIndustryConfig,
  StepReferences,
  StepProductLibrary,
  StepCalendarPrefs,
  StepFirstPost,
]

export default function OnboardingPage() {
  const { step, setStep, data: onboardingData, updateData } = useOnboardingStore()
  const router = useRouter()
  const StepComponent = STEPS[step - 1] || StepWelcome
  const progress = getOnboardingProgress(step)
  const validity = getSectionValidity(onboardingData)
  const completedSteps = new Set<number>()
  if (step > 1) completedSteps.add(1)
  if (step > 2 && validity.brand) completedSteps.add(2)
  if (step > 3 && validity.industry) completedSteps.add(3)
  if (step > 4 && validity.personality) completedSteps.add(4)
  if (step > 5 && validity.visual) completedSteps.add(5)
  if (step > 6 && validity.audience) completedSteps.add(6)
  if (step > 7 && validity.goals) completedSteps.add(7)
  if (step > 8 && validity.industryConfig) completedSteps.add(8)
  if (step > 9) completedSteps.add(9)
  if (step > 10) completedSteps.add(10)
  if (step > 11 && validity.calendar) completedSteps.add(11)
  const profileScore = Math.round((completedSteps.size / 8) * 100)

  const { data, isLoading } = useSWR(
    '/api/users/me',
    (url: string) => apiCall<{ user: { onboarding_complete?: boolean } }>(url),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!isLoading && data?.user?.onboarding_complete) {
      router.replace('/dashboard')
    }
  }, [data, isLoading, router])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step > 1) setStep(step - 1)
    },
    [step, setStep],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0">
          <Grainient
            className="h-full w-full"
            color1="#003bff"
            color2="#2578f5"
            color3="#001faa"
            timeSpeed={0.85}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={3.2}
            warpAmplitude={28}
            blendAngle={22}
            blendSoftness={0.05}
            rotationAmount={360}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated
            contrast={1.5}
            gamma={1.35}
            saturation={1}
            centerX={0}
            centerY={-0.47}
            zoom={0.85}
          />
        </div>
        <Loader2 size={28} className="relative z-10 animate-spin text-white/80" />
      </div>
    )
  }

  const activeSection = ONBOARDING_SECTIONS[step - 1] ?? ONBOARDING_SECTIONS[0]
  const missingCritical = [
    !validity.brand ? 'Brand brief' : '',
    !validity.industry ? 'Industry' : '',
    !validity.audience ? 'Audience' : '',
    !validity.goals ? 'Goals' : '',
    !validity.calendar ? 'Publishing plan' : '',
  ].filter(Boolean)

  const applyFastPathDefaults = () => {
    updateData({
      brandName: onboardingData.brandName || 'My Brand',
      description:
        onboardingData.description || 'Premium brand focused on consistent growth and clear positioning.',
      goals: onboardingData.goals.length ? onboardingData.goals : ['Increase Brand Awareness'],
      audienceCity: onboardingData.audienceCity || 'Mumbai',
      activePlatforms: onboardingData.activePlatforms.length ? onboardingData.activePlatforms : ['instagram'],
      preferredPostingTimes: onboardingData.preferredPostingTimes.length
        ? onboardingData.preferredPostingTimes
        : ['10:00'],
    })
    if (step < 11) setStep(11)
    logUxEvent('onboarding_fast_path_applied', { fromStep: step })
  }

  const isWelcome = step === 1
  const progressPct = Math.max(0, Math.min(100, profileScore || progress))

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grainient
          className="h-full w-full"
          color1="#003bff"
          color2="#2578f5"
          color3="#001faa"
          timeSpeed={0.85}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={3.2}
          warpAmplitude={28}
          blendAngle={22}
          blendSoftness={0.05}
          rotationAmount={360}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated
          contrast={1.5}
          gamma={1.35}
          saturation={1}
          centerX={0}
          centerY={-0.47}
          zoom={0.85}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 md:py-7">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
            Step {step} of {STEPS.length}
            <span className="hidden text-white/55 sm:inline">·</span>
            <span className="hidden font-medium normal-case tracking-normal text-white/80 sm:inline">
              {activeSection.title}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 shrink-0 border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            onClick={() => router.push('/dashboard')}
          >
            Exit
          </Button>
        </header>

        <div className="mb-5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white/90 transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
            <span>{progressPct >= 75 ? 'Ready to generate' : 'Profile quality'}</span>
            <span className="tabular-nums text-white/85">{Math.round(progressPct)}%</span>
          </div>
        </div>

        {missingCritical.length > 0 && !isWelcome ? (
          <div className="mb-5 flex flex-col gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs text-white/85 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <p>Fast path — fill the essentials and jump to your publishing plan.</p>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 shrink-0 border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white"
              onClick={applyFastPathDefaults}
            >
              Use fast path
            </Button>
          </div>
        ) : null}

        <div className="flex flex-1 items-stretch">
          {isWelcome ? (
            <MotionSection motionKey={step}>
              <StepComponent />
            </MotionSection>
          ) : (
            <div className="app-card-elevated mx-auto flex w-full max-w-3xl flex-1 flex-col rounded-3xl border border-white/30 bg-card/95 p-6 shadow-[0_24px_80px_rgba(7,21,74,0.35)] backdrop-blur-md md:p-8">
              <MotionSection motionKey={step}>
                <StepComponent />
              </MotionSection>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5" aria-label="Step pagination">
          {STEPS.map((_, idx) => {
            const n = idx + 1
            const active = n === step
            const done = completedSteps.has(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => setStep(n)}
                aria-label={`Go to step ${n}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  active ? 'w-6 bg-white' : done ? 'w-1.5 bg-white/70' : 'w-1.5 bg-white/30 hover:bg-white/55',
                )}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
