'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FontMood } from '@/stores/onboarding'

const FONT_OPTIONS: { id: FontMood; title: string; caption: string; preview: string; className: string }[] = [
  { id: 'sans_modern', title: 'Modern Sans', caption: 'General interface and body copy', preview: 'Inter', className: 'font-sans' },
  { id: 'serif_elegant', title: 'Editorial Serif', caption: 'Premium headings and emphasis', preview: 'DM Serif Display', className: 'font-[var(--font-dm-serif-display)] italic' },
  { id: 'display_bold', title: 'Display Bold', caption: 'High-impact campaigns', preview: 'Bold Display', className: 'font-black tracking-tight' },
  { id: 'script_personal', title: 'Personal Script', caption: 'Warm handcrafted narratives', preview: 'Signature', className: 'italic' },
  { id: 'mono_technical', title: 'Technical Mono', caption: 'Data or product-forward brands', preview: 'MONO', className: 'font-mono' },
]

export function FontSelector({
  selected,
  onSelect,
}: {
  selected: FontMood | null
  onSelect: (mood: FontMood) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {FONT_OPTIONS.map((option) => {
        const active = selected === option.id
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all',
              active ? 'border-[#111111] bg-[#F3F4F6]' : 'border-[#E5E7EB] bg-white hover:bg-[#F7F7F8]'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#111111]">{option.title}</p>
                <p className="text-xs text-[#6B7280]">{option.caption}</p>
              </div>
              {active ? <Check size={14} className="text-[#111111]" /> : null}
            </div>
            <p className={cn('mt-2 text-xl text-[#111111]', option.className)}>{option.preview}</p>
          </button>
        )
      })}
    </div>
  )
}
