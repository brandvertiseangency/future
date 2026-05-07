'use client'

import { useState } from 'react'
import { Globe, Briefcase, Hash, Smartphone, Play, Check } from 'lucide-react'
import { useOnboardingStore, type ContentMix } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Globe, color: '#E4405F' },
  { id: 'linkedin', label: 'LinkedIn', icon: Briefcase, color: '#0A66C2' },
  { id: 'twitter', label: 'Twitter/X', icon: Hash, color: '#0F1419' },
  { id: 'facebook', label: 'Facebook', icon: Smartphone, color: '#1877F2' },
  { id: 'youtube', label: 'YouTube', icon: Play, color: '#FF0000' },
]

const CONTENT_TYPES: { key: keyof ContentMix; label: string; desc: string; color: string }[] = [
  { key: 'promotional', label: 'Promotional', desc: 'Sales, offers, product launches', color: '#f43f5e' },
  { key: 'educational', label: 'Educational', desc: 'Tips, guides, expert insights', color: '#0ea5e9' },
  { key: 'testimonial', label: 'Testimonial', desc: 'Customer stories, reviews', color: '#10b981' },
  { key: 'bts', label: 'Behind the Scenes', desc: 'Process, team, day-in-the-life', color: '#f59e0b' },
  { key: 'festive', label: 'Festive', desc: 'Festival greetings, seasonal', color: '#a78bfa' },
]

const POST_COUNTS = [3, 4, 5, 7, 10, 14]

export function StepCalendarPrefs() {
  const { data, updateData, setStep } = useOnboardingStore()
  const [submitting] = useState(false)

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
  const hasPlatform = (data.activePlatforms || []).length > 0
  const canFinish = hasPlatform && mixTotal === 100 && !submitting

  return (
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 11"
        title="Content plan"
        description="Set your posting frequency and content mix. AI will generate posts accordingly."
      />

      <div className="mt-6 space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Active platforms
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ id, label, icon: Icon, color }) => {
              const selected = (data.activePlatforms || []).includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePlatform(id)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
                    selected
                      ? 'border-foreground bg-muted/60 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-border/70 hover:text-foreground',
                  )}
                >
                  <Icon size={14} style={{ color: selected ? color : undefined }} />
                  {label}
                  {selected && <Check size={12} className="text-foreground" />}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Posts per week
          </p>
          <div className="flex flex-wrap gap-2">
            {POST_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateData({ weeklyPostCount: n })}
                className={cn(
                  'h-11 w-11 rounded-lg border text-sm font-semibold transition-colors',
                  data.weeklyPostCount === n
                    ? 'border-foreground bg-muted/60 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-border/70 hover:text-foreground',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Content mix
            </p>
            <span className={cn('font-mono text-xs', mixTotal !== 100 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
              {mixTotal}% {mixTotal !== 100 ? `(${mixTotal > 100 ? 'over' : 'under'} by ${Math.abs(mixTotal - 100)}%)` : '✓'}
            </span>
          </div>
          <div className="space-y-3">
            {CONTENT_TYPES.map(({ key, label, desc, color }) => {
              const val = data.contentMix?.[key] ?? 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: color }} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => adjustMix(key, -5)} className="h-6 w-6 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/70">−</button>
                    <span className="w-6 text-center font-mono text-xs text-foreground">{val}</span>
                    <button type="button" onClick={() => adjustMix(key, 5)} className="h-6 w-6 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/70">+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-schedule posts</p>
            <p className="mt-0.5 text-xs text-muted-foreground">AI will automatically queue posts at optimal times</p>
          </div>
          <button
            type="button"
            onClick={() => updateData({ autoSchedule: !data.autoSchedule })}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors',
              data.autoSchedule ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
            aria-pressed={data.autoSchedule}
          >
            <span className={cn(
              'absolute top-1 h-4 w-4 rounded-full bg-background shadow transition-all',
              data.autoSchedule ? 'left-6' : 'left-1',
            )} />
          </button>
        </div>

        {!hasPlatform || mixTotal !== 100 ? (
          <p className="text-xs text-destructive">
            Select at least one platform and make content mix total 100% to continue.
          </p>
        ) : null}
      </div>

      <StepFooter
        onBack={() => setStep(10)}
        onContinue={() => setStep(12)}
        continueDisabled={!canFinish}
        continueLabel="Finish setup"
      />
    </div>
  )
}
