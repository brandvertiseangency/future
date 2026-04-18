'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const STEP_NAMES = [
  'Brand Identity',
  'Target Audience',
  'Goals & KPIs',
  'Design Prefs',
  'Brand Assets',
  'Review',
]

interface StepIndicatorProps {
  currentStep: number
  totalSteps?: number
}

export function StepIndicator({ currentStep, totalSteps = 6 }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1
          const isActive = step === currentStep
          const isComplete = step < currentStep
          return (
            <motion.div
              key={step}
              animate={{ scale: isActive ? 1.4 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'rounded-full transition-colors duration-300',
                isActive
                  ? 'w-2 h-2 bg-violet-500'
                  : isComplete
                  ? 'w-2 h-2 bg-white/40'
                  : 'w-2 h-2 bg-white/10'
              )}
            />
          )
        })}
      </div>
      <p className="text-white/60 text-[13px] font-medium">
        Step {currentStep} of {totalSteps} — {STEP_NAMES[currentStep - 1]}
      </p>
    </div>
  )
}
