'use client'

import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const INTERESTS = [
  'Fashion', 'Tech', 'Food', 'Travel', 'Fitness', 'Beauty',
  'Business', 'Finance', 'Gaming', 'Education', 'Lifestyle', 'Other',
]

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200'

export function StepAudience() {
  const { data, updateData } = useOnboardingStore()
  const [locationInput, setLocationInput] = useState('')

  const addLocation = () => {
    if (!locationInput.trim()) return
    updateData({ locations: [...data.locations, locationInput.trim()] })
    setLocationInput('')
  }

  const removeLocation = (loc: string) =>
    updateData({ locations: data.locations.filter((l) => l !== loc) })

  const toggleInterest = (interest: string) => {
    const updated = data.interests.includes(interest)
      ? data.interests.filter((i) => i !== interest)
      : [...data.interests, interest]
    updateData({ interests: updated })
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="section-tag">Target Audience</span>
        <h2 className="text-white font-semibold text-3xl tracking-tight">
          Who are you trying to reach?
        </h2>
        <p className="text-white/50 text-sm mt-2">
          Help us understand your ideal customer.
        </p>
      </div>

      {/* Age range */}
      <div>
        <p className="text-white/60 text-sm font-medium mb-3">
          Age range: <span className="text-white">{data.ageRange[0]}–{data.ageRange[1]}</span>
        </p>
        <div className="flex gap-4 items-center">
          <span className="text-white/40 text-xs">13</span>
          <input
            type="range" min={13} max={65} step={1}
            value={data.ageRange[0]}
            onChange={(e) => updateData({ ageRange: [+e.target.value, data.ageRange[1]] })}
            className="flex-1 accent-violet-500"
          />
          <input
            type="range" min={13} max={65} step={1}
            value={data.ageRange[1]}
            onChange={(e) => updateData({ ageRange: [data.ageRange[0], +e.target.value] })}
            className="flex-1 accent-violet-500"
          />
          <span className="text-white/40 text-xs">65+</span>
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-white/60 text-sm font-medium mb-3">Gender targeting</p>
        <div className="flex gap-2">
          {['all', 'male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => updateData({ gender: g })}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 capitalize',
                data.gender === g
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              )}
            >
              {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <p className="text-white/60 text-sm font-medium mb-2">Locations</p>
        <div className="flex gap-2 mb-2">
          <input
            className={inputClass}
            placeholder="Type a city or country, press Enter"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLocation()}
          />
        </div>
        {data.locations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.locations.map((loc) => (
              <span
                key={loc}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300"
              >
                {loc}
                <button onClick={() => removeLocation(loc)}>
                  <IconX size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interests */}
      <div>
        <p className="text-white/60 text-sm font-medium mb-3">Interests</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const selected = data.interests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                  selected
                    ? 'bg-violet-500 border-violet-500 text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                )}
              >
                {interest}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
