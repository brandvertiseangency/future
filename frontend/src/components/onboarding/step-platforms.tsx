'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', freq: '4–5×/week' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', freq: '3–4×/week' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦', freq: '5–7×/week' },
  { id: 'facebook', label: 'Facebook', icon: '📘', freq: '3–5×/week' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', freq: '5–7×/week' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', freq: '2–3×/week' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', freq: '5–10×/week' },
  { id: 'threads', label: 'Threads', icon: '🧵', freq: '3–5×/week' },
]

export function StepPlatforms() {
  const { data, updateData, setStep } = useOnboardingStore()

  const toggle = (id: string) => {
    const current = data.platforms || []
    if (current.includes(id)) {
      updateData({ platforms: current.filter((p) => p !== id) })
    } else {
      updateData({ platforms: [...current, id] })
    }
  }

  const canContinue = (data.platforms || []).length > 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Where do you want to post?</h2>
        <p className="text-white/40 text-sm mt-2">Select at least one platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PLATFORMS.map((p) => {
          const selected = (data.platforms || []).includes(p.id)
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(p.id)}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                selected
                  ? 'border-violet-500/60 bg-violet-500/[0.08]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
              )}
            >
              {selected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                  <IconCheck size={9} className="text-white" />
                </span>
              )}
              <span className="text-2xl">{p.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{p.label}</p>
                {selected && (
                  <p className="text-violet-400 text-[11px] mt-0.5">{p.freq}</p>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(4)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(6)} className="text-white/30 hover:text-white/60 text-sm transition-colors">Skip for now →</button>
          <button
            onClick={() => setStep(6)}
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
