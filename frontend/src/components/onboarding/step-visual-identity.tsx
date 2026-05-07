'use client'

import { useOnboardingStore, type FontMood } from '@/stores/onboarding'
import { ColorTokenPicker } from '@/components/onboarding/controls/color-token-picker'
import { FontSelector } from '@/components/onboarding/controls/font-selector'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

export function StepVisualIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()

  return (
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 5"
        title="Visual identity system"
        description="Set palette and type direction for creatives. Inter is default body and DM Serif can be used for emphasis."
      />

      <div className="mt-6 space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Color picker
          </p>
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
          <div className="mt-4 flex h-11 overflow-hidden rounded-lg border border-border">
            <div className="flex-1" style={{ background: data.colorPrimary || '#000' }} />
            <div className="flex-1" style={{ background: data.colorSecondary || '#fff' }} />
            <div className="w-16" style={{ background: data.colorAccent || '#00d4ff' }} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Font selection
          </p>
          <FontSelector selected={data.fontMood as FontMood | null} onSelect={(mood) => updateData({ fontMood: mood })} />
        </div>
      </div>

      <StepFooter
        onBack={() => setStep(4)}
        onSkip={() => setStep(6)}
        onContinue={() => setStep(6)}
      />
    </div>
  )
}
