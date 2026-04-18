'use client'

import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const INTEREST_SUGGESTIONS = ['Fitness', 'Luxury', 'Tech', 'Family', 'Career', 'Fashion', 'Food', 'Gaming', 'Travel', 'Sustainability']
const GENDERS = [
  { id: 'mostly-men', label: 'Mostly men' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'mostly-women', label: 'Mostly women' },
]

export function StepAudience() {
  const { data, updateData, setStep } = useOnboardingStore()
  const [interestInput, setInterestInput] = useState('')

  const addInterest = (tag: string) => {
    if (!tag.trim() || (data.interests || []).length >= 5) return
    if (!(data.interests || []).includes(tag.trim())) {
      updateData({ interests: [...(data.interests || []), tag.trim()] })
    }
    setInterestInput('')
  }

  const removeInterest = (tag: string) => {
    updateData({ interests: (data.interests || []).filter((i) => i !== tag) })
  }

  const [ageRange, setAgeRange] = useState<[number, number]>(data.ageRange || [25, 44])

  const updateAge = (idx: 0 | 1, val: number) => {
    const next: [number, number] = [...ageRange] as [number, number]
    next[idx] = val
    if (next[0] <= next[1]) {
      setAgeRange(next)
      updateData({ ageRange: next })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Who are you talking to?</h2>
        <p className="text-white/40 text-sm mt-2">Define your ideal audience for targeted AI content.</p>
      </div>

      {/* Age range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Age range</p>
          <span className="text-[var(--ai-color)] text-sm font-semibold bg-[var(--ai-color)]/10 px-3 py-1 rounded-full">
            {ageRange[0]}–{ageRange[1] === 65 ? '65+' : ageRange[1]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/30 text-xs mb-1 block">From</label>
            <input type="range" min={18} max={64} value={ageRange[0]}
              onChange={(e) => updateAge(0, parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer" />
          </div>
          <div>
            <label className="text-white/30 text-xs mb-1 block">To</label>
            <input type="range" min={19} max={65} value={ageRange[1]}
              onChange={(e) => updateAge(1, parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Gender mix</p>
        <div className="flex gap-3">
          {GENDERS.map((g) => (
            <button
              key={g.id}
              onClick={() => updateData({ gender: g.id })}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all',
                data.gender === g.id
                  ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/10 text-[var(--ai-color)]'
                  : 'border-white/[0.08] text-white/50 hover:border-white/20'
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2">Location</p>
        <input
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 transition-all"
          placeholder="e.g. United States, India, Global…"
          value={data.location || ''}
          onChange={(e) => updateData({ location: e.target.value })}
        />
      </div>

      {/* Interests */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2">
          Interests <span className="text-white/25">(up to 5)</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(data.interests || []).map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--ai-color)]/15 border border-[var(--ai-border)]/30 text-[var(--ai-color)] text-xs">
              {tag}
              <button onClick={() => removeInterest(tag)}><IconX size={10} /></button>
            </span>
          ))}
        </div>
        <input
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 transition-all"
          placeholder="Type an interest and press Enter…"
          value={interestInput}
          onChange={(e) => setInterestInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(interestInput) } }}
          disabled={(data.interests || []).length >= 5}
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {INTEREST_SUGGESTIONS.filter((s) => !(data.interests || []).includes(s)).map((s) => (
            <button key={s} onClick={() => addInterest(s)}
              className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-white/40 text-xs hover:border-white/20 hover:text-white/60 transition-all">
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(3)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(5)} className="text-white/30 hover:text-white/60 text-sm transition-colors">Skip for now →</button>
          <AIButton onClick={() => setStep(5)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
