'use client'

import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { INDUSTRY_QUESTIONS, type IndustryQuestion } from '@/lib/industry-questions'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

function QuestionField({ q, value, onChange }: {
  q: IndustryQuestion
  value: string | string[] | boolean | number | undefined
  onChange: (v: string | string[] | boolean | number) => void
}) {
  const inputClass = 'w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 transition-all'

  if (q.type === 'select') {
    return (
      <select
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, 'cursor-pointer')}
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
      <div className="flex flex-wrap gap-2">
        {q.options?.map((opt) => {
          const sel = current.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                sel
                  ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/15 text-[var(--ai-color)]'
                  : 'border-white/[0.1] bg-white/[0.03] text-white/50 hover:border-white/30 hover:text-white/80'
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
          'relative w-12 h-6 rounded-full transition-all',
          checked ? 'bg-[var(--ai-color)]' : 'bg-white/[0.12]'
        )}
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
          checked ? 'left-7' : 'left-1'
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

  const [uspInput, setUspInput] = useState('')

  const addUsp = () => {
    const trimmed = uspInput.trim()
    if (!trimmed || (data.uspKeywords || []).length >= 5) return
    updateData({ uspKeywords: [...(data.uspKeywords || []), trimmed] })
    setUspInput('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Tell us more about your brand</h2>
        <p className="text-white/40 text-sm mt-2">
          These details power industry-specific content — your AI will sound like an expert.
        </p>
      </div>

      {/* Price segment */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Price positioning</p>
        <div className="grid grid-cols-4 gap-2">
          {['budget', 'mid', 'premium', 'luxury'].map((seg) => (
            <button
              key={seg}
              onClick={() => updateData({ priceSegment: seg as 'budget' | 'mid' | 'premium' | 'luxury' })}
              className={cn(
                'py-2 rounded-xl border text-sm font-medium transition-all capitalize',
                data.priceSegment === seg
                  ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1] text-[var(--ai-color)]'
                  : 'border-white/[0.08] text-white/50 hover:border-white/20'
              )}
            >
              {seg === 'mid' ? 'Mid-range' : seg.charAt(0).toUpperCase() + seg.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Industry-specific questions */}
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.key}>
            <div className="flex items-baseline gap-2 mb-2">
              <label className="text-white/70 text-sm font-medium">{q.label}</label>
              {q.required && <span className="text-[var(--ai-color)] text-[10px]">required</span>}
            </div>
            {q.helpText && <p className="text-white/35 text-xs mb-2">{q.helpText}</p>}
            <QuestionField
              q={q}
              value={data.industryAnswers?.[q.key] as string | string[] | boolean | number | undefined}
              onChange={(v) => setIndustryAnswer(q.key, v)}
            />
          </div>
        ))}
      </div>

      {/* USP Keywords */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2">Your USP keywords</p>
        <p className="text-white/30 text-xs mb-3">Short phrases that make you unique (max 5)</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={uspInput}
            onChange={(e) => setUspInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUsp() } }}
            placeholder='e.g. "15 years experience" or "RERA certified"'
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 transition-all"
          />
          <button
            onClick={addUsp}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 text-sm hover:bg-white/[0.1] transition-all"
          >
            Add
          </button>
        </div>
        {(data.uspKeywords || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(data.uspKeywords || []).map((kw, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ai-color)]/10 border border-[var(--ai-border)]/40 text-[var(--ai-color)] text-xs font-medium">
                {kw}
                <button onClick={() => updateData({ uspKeywords: (data.uspKeywords || []).filter((_, j) => j !== i) })}>
                  <IconX size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(5)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(7)} className="text-white/30 hover:text-white/60 text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(7)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
