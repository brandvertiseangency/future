'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { Shirt, UtensilsCrossed, Monitor, HeartPulse, DollarSign, GraduationCap, Home, Sparkles as SparklesIcon, Plane, Trophy, Film, MoreHorizontal } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const INDUSTRIES = [
  { id: 'Fashion', label: 'Fashion', Icon: Shirt },
  { id: 'Food & Beverage', label: 'Food & Bev', Icon: UtensilsCrossed },
  { id: 'Tech & SaaS', label: 'Tech & SaaS', Icon: Monitor },
  { id: 'Health & Wellness', label: 'Health', Icon: HeartPulse },
  { id: 'Finance', label: 'Finance', Icon: DollarSign },
  { id: 'Education', label: 'Education', Icon: GraduationCap },
  { id: 'Real Estate', label: 'Real Estate', Icon: Home },
  { id: 'Beauty', label: 'Beauty', Icon: SparklesIcon },
  { id: 'Travel', label: 'Travel', Icon: Plane },
  { id: 'Sports', label: 'Sports', Icon: Trophy },
  { id: 'Entertainment', label: 'Entertainment', Icon: Film },
  { id: 'Other', label: 'Other', Icon: MoreHorizontal },
]

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 focus:bg-white/[0.05] transition-all duration-200'

export function StepBrandIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()
  const initials = data.brandName
    ? data.brandName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  const canContinue = data.brandName.trim() && data.description.trim() && data.industry

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Tell us about your brand</h2>
        <p className="text-white/40 text-sm mt-2">
          We&apos;ll use this to craft your unique brand DNA.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            className={inputClass}
            placeholder="Brand name *"
            maxLength={50}
            value={data.brandName}
            onChange={(e) => updateData({ brandName: e.target.value })}
          />
          <span className="absolute right-3 top-3 text-xs text-white/20">
            {data.brandName.length}/50
          </span>
        </div>
        <div className="relative">
          <input
            className={inputClass}
            placeholder="One-line description * (e.g. We make sustainable sneakers for urban runners)"
            maxLength={120}
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
          />
          <span className="absolute right-3 top-3 text-xs text-white/20">
            {data.description.length}/120
          </span>
        </div>
      </div>

      {/* Industry tiles */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Industry</p>
        <div className="grid grid-cols-4 gap-2">
          {INDUSTRIES.map((ind) => {
            const selected = data.industry === ind.id
            return (
              <motion.button
                key={ind.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => updateData({ industry: ind.id })}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                  selected
                    ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                )}
              >
                {selected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--ai-color)] flex items-center justify-center">
                    <IconCheck size={9} className="text-white" />
                  </span>
                )}
                <ind.Icon size={20} className="text-[var(--text-2)]" />
                <span className="text-[11px] text-white/60 font-medium leading-tight">{ind.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Live preview */}
      {data.brandName && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.brandName}</p>
            {data.description && (
              <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{data.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(1)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(3)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
            Skip for now →
          </button>
          <AIButton
            onClick={() => setStep(3)}
            disabled={!canContinue}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
