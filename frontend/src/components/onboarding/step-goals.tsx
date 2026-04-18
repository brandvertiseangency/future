'use client'

import { motion } from 'framer-motion'
import { IconCheck, IconFlame, IconMessage, IconCurrencyDollar } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const GOALS = [
  {
    id: 'viral',
    icon: IconFlame,
    label: 'Viral Growth & Brand Awareness',
    desc: 'Maximise reach and impressions',
  },
  {
    id: 'community',
    icon: IconMessage,
    label: 'Community & Engagement',
    desc: 'Build loyal followers and trust',
  },
  {
    id: 'revenue',
    icon: IconCurrencyDollar,
    label: 'Leads & Revenue',
    desc: 'Drive traffic and sales',
  },
]

const FREQUENCIES = [
  { id: '3x', label: '3x / week' },
  { id: 'daily', label: 'Daily' },
  { id: '2xday', label: '2x / day' },
]

export function StepGoals() {
  const { data, updateData } = useOnboardingStore()

  const toggleGoal = (id: string) => {
    const updated = data.goals.includes(id)
      ? data.goals.filter((g) => g !== id)
      : [...data.goals, id]
    updateData({ goals: updated })
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="section-tag">Goals & KPIs</span>
        <h2 className="text-white font-semibold text-3xl tracking-tight">
          What do you want to achieve?
        </h2>
        <p className="text-white/50 text-sm mt-2">Select all that apply.</p>
      </div>

      <div className="space-y-3">
        {GOALS.map((goal) => {
          const selected = data.goals.includes(goal.id)
          const Icon = goal.icon
          return (
            <motion.button
              key={goal.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                'w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden',
                selected
                  ? 'border-violet-500/50 bg-violet-500/[0.06]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
              )}
            >
              {selected && (
                <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <IconCheck size={11} className="text-white" />
                </span>
              )}
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  selected ? 'bg-violet-500/20 text-violet-400' : 'bg-white/[0.06] text-white/50'
                )}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{goal.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{goal.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div>
        <p className="text-white/60 text-sm font-medium mb-3">How often do you want to post?</p>
        <div className="flex gap-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f.id}
              onClick={() => updateData({ postFrequency: f.id })}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200',
                data.postFrequency === f.id
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
