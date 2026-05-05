'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { ONBOARDING_SECTIONS, getOnboardingProgress } from '@/lib/onboarding-flow'
import { getSectionValidity } from '@/lib/onboarding-schemas'
import { MotionSection, ProgressScore, SectionRail, StickyPreviewPanel } from '@/components/onboarding/primitives/onboarding-shell'
import { logUxEvent } from '@/lib/ux-events'

// Step 1: reuse existing welcome
import { StepWelcome } from '@/components/onboarding/step-welcome'
// Step 2: brand identity and brief
import { StepBrandIdentity } from '@/components/onboarding/step-brand-identity'
// Step 3: industry grid
import { StepIndustry } from '@/components/onboarding/step-industry'
// Step 4: personality
import { StepPersonality } from '@/components/onboarding/step-personality'
// Step 5: visual identity
import { StepVisualIdentity } from '@/components/onboarding/step-visual-identity'
// Step 6: audience
import { StepAudience } from '@/components/onboarding/step-audience'
// Step 7: goals
import { StepGoals } from '@/components/onboarding/step-goals'
// Step 8: industry-specific adaptive questions
import { StepIndustryConfig } from '@/components/onboarding/step-industry-config'
// Step 9: reference image upload + vision AI
import { StepReferences } from '@/components/onboarding/step-references'
// Step 10: product library
import { StepProductLibrary } from '@/components/onboarding/step-product-library'
// Step 11: calendar prefs
import { StepCalendarPrefs } from '@/components/onboarding/step-calendar-prefs'
// Step 12: first post
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
  if (step > 1) completedSteps.add(1) // Welcome becomes complete once user proceeds.
  if (step > 2 && validity.brand) completedSteps.add(2)
  if (step > 3 && validity.industry) completedSteps.add(3)
  if (step > 4 && validity.personality) completedSteps.add(4)
  if (step > 5 && validity.visual) completedSteps.add(5)
  if (step > 6 && validity.audience) completedSteps.add(6)
  if (step > 7 && validity.goals) completedSteps.add(7)
  if (step > 8 && validity.industryConfig) completedSteps.add(8)
  if (step > 9) completedSteps.add(9) // Optional step
  if (step > 10) completedSteps.add(10) // Optional step
  if (step > 11 && validity.calendar) completedSteps.add(11)
  const profileScore = Math.round((completedSteps.size / 8) * 100)

  const { data, isLoading } = useSWR(
    '/api/users/me',
    (url: string) => apiCall<{ user: { onboarding_complete?: boolean } }>(url),
    { revalidateOnFocus: false }
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
    [step, setStep]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
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
      description: onboardingData.description || 'Premium brand focused on consistent growth and clear positioning.',
      goals: onboardingData.goals.length ? onboardingData.goals : ['Increase Brand Awareness'],
      audienceCity: onboardingData.audienceCity || 'Mumbai',
      activePlatforms: onboardingData.activePlatforms.length ? onboardingData.activePlatforms : ['instagram'],
      preferredPostingTimes: onboardingData.preferredPostingTimes.length ? onboardingData.preferredPostingTimes : ['10:00'],
    })
    if (step < 11) setStep(11)
    logUxEvent('onboarding_fast_path_applied', { fromStep: step })
  }

  return (
    <div className="min-h-screen bg-background py-6 text-foreground">
      <PageContainer className="max-w-[1400px]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Workspace setup</p>
            <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-foreground md:text-[2.25rem] md:leading-[1.15]">
              Brand <span className="text-pull text-primary">onboarding</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Fullscreen setup flow that powers strategy, generation quality, and publishing relevance.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
            Exit
          </Button>
        </div>
        <div className="mb-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Autosave on.</span> Your step and answers are saved in this browser — you can leave and resume anytime on this device.
        </div>
        {missingCritical.length > 0 ? (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-700">
              Fast path available: apply recommended defaults for missing fields and jump to publishing plan.
            </p>
            <Button size="sm" variant="secondary" onClick={applyFastPathDefaults}>
              Use Fast Path
            </Button>
          </div>
        ) : null}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              <ProgressScore value={profileScore || progress} />
              <SectionRail
                sections={ONBOARDING_SECTIONS}
                activeStep={step}
                completedSteps={completedSteps}
                onGoStep={(nextStep) => {
                  if (nextStep <= step || completedSteps.has(nextStep - 1)) {
                    setStep(nextStep)
                  }
                }}
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <div className="app-card-elevated min-h-[72vh] rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Step {step} of {STEPS.length}</p>
                  <h2 className="text-xl font-semibold text-foreground">{activeSection.title}</h2>
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
              <div className="onboarding-step-light">
                <MotionSection motionKey={step}>
                  <StepComponent />
                </MotionSection>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3">
            <StickyPreviewPanel title="Brand Intelligence">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Brand</p>
                <p className="text-sm font-medium text-foreground">{onboardingData.brandName || 'Unnamed brand'}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{onboardingData.description || 'Add positioning to improve relevance.'}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Audience snapshot</p>
                <p className="text-sm text-foreground">
                  {onboardingData.audienceAgeMin}-{onboardingData.audienceAgeMax}, {onboardingData.audienceGender.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground">{onboardingData.audienceCity || 'No location yet'}</p>
              </div>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Missing critical</p>
                {missingCritical.length ? (
                  <div className="space-y-1.5">
                    {missingCritical.map((item) => (
                      <p key={item} className="text-xs text-foreground">- {item}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">All critical sections complete.</p>
                )}
              </div>
            </StickyPreviewPanel>
          </div>
        </div>
      </PageContainer>
      <style jsx global>{`
        .onboarding-step-light .text-white,
        .onboarding-step-light [class*="text-white/"] {
          color: #191919 !important;
        }
        .onboarding-step-light [class*="text-white/2"],
        .onboarding-step-light [class*="text-white/3"],
        .onboarding-step-light [class*="text-white/4"],
        .onboarding-step-light [class*="text-white/5"],
        .onboarding-step-light [class*="text-white/6"] {
          color: #5c5c66 !important;
        }
        .onboarding-step-light [class*="border-white/"],
        .onboarding-step-light [class*="border-[var(--ai-border)]"] {
          border-color: #e0e0e6 !important;
        }
        .onboarding-step-light [class*="bg-white/"] {
          background-color: #f9f9f9 !important;
        }
        .onboarding-step-light [class*="text-[var(--ai-color)]"] {
          color: #191919 !important;
        }
        .onboarding-step-light [class*="bg-[var(--ai-color)]"] {
          background-color: #003bff !important;
          color: #ffffff !important;
        }
        .onboarding-step-light input,
        .onboarding-step-light textarea,
        .onboarding-step-light select {
          color: #191919;
        }
      `}</style>
    </div>
  )
}
