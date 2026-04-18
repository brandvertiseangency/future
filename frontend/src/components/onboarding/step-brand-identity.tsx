'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const INDUSTRIES = [
  'Fashion & Apparel', 'Food & Beverage', 'Technology', 'Health & Fitness',
  'Beauty & Cosmetics', 'Real Estate', 'Finance', 'Education',
  'Travel & Tourism', 'Entertainment', 'Retail', 'Professional Services',
]

const VOICES = [
  { id: 'professional', emoji: '💼', label: 'Professional', desc: 'Authoritative & trustworthy' },
  { id: 'playful', emoji: '🎉', label: 'Playful', desc: 'Fun, witty & lighthearted' },
  { id: 'bold', emoji: '⚡', label: 'Bold', desc: 'High-impact & fearless' },
  { id: 'luxurious', emoji: '✨', label: 'Luxurious', desc: 'Premium, refined & elegant' },
]

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200'

export function StepBrandIdentity() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div>
        <span className="section-tag">Brand Setup</span>
        <h2 className="text-white font-semibold text-3xl tracking-tight">
          Tell us about your brand
        </h2>
        <p className="text-white/50 text-sm mt-2">
          We&apos;ll use this to craft your unique brand DNA and content strategy.
        </p>
      </div>

      <div className="space-y-4">
        <input
          className={inputClass}
          placeholder="Brand name"
          value={data.brandName}
          onChange={(e) => updateData({ brandName: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Website URL (optional)"
          value={data.website}
          onChange={(e) => updateData({ website: e.target.value })}
        />

        <select
          className={cn(inputClass, 'cursor-pointer')}
          value={data.industry}
          onChange={(e) => updateData({ industry: e.target.value })}
        >
          <option value="" disabled className="bg-[#111]">Select your industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind} className="bg-[#111]">{ind}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-white/60 text-sm font-medium mb-3">Brand voice</p>
        <div className="grid grid-cols-2 gap-3">
          {VOICES.map((v) => {
            const selected = data.voice === v.id
            return (
              <motion.button
                key={v.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => updateData({ voice: v.id })}
                className={cn(
                  'relative text-left p-4 rounded-xl border transition-all duration-200',
                  selected
                    ? 'border-violet-500/50 bg-violet-500/[0.08]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
                )}
              >
                {selected && (
                  <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                    <IconCheck size={10} className="text-white" />
                  </span>
                )}
                <div className="text-3xl mb-2">{v.emoji}</div>
                <p className="text-white font-medium text-sm">{v.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{v.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
