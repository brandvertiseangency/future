'use client'

import { cn } from '@/lib/utils'

const SUGGESTED_COLORS = ['#111111', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB']

function getContrastScore(hexA: string, hexB: string) {
  const toRgb = (hex: string) => {
    const raw = hex.replace('#', '')
    const value = raw.length === 3 ? raw.split('').map((x) => x + x).join('') : raw
    const int = Number.parseInt(value, 16)
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
  }
  const luminance = ([r, g, b]: number[]) => {
    const channels = [r, g, b].map((v) => {
      const x = v / 255
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }
  const l1 = luminance(toRgb(hexA))
  const l2 = luminance(toRgb(hexB))
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  return Math.round(ratio * 10) / 10
}

export function ColorTokenPicker({
  primary,
  secondary,
  accent,
  onChange,
}: {
  primary: string
  secondary: string
  accent: string
  onChange: (patch: { primary?: string; secondary?: string; accent?: string }) => void
}) {
  const contrast = getContrastScore(primary || '#111111', secondary || '#ffffff')
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'primary', label: 'Primary', value: primary || '#111111' },
          { key: 'secondary', label: 'Secondary', value: secondary || '#ffffff' },
          { key: 'accent', label: 'Accent', value: accent || '#9CA3AF' },
        ].map((color) => (
          <label key={color.key} className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-3">
            <p className="text-xs text-[#6B7280]">{color.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={color.value}
                onChange={(e) => onChange({ [color.key]: e.target.value })}
                className="h-8 w-8 rounded-md border border-[#D1D5DB] bg-transparent"
              />
              <span className="text-xs font-mono text-[#111111]">{color.value}</span>
            </div>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_COLORS.map((hex) => (
          <button
            key={hex}
            onClick={() => onChange({ accent: hex })}
            className={cn('h-7 w-7 rounded-full border border-[#E5E7EB]', accent === hex && 'ring-2 ring-[#111111] ring-offset-2')}
            style={{ backgroundColor: hex }}
            aria-label={`Use ${hex} as accent`}
          />
        ))}
      </div>
      <p className="text-xs text-[#6B7280]">
        Contrast score <span className="font-medium text-[#111111]">{contrast}:1</span> between primary and secondary.
      </p>
    </div>
  )
}
