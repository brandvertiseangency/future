'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingSection } from '@/lib/onboarding-flow'
import { MOTION_TRANSITIONS } from '@/lib/motion'

export function MotionSection({
  children,
  motionKey,
}: {
  children: React.ReactNode
  motionKey: number | string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={motionKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={MOTION_TRANSITIONS.section}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function ProgressScore({ value }: { value: number }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B7280]">Profile quality</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="font-semibold text-2xl text-[#111111] tabular-nums">{Math.round(value)}%</p>
        <p className="text-xs text-[#6B7280]">{value >= 75 ? 'Ready to generate' : 'Needs more context'}</p>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-[#EFEFF1]">
        <motion.div
          className="h-full rounded-full bg-[#111111]"
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={MOTION_TRANSITIONS.micro}
        />
      </div>
    </div>
  )
}

export function SectionRail({
  sections,
  activeStep,
  completedSteps,
  onGoStep,
}: {
  sections: OnboardingSection[]
  activeStep: number
  completedSteps: Set<number>
  onGoStep: (step: number) => void
}) {
  return (
    <nav className="space-y-1">
      {sections.map((section, idx) => {
        const step = idx + 1
        const active = activeStep === step
        const done = completedSteps.has(step)
        return (
          <button
            key={section.id}
            onClick={() => onGoStep(step)}
            className={cn(
              'w-full rounded-xl border px-3 py-2 text-left transition-all',
              active
                ? 'border-[#111111] bg-[#111111] text-white'
                : done
                ? 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF]'
                : 'border-transparent bg-transparent hover:border-[#E5E7EB] hover:bg-white'
            )}
          >
            <div className="flex items-start gap-2.5">
              {done ? (
                <CheckCircle2 size={14} className={active ? 'text-white' : 'text-[#111111] mt-0.5'} />
              ) : (
                <Circle size={14} className={active ? 'text-white mt-0.5' : 'text-[#9CA3AF] mt-0.5'} />
              )}
              <div>
                <p className={cn('text-sm font-medium', active ? 'text-white' : 'text-[#111111]')}>{section.title}</p>
                <p className={cn('text-[11px]', active ? 'text-white/75' : 'text-[#6B7280]')}>{section.subtitle}</p>
              </div>
            </div>
          </button>
        )
      })}
    </nav>
  )
}

export function StickyPreviewPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <aside className="sticky top-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B7280]">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </aside>
  )
}
