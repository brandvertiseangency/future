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
  const { step, setStep, data: onboardingData } = useOnboardingStore()
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
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#111111]" />
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

  return (
    <div className="min-h-screen bg-[#F7F7F8] py-6">
      <PageContainer className="max-w-[1400px]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
              Brand <span className="text-highlight">Onboarding</span>
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Fullscreen setup flow that powers strategy, generation quality, and publishing relevance.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
            Exit
          </Button>
        </div>
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
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 min-h-[72vh]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B7280]">Step {step} of {STEPS.length}</p>
                  <h2 className="text-xl font-semibold text-[#111111]">{activeSection.title}</h2>
                </div>
                <p className="text-xs text-[#6B7280]">{Math.round(progress)}% complete</p>
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
              <div className="rounded-xl bg-[#F7F7F8] border border-[#E5E7EB] p-3">
                <p className="text-xs text-[#6B7280]">Brand</p>
                <p className="text-sm font-medium text-[#111111]">{onboardingData.brandName || 'Unnamed brand'}</p>
                <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{onboardingData.description || 'Add positioning to improve relevance.'}</p>
              </div>
              <div className="rounded-xl bg-[#F7F7F8] border border-[#E5E7EB] p-3">
                <p className="text-xs text-[#6B7280]">Audience snapshot</p>
                <p className="text-sm text-[#111111]">
                  {onboardingData.audienceAgeMin}-{onboardingData.audienceAgeMax}, {onboardingData.audienceGender.replace('_', ' ')}
                </p>
                <p className="text-xs text-[#6B7280]">{onboardingData.audienceCity || 'No location yet'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B7280] mb-2">Missing critical</p>
                {missingCritical.length ? (
                  <div className="space-y-1.5">
                    {missingCritical.map((item) => (
                      <p key={item} className="text-xs text-[#111111]">- {item}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700">All critical sections complete.</p>
                )}
              </div>
            </StickyPreviewPanel>
          </div>
        </div>
      </PageContainer>
      <style jsx global>{`
        .onboarding-step-light .text-white,
        .onboarding-step-light [class*="text-white/"] {
          color: #111111 !important;
        }
        .onboarding-step-light [class*="text-white/2"],
        .onboarding-step-light [class*="text-white/3"],
        .onboarding-step-light [class*="text-white/4"],
        .onboarding-step-light [class*="text-white/5"],
        .onboarding-step-light [class*="text-white/6"] {
          color: #6b7280 !important;
        }
        .onboarding-step-light [class*="border-white/"],
        .onboarding-step-light [class*="border-[var(--ai-border)]"] {
          border-color: #e5e7eb !important;
        }
        .onboarding-step-light [class*="bg-white/"] {
          background-color: #f7f7f8 !important;
        }
        .onboarding-step-light [class*="text-[var(--ai-color)]"] {
          color: #111111 !important;
        }
        .onboarding-step-light [class*="bg-[var(--ai-color)]"] {
          background-color: #111111 !important;
          color: #ffffff !important;
        }
        .onboarding-step-light input,
        .onboarding-step-light textarea,
        .onboarding-step-light select {
          color: #111111;
        }
      `}</style>
    </div>
  )
}
