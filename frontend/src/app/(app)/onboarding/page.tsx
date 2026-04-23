'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'

// Step 1: reuse existing welcome
import { StepWelcome } from '@/components/onboarding/step-welcome'
// Step 2: new industry grid
import { StepIndustry } from '@/components/onboarding/step-industry'
// Step 3: personality (replaces old brand-voice)
import { StepPersonality } from '@/components/onboarding/step-personality'
// Step 4: visual identity (new)
import { StepVisualIdentity } from '@/components/onboarding/step-visual-identity'
// Step 5: audience (existing)
import { StepAudience } from '@/components/onboarding/step-audience'
// Step 6: industry-specific adaptive questions (new)
import { StepIndustryConfig } from '@/components/onboarding/step-industry-config'
// Step 7: reference image upload + vision AI (new)
import { StepReferences } from '@/components/onboarding/step-references'
// Step 7.5: product library (new)
import { StepProductLibrary } from '@/components/onboarding/step-product-library'
// Step 8: calendar prefs (new)
import { StepCalendarPrefs } from '@/components/onboarding/step-calendar-prefs'
// Step 9: first post (existing — completion step)
import { StepFirstPost } from '@/components/onboarding/step-first-post'

const STEP_NAMES = [
  'Welcome',
  'Industry',
  'Personality',
  'Visual Style',
  'Audience',
  'Your Brand',
  'References',
  'Products',
  'Content Plan',
  'First Post',
]

const STEPS = [
  StepWelcome,
  StepIndustry,
  StepPersonality,
  StepVisualIdentity,
  StepAudience,
  StepIndustryConfig,
  StepReferences,
  StepProductLibrary,
  StepCalendarPrefs,
  StepFirstPost,
]

const variants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
}

export default function OnboardingPage() {
  const { step, setStep } = useOnboardingStore()
  const router = useRouter()
  const StepComponent = STEPS[step - 1] || StepWelcome
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

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
      <div className="min-h-screen bg-[#080809] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[var(--ai-color)]" />
      </div>
    )
  }

  const showProgressBar = step > 1

  return (
    <div className="min-h-screen bg-[#080809] flex flex-col">
      {/* Violet progress bar */}
      {showProgressBar && (
        <div className="h-[2px] bg-white/[0.05] w-full fixed top-0 left-0 z-50">
          <motion.div
            className="h-full bg-[var(--ai-color)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Step indicator + skip */}
      {showProgressBar && (
        <div className="pt-6 pb-4 flex items-center justify-between px-6 max-w-[640px] mx-auto w-full">
          <span className="text-[12px] text-white/40 font-medium tracking-wide">
            Step {step} of {STEPS.length} —{' '}
            <span className="text-white/60">{STEP_NAMES[step - 1]}</span>
          </span>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-[640px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
