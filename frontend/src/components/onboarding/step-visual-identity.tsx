'use client'

import { useOnboardingStore, type FontMood } from '@/stores/onboarding'
import { AIButton } from '@/components/ui/ai-button'
import { ColorTokenPicker } from '@/components/onboarding/controls/color-token-picker'
import { FontSelector } from '@/components/onboarding/controls/font-selector'

export function StepVisualIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[#111111] font-semibold text-2xl tracking-tight">Visual identity system</h2>
        <p className="text-[#6B7280] text-sm mt-1">
          Set palette and type direction for creatives. Inter is default body and DM Serif can be used for emphasis.
        </p>
      </div>

      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-wider font-medium mb-3">Color picker</p>
        <ColorTokenPicker
          primary={data.colorPrimary}
          secondary={data.colorSecondary}
          accent={data.colorAccent}
          onChange={(patch) => updateData({
            colorPrimary: patch.primary ?? data.colorPrimary,
            colorSecondary: patch.secondary ?? data.colorSecondary,
            colorAccent: patch.accent ?? data.colorAccent,
            colors: [patch.primary ?? data.colorPrimary, patch.secondary ?? data.colorSecondary, patch.accent ?? data.colorAccent],
          })}
        />
        <div className="mt-4 rounded-xl overflow-hidden h-12 flex border border-[#E5E7EB]">
          <div className="flex-1" style={{ background: data.colorPrimary || '#000' }} />
          <div className="flex-1" style={{ background: data.colorSecondary || '#fff' }} />
          <div className="w-16" style={{ background: data.colorAccent || '#00d4ff' }} />
        </div>
      </div>

      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-wider font-medium mb-3">Font selection</p>
        <FontSelector selected={data.fontMood as FontMood | null} onSelect={(mood) => updateData({ fontMood: mood })} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(4)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(6)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(6)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
