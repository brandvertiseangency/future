'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOTION_TRANSITIONS } from '@/lib/motion'
import { AIButton } from '@/components/ui/ai-button'

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
        className="flex h-full flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function StepHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-[26px]">
        {title}
      </h2>
      {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function StepFooter({
  onBack,
  onSkip,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled,
  showAi = true,
  className,
}: {
  onBack?: () => void
  onSkip?: () => void
  onContinue?: () => void
  continueLabel?: string
  continueDisabled?: boolean
  showAi?: boolean
  className?: string
}) {
  return (
    <div className={cn('mt-6 flex items-center justify-between gap-3 border-t border-border/70 pt-4', className)}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <span aria-hidden>←</span> Back
        </button>
      ) : <span />}

      <div className="flex items-center gap-2">
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Skip
          </button>
        ) : null}
        {onContinue ? (
          showAi ? (
            <AIButton onClick={onContinue} disabled={continueDisabled} className="h-10 rounded-lg px-5 text-sm font-semibold">
              {continueLabel}
              <ArrowRight size={14} className="ml-1.5" />
            </AIButton>
          ) : (
            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled}
              className="inline-flex h-10 items-center rounded-lg bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {continueLabel}
              <ArrowRight size={14} className="ml-1.5" />
            </button>
          )
        ) : null}
      </div>
    </div>
  )
}
