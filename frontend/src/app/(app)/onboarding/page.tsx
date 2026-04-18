'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { StepBrandIdentity } from '@/components/onboarding/step-brand-identity'
import { StepAudience } from '@/components/onboarding/step-audience'
import { StepGoals } from '@/components/onboarding/step-goals'
import { StepDesignPrefs } from '@/components/onboarding/step-design-prefs'
import { StepUploads } from '@/components/onboarding/step-uploads'
import { StepReview } from '@/components/onboarding/step-review'

const variants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
}

const STEPS = [
  StepBrandIdentity,
  StepAudience,
  StepGoals,
  StepDesignPrefs,
  StepUploads,
  StepReview,
]

export default function OnboardingPage() {
  const { step, setStep } = useOnboardingStore()
  const StepComponent = STEPS[step - 1]

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="py-6 flex justify-center border-b border-white/[0.06]">
        <StepIndicator currentStep={step} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[600px]">
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

      {/* Footer nav */}
      <div className="border-t border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <motion.button
          whileHover={{ opacity: 0.7 }}
          transition={{ duration: 0.15 }}
          onClick={() => setStep(Math.max(1, step - 1))}
          className={`flex items-center gap-2 text-white/50 text-sm font-medium transition-opacity ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <IconArrowLeft size={16} />
          Back
        </motion.button>

        {step < 6 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep(Math.min(6, step + 1))}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Continue
            <IconArrowRight size={16} />
          </motion.button>
        )}
      </div>
    </div>
  )
}
