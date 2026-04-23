'use client'

import { useState } from 'react'
import { Globe, Briefcase, Hash, Smartphone, Play } from 'lucide-react'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore, type ContentMix } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Globe, color: '#f43f5e' },
  { id: 'linkedin', label: 'LinkedIn', icon: Briefcase, color: '#3b82f6' },
  { id: 'twitter', label: 'Twitter/X', icon: Hash, color: '#94a3b8' },
  { id: 'facebook', label: 'Facebook', icon: Smartphone, color: '#2563eb' },
  { id: 'youtube', label: 'YouTube', icon: Play, color: '#ef4444' },
]

const CONTENT_TYPES: { key: keyof ContentMix; label: string; desc: string; color: string }[] = [
  { key: 'promotional', label: 'Promotional', desc: 'Sales, offers, product launches', color: '#f43f5e' },
  { key: 'educational', label: 'Educational', desc: 'Tips, guides, expert insights', color: '#00d4ff' },
  { key: 'testimonial', label: 'Testimonial', desc: 'Customer stories, reviews', color: '#10b981' },
  { key: 'bts', label: 'Behind the Scenes', desc: 'Process, team, day-in-the-life', color: '#f59e0b' },
  { key: 'festive', label: 'Festive', desc: 'Festival greetings, seasonal', color: '#a78bfa' },
]

const POST_COUNTS = [3, 4, 5, 7, 10, 14]

export function StepCalendarPrefs() {
  const { data, updateData, setStep } = useOnboardingStore()
  const [submitting, setSubmitting] = useState(false)

  const togglePlatform = (id: string) => {
    const current = data.activePlatforms || []
    if (current.includes(id)) {
      updateData({ activePlatforms: current.filter((p) => p !== id) })
    } else {
      updateData({ activePlatforms: [...current, id] })
    }
  }

  const adjustMix = (key: keyof ContentMix, delta: number) => {
    const current = data.contentMix || { promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 }
    const newVal = Math.max(0, Math.min(100, (current[key] || 0) + delta))
    updateData({ contentMix: { ...current, [key]: newVal } })
  }

  const mixTotal = Object.values(data.contentMix || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Content plan</h2>
        <p className="text-white/40 text-sm mt-2">
          Set your posting frequency and content mix. AI will generate posts accordingly.
        </p>
      </div>

      {/* Platforms */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Active platforms</p>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map(({ id, label, icon: Icon, color }) => {
            const selected = (data.activePlatforms || []).includes(id)
            return (
              <button
                key={id}
                onClick={() => togglePlatform(id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  selected
                    ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1] text-white'
                    : 'border-white/[0.08] text-white/50 hover:border-white/20'
                )}
              >
                <Icon size={14} style={{ color: selected ? color : undefined }} />
                {label}
                {selected && <IconCheck size={12} className="text-[var(--ai-color)]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Weekly post count */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Posts per week</p>
        <div className="flex gap-2 flex-wrap">
          {POST_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => updateData({ weeklyPostCount: n })}
              className={cn(
                'w-12 h-12 rounded-xl border text-sm font-semibold transition-all',
                data.weeklyPostCount === n
                  ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1] text-[var(--ai-color)]'
                  : 'border-white/[0.08] text-white/50 hover:border-white/20'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Content mix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Content mix</p>
          <span className={cn('text-xs font-mono', mixTotal !== 100 ? 'text-red-400' : 'text-[var(--ai-color)]')}>
            {mixTotal}% {mixTotal !== 100 ? `(${mixTotal > 100 ? 'over' : 'under'} by ${Math.abs(mixTotal - 100)}%)` : '✓'}
          </span>
        </div>
        <div className="space-y-3">
          {CONTENT_TYPES.map(({ key, label, desc, color }) => {
            const val = data.contentMix?.[key] ?? 0
            return (
              <div key={key} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white/70 text-xs font-medium">{label}</p>
                    <p className="text-white/40 text-xs">{desc}</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: color }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => adjustMix(key, -5)} className="w-6 h-6 rounded-md bg-white/[0.06] text-white/50 hover:bg-white/[0.12] text-xs transition-all">−</button>
                  <span className="text-white text-xs font-mono w-6 text-center">{val}</span>
                  <button onClick={() => adjustMix(key, 5)} className="w-6 h-6 rounded-md bg-white/[0.06] text-white/50 hover:bg-white/[0.12] text-xs transition-all">+</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Auto-schedule toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div>
          <p className="text-white/80 text-sm font-medium">Auto-schedule posts</p>
          <p className="text-white/40 text-xs mt-0.5">AI will automatically queue posts at optimal times</p>
        </div>
        <button
          onClick={() => updateData({ autoSchedule: !data.autoSchedule })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-all flex-shrink-0',
            data.autoSchedule ? 'bg-[var(--ai-color)]' : 'bg-white/[0.12]'
          )}
        >
          <span className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
            data.autoSchedule ? 'left-7' : 'left-1'
          )} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(8)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <AIButton
          onClick={() => setStep(10)}
          disabled={submitting}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold"
        >
          Finish setup →
        </AIButton>
      </div>
    </div>
  )
}
