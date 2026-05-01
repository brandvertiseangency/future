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
  const inputClass = 'w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111111] placeholder:text-[#9CA3AF] text-sm focus:outline-none focus:border-[#111111]/30 transition-all'

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
                  ? 'border-[#111111] bg-[#111111] text-white'
                  : 'border-[#E5E7EB] bg-white text-[#111111] hover:border-[#D1D5DB]'
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
          checked ? 'bg-[#111111]' : 'bg-[#D1D5DB]'
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
    <div className="space-y-8">
      <div>
        <h2 className="text-[#111111] font-semibold text-2xl tracking-tight">Industry intelligence module</h2>
        <p className="text-[#6B7280] text-sm mt-1">
          We adapt this section to your industry so generated content sounds domain-specific, not generic.
        </p>
      </div>

      {/* Price segment */}
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-wider font-medium mb-3">Price positioning</p>
        <div className="grid grid-cols-4 gap-2">
          {['budget', 'mid', 'premium', 'luxury'].map((seg) => (
            <button
              key={seg}
              onClick={() => updateData({ priceSegment: seg as 'budget' | 'mid' | 'premium' | 'luxury' })}
              className={cn(
                'py-2 rounded-xl border text-sm font-medium transition-all capitalize',
                data.priceSegment === seg
                  ? 'border-[#111111] bg-[#111111] text-white'
                  : 'border-[#E5E7EB] text-[#111111] hover:border-[#D1D5DB]'
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
              <label className="text-[#111111] text-sm font-medium">{q.label}</label>
              {q.required && <span className="text-[#6B7280] text-[10px]">required</span>}
            </div>
            {q.helpText && <p className="text-[#6B7280] text-xs mb-2">{q.helpText}</p>}
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
        <p className="text-[#6B7280] text-xs uppercase tracking-wider font-medium mb-2">Your USP keywords</p>
        <p className="text-[#6B7280] text-xs mb-3">Short phrases that make you unique (max 5)</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={uspInput}
            onChange={(e) => setUspInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUsp() } }}
            placeholder='e.g. "15 years experience" or "RERA certified"'
            className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#111111] placeholder:text-[#9CA3AF] text-sm focus:outline-none focus:border-[#111111]/30 transition-all"
          />
          <button
            onClick={addUsp}
            className="px-4 py-2.5 rounded-xl bg-[#F7F7F8] border border-[#E5E7EB] text-[#111111] text-sm hover:bg-[#EFEFF1] transition-all"
          >
            Add
          </button>
        </div>
        {(data.uspKeywords || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(data.uspKeywords || []).map((kw, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#111111] text-xs font-medium">
                {kw}
                <button onClick={() => updateData({ uspKeywords: (data.uspKeywords || []).filter((_, j) => j !== i) })}>
                  <IconX size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {missingRequired.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-xs text-amber-800">
            Required for your industry: {missingRequired.join(', ')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(7)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(9)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(9)} disabled={missingRequired.length > 0} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
