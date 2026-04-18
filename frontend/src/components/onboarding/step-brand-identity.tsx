'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const INDUSTRIES = [
  { id: 'Fashion', label: 'Fashion', icon: '👗' },
  { id: 'Food & Beverage', label: 'Food & Bev', icon: '🍽️' },
  { id: 'Tech & SaaS', label: 'Tech & SaaS', icon: '💻' },
  { id: 'Health & Wellness', label: 'Health', icon: '🏃' },
  { id: 'Finance', label: 'Finance', icon: '💰' },
  { id: 'Education', label: 'Education', icon: '📚' },
  { id: 'Real Estate', label: 'Real Estate', icon: '🏠' },
  { id: 'Beauty', label: 'Beauty', icon: '💄' },
  { id: 'Travel', label: 'Travel', icon: '✈️' },
  { id: 'Sports', label: 'Sports', icon: '⚽' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'Other', label: 'Other', icon: '✦' },
]

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200'

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
                    ? 'border-violet-500/60 bg-violet-500/[0.1]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                )}
              >
                {selected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                    <IconCheck size={9} className="text-white" />
                  </span>
                )}
                <span className="text-xl">{ind.icon}</span>
                <span className="text-[11px] text-white/60 font-medium leading-tight">{ind.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Live preview */}
      {data.brandName && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
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
          <button
            onClick={() => setStep(3)}
            disabled={!canContinue}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
