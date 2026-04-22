'use client'

import { useState } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore, type FontMood } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const FONT_MOODS: { id: FontMood; label: string; sample: string; desc: string }[] = [
  { id: 'serif_elegant', label: 'Serif Elegant', sample: 'Aa', desc: 'Timeless, luxury, editorial' },
  { id: 'sans_modern', label: 'Sans Modern', sample: 'Aa', desc: 'Clean, contemporary, versatile' },
  { id: 'display_bold', label: 'Display Bold', sample: 'Aa', desc: 'Impactful, attention-grabbing' },
  { id: 'script_personal', label: 'Script Personal', sample: 'Aa', desc: 'Handwritten, warm, personal' },
  { id: 'mono_technical', label: 'Mono Technical', sample: 'Aa', desc: 'Tech, precise, data-driven' },
]

const FONT_STYLE_MAP: Record<FontMood, React.CSSProperties> = {
  serif_elegant: { fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  sans_modern: { fontFamily: 'system-ui, sans-serif', fontWeight: 300 },
  display_bold: { fontFamily: 'Impact, system-ui', fontWeight: 900 },
  script_personal: { fontFamily: 'cursive', fontWeight: 400 },
  mono_technical: { fontFamily: 'monospace', fontWeight: 400, letterSpacing: '0.05em' },
}

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent" />
      <div>
        <p className="text-white/60 text-xs font-medium">{label}</p>
        <p className="text-white/30 text-[11px] font-mono uppercase">{value}</p>
      </div>
    </div>
  )
}

export function StepVisualIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Visual Identity</h2>
        <p className="text-white/40 text-sm mt-2">
          Set your brand colours and typography mood.
          {' '}
          <span className="text-white/25">AI will use these in image prompts.</span>
        </p>
      </div>

      {/* Brand Colours */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Brand Colours</p>
        <div className="grid grid-cols-3 gap-3">
          <ColorSwatch label="Primary" value={data.colorPrimary || '#000000'} onChange={(v) => updateData({ colorPrimary: v, colors: [v, data.colorSecondary || '#ffffff', data.colorAccent || ''] })} />
          <ColorSwatch label="Secondary" value={data.colorSecondary || '#ffffff'} onChange={(v) => updateData({ colorSecondary: v })} />
          <ColorSwatch label="Accent" value={data.colorAccent || '#00d4ff'} onChange={(v) => updateData({ colorAccent: v })} />
        </div>
        {/* Live preview swatch */}
        <div className="mt-3 rounded-xl overflow-hidden h-12 flex">
          <div className="flex-1" style={{ background: data.colorPrimary || '#000' }} />
          <div className="flex-1" style={{ background: data.colorSecondary || '#fff' }} />
          <div className="w-16" style={{ background: data.colorAccent || '#00d4ff' }} />
        </div>
      </div>

      {/* Typography Mood */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Typography Mood</p>
        <div className="grid grid-cols-1 gap-2">
          {FONT_MOODS.map((f) => {
            const selected = data.fontMood === f.id
            return (
              <button
                key={f.id}
                onClick={() => updateData({ fontMood: f.id })}
                className={cn(
                  'flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all',
                  selected
                    ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                )}
              >
                <span
                  className="text-2xl w-12 text-center flex-shrink-0"
                  style={{ ...FONT_STYLE_MAP[f.id], color: selected ? 'var(--ai-color)' : 'rgba(255,255,255,0.7)' }}
                >
                  {f.sample}
                </span>
                <div className="flex-1">
                  <p className={cn('font-medium text-sm', selected ? 'text-[var(--ai-color)]' : 'text-white/80')}>{f.label}</p>
                  <p className="text-white/35 text-xs">{f.desc}</p>
                </div>
                {selected && (
                  <span className="w-5 h-5 rounded-full bg-[var(--ai-color)] flex items-center justify-center flex-shrink-0">
                    <IconCheck size={11} className="text-black" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(3)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(5)} className="text-white/30 hover:text-white/60 text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(5)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
