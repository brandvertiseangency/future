'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding'
import { AudienceBuilder } from '@/components/onboarding/controls/audience-builder'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

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
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 6"
        title="Target audience builder"
        description="Define who content should persuade, engage, and convert."
      />

      <div className="mt-6 space-y-5">
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
            <button
              key={s}
              type="button"
              onClick={() => addInterest(s)}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <StepFooter
        onBack={() => setStep(5)}
        onSkip={() => setStep(7)}
        onContinue={() => setStep(7)}
      />
    </div>
  )
}
