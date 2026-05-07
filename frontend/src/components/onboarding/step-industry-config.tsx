'use client'

import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { INDUSTRY_QUESTIONS, type IndustryQuestion } from '@/lib/industry-questions'
import { cn } from '@/lib/utils'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

function QuestionField({ q, value, onChange }: {
  q: IndustryQuestion
  value: string | string[] | boolean | number | undefined
  onChange: (v: string | string[] | boolean | number) => void
}) {
  const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground/40 focus:outline-none'

  if (q.type === 'select') {
    return (
      <select
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, 'h-10 cursor-pointer')}
      >
        <option value="">Select an option...</option>
        {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  if (q.type === 'multi_select' || q.type === 'chips') {
    const current = (value as string[]) || []
    const toggle = (opt: string) => {
      if (current.includes(opt)) onChange(current.filter((x) => x !== opt))
      else onChange([...current, opt])
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {q.options?.map((opt) => {
          const sel = current.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors',
                sel
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-border/70',
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  if (q.type === 'toggle') {
    const checked = (value as boolean) || false
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted-foreground/30',
        )}
        aria-pressed={checked}
      >
        <span className={cn(
          'absolute top-1 h-4 w-4 rounded-full bg-background shadow transition-all',
          checked ? 'left-6' : 'left-1',
        )} />
      </button>
    )
  }

  return (
    <input
      type="text"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.placeholder}
      className={inputClass}
    />
  )
}

export function StepIndustryConfig() {
  const { data, setIndustryAnswer, updateData, setStep } = useOnboardingStore()
  const industry = data.industry as string
  const questions = INDUSTRY_QUESTIONS[industry] || INDUSTRY_QUESTIONS['other']
  const missingRequired = questions
    .filter((q) => q.required)
    .filter((q) => {
      const value = data.industryAnswers?.[q.key]
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'string') return !value.trim()
      return value === undefined || value === null
    })
    .map((q) => q.label)

  const [uspInput, setUspInput] = useState('')

  const addUsp = () => {
    const trimmed = uspInput.trim()
    if (!trimmed || (data.uspKeywords || []).length >= 5) return
    updateData({ uspKeywords: [...(data.uspKeywords || []), trimmed] })
    setUspInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 8"
        title="Industry intelligence module"
        description="We adapt this section to your industry so generated content sounds domain-specific, not generic."
      />

      <div className="mt-6 space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Price positioning</p>
          <div className="grid grid-cols-4 gap-2">
            {['budget', 'mid', 'premium', 'luxury'].map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => updateData({ priceSegment: seg as 'budget' | 'mid' | 'premium' | 'luxury' })}
                className={cn(
                  'h-10 rounded-lg border text-sm font-medium capitalize transition-colors',
                  data.priceSegment === seg
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-border/70',
                )}
              >
                {seg === 'mid' ? 'Mid-range' : seg.charAt(0).toUpperCase() + seg.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q) => (
            <div key={q.key}>
              <div className="mb-2 flex items-baseline gap-2">
                <label className="text-sm font-medium text-foreground">{q.label}</label>
                {q.required && <span className="text-[10px] text-muted-foreground">required</span>}
              </div>
              {q.helpText && <p className="mb-2 text-xs text-muted-foreground">{q.helpText}</p>}
              <QuestionField
                q={q}
                value={data.industryAnswers?.[q.key] as string | string[] | boolean | number | undefined}
                onChange={(v) => setIndustryAnswer(q.key, v)}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your USP keywords</p>
          <p className="mb-3 text-xs text-muted-foreground">Short phrases that make you unique (max 5)</p>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={uspInput}
              onChange={(e) => setUspInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUsp() } }}
              placeholder='e.g. "15 years experience" or "RERA certified"'
              className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={addUsp}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              Add
            </button>
          </div>
          {(data.uspKeywords || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(data.uspKeywords || []).map((kw, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                  {kw}
                  <button type="button" onClick={() => updateData({ uspKeywords: (data.uspKeywords || []).filter((_, j) => j !== i) })}>
                    <IconX size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {missingRequired.length > 0 && (
          <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/40">
            <p className="text-xs text-amber-800 dark:text-amber-100">
              Required for your industry: {missingRequired.join(', ')}
            </p>
          </div>
        )}
      </div>

      <StepFooter
        onBack={() => setStep(7)}
        onSkip={() => setStep(9)}
        onContinue={() => setStep(9)}
        continueDisabled={missingRequired.length > 0}
      />
    </div>
  )
}
