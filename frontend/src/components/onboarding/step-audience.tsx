'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding'
import { AIButton } from '@/components/ui/ai-button'
import { AudienceBuilder } from '@/components/onboarding/controls/audience-builder'

const INTEREST_SUGGESTIONS = ['Fitness', 'Luxury', 'Tech', 'Family', 'Career', 'Fashion', 'Food', 'Gaming', 'Travel', 'Sustainability']

export function StepAudience() {
  const { data, updateData, setStep } = useOnboardingStore()
  const [interestInput, setInterestInput] = useState('')

  const addInterest = (tag: string) => {
    if (!tag.trim() || (data.interests || []).length >= 5) return
    if (!(data.audienceLifestyle || []).includes(tag.trim())) {
      const next = [...(data.audienceLifestyle || []), tag.trim()]
      updateData({ audienceLifestyle: next, interests: next })
    }
    setInterestInput('')
  }

  const removeInterest = (tag: string) => {
    const next = (data.audienceLifestyle || []).filter((i) => i !== tag)
    updateData({ audienceLifestyle: next, interests: next })
  }

  const [ageRange, setAgeRange] = useState<[number, number]>([
    data.audienceAgeMin || data.ageRange?.[0] || 25,
    data.audienceAgeMax || data.ageRange?.[1] || 44,
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[#111111] font-semibold text-2xl tracking-tight">Target audience builder</h2>
        <p className="text-[#6B7280] text-sm mt-1">Define who content should persuade, engage, and convert.</p>
      </div>
      <AudienceBuilder
        ageRange={ageRange}
        gender={data.audienceGender}
        city={data.audienceCity || data.location || ''}
        lifestyle={data.audienceLifestyle || []}
        interestInput={interestInput}
        onAgeRangeChange={(next) => {
          if (next[0] <= next[1]) {
            setAgeRange(next)
            updateData({ ageRange: next, audienceAgeMin: next[0], audienceAgeMax: next[1] })
          }
        }}
        onGenderChange={(gender) => updateData({ audienceGender: gender, gender })}
        onCityChange={(city) => updateData({ audienceCity: city, location: city })}
        onInterestInputChange={setInterestInput}
        onAddInterest={addInterest}
        onRemoveInterest={removeInterest}
      />
      <div className="flex flex-wrap gap-1.5">
        {INTEREST_SUGGESTIONS.filter((s) => !(data.audienceLifestyle || []).includes(s)).map((s) => (
          <button key={s} onClick={() => addInterest(s)} className="px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] text-xs hover:text-[#111111]">
            + {s}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(5)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(7)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">Skip for now →</button>
          <AIButton onClick={() => setStep(7)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
