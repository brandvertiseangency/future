'use client'

import { cn } from '@/lib/utils'
import type { VibeStyle } from '@/stores/onboarding'

const STYLE_OPTIONS: VibeStyle[] = ['professional', 'minimal', 'trustworthy', 'luxury', 'warm', 'bold', 'energetic', 'edgy', 'inspirational', 'playful']

function toneLabel(v: number) {
  if (v <= 20) return 'Very Casual'
  if (v <= 40) return 'Conversational'
  if (v <= 60) return 'Balanced'
  if (v <= 80) return 'Professional'
  return 'Very Professional'
}

export function VoiceToolbar({
  tone,
  selectedStyles,
  onToneChange,
  onToggleStyle,
}: {
  tone: number
  selectedStyles: VibeStyle[]
  onToneChange: (tone: number) => void
  onToggleStyle: (style: VibeStyle) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">Voice slider</p>
          <p className="text-sm font-medium text-[#111111]">{toneLabel(tone)}</p>
        </div>
        <input type="range" min={0} max={100} value={tone} onChange={(e) => onToneChange(Number(e.target.value))} className="mt-2 w-full accent-[#111111]" />
      </div>
      <div className="flex flex-wrap gap-2">
        {STYLE_OPTIONS.map((style) => {
          const active = selectedStyles.includes(style)
          return (
            <button
              key={style}
              onClick={() => onToggleStyle(style)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs capitalize transition-all',
                active ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E7EB] bg-white text-[#111111]'
              )}
            >
              {style}
            </button>
          )
        })}
      </div>
    </div>
  )
}
