'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AudienceBuilder({
  ageRange,
  gender,
  city,
  lifestyle,
  interestInput,
  onAgeRangeChange,
  onGenderChange,
  onCityChange,
  onInterestInputChange,
  onAddInterest,
  onRemoveInterest,
}: {
  ageRange: [number, number]
  gender: 'mostly_male' | 'mixed' | 'mostly_female'
  city: string
  lifestyle: string[]
  interestInput: string
  onAgeRangeChange: (range: [number, number]) => void
  onGenderChange: (gender: 'mostly_male' | 'mixed' | 'mostly_female') => void
  onCityChange: (city: string) => void
  onInterestInputChange: (value: string) => void
  onAddInterest: (value: string) => void
  onRemoveInterest: (value: string) => void
}) {
  const GENDER_OPTIONS: Array<{ id: 'mostly_male' | 'mixed' | 'mostly_female'; label: string }> = [
    { id: 'mostly_male', label: 'Mostly men' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'mostly_female', label: 'Mostly women' },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[#111111]">Audience age range</p>
          <p className="text-xs text-[#6B7280]">{ageRange[0]}-{ageRange[1]}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input type="range" min={18} max={64} value={ageRange[0]} onChange={(e) => onAgeRangeChange([Number(e.target.value), ageRange[1]])} className="accent-[#111111]" />
          <input type="range" min={19} max={65} value={ageRange[1]} onChange={(e) => onAgeRangeChange([ageRange[0], Number(e.target.value)])} className="accent-[#111111]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {GENDER_OPTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => onGenderChange(item.id)}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm',
              gender === item.id ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E7EB] bg-white text-[#111111]'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <input
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-[#111111]/15"
        placeholder="Primary audience location (city/region)"
      />

      <div>
        <div className="flex flex-wrap gap-2">
          {lifestyle.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 text-xs text-[#111111]">
              {tag}
              <button onClick={() => onRemoveInterest(tag)}><X size={11} /></button>
            </span>
          ))}
        </div>
        <input
          value={interestInput}
          onChange={(e) => onInterestInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAddInterest(interestInput)
            }
          }}
          className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-[#111111]/15"
          placeholder="Add interests/lifestyle tags and press Enter"
        />
      </div>
    </div>
  )
}
