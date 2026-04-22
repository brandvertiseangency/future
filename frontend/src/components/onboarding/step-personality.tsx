'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useOnboardingStore, type VibeStyle } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const VIBE_OPTIONS: { id: VibeStyle; label: string; emoji: string }[] = [
  { id: 'luxury', label: 'Luxury', emoji: '✦' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'minimal', label: 'Minimal', emoji: '○' },
  { id: 'playful', label: 'Playful', emoji: '◎' },
  { id: 'bold', label: 'Bold', emoji: '◼' },
  { id: 'trustworthy', label: 'Trustworthy', emoji: '◇' },
  { id: 'warm', label: 'Warm', emoji: '◉' },
  { id: 'edgy', label: 'Edgy', emoji: '△' },
  { id: 'inspirational', label: 'Inspirational', emoji: '★' },
  { id: 'professional', label: 'Professional', emoji: '▣' },
]

const toneLabel = (v: number) => {
  if (v <= 20) return 'Very Casual'
  if (v <= 40) return 'Conversational'
  if (v <= 60) return 'Balanced'
  if (v <= 80) return 'Professional'
  return 'Very Professional'
}

export function StepPersonality() {
  const { data, updateData, setStep } = useOnboardingStore()
  const [previewCaption, setPreviewCaption] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchPreview = useCallback(async () => {
    setLoadingPreview(true)
    try {
      const { caption } = await apiCall<{ caption: string }>('/api/onboarding/preview-caption', {
        method: 'POST',
        body: JSON.stringify({ tone: data.tone, styles: data.styles, industry: data.industryLabel || data.industry }),
      })
      setPreviewCaption(caption)
    } catch {
      setPreviewCaption('Our brand speaks in a voice that connects deeply with every customer we serve.')
    } finally {
      setLoadingPreview(false)
    }
  }, [data.tone, data.styles, data.industry, data.industryLabel])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(fetchPreview, 800)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [fetchPreview])

  const toggleVibe = (id: VibeStyle) => {
    const current = (data.vibeStyles || [])
    if (current.includes(id)) {
      updateData({ vibeStyles: current.filter((x) => x !== id), styles: current.filter((x) => x !== id) })
    } else if (current.length < 3) {
      updateData({ vibeStyles: [...current, id], styles: [...current, id] })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Define your brand personality</h2>
        <p className="text-white/40 text-sm mt-2">This shapes your AI caption tone and style.</p>
      </div>

      {/* Tone slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">Casual</span>
          <span className="text-[var(--ai-color)] text-sm font-semibold bg-[var(--ai-color)]/10 px-3 py-1 rounded-full">
            {toneLabel(data.tone)}
          </span>
          <span className="text-white/40 text-xs">Professional</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={data.tone}
          onChange={(e) => updateData({ tone: parseInt(e.target.value) })}
          className="w-full accent-cyan-500 cursor-pointer"
        />
      </div>

      {/* Vibe chips */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">
          Brand vibe <span className="text-white/25 normal-case">(pick up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map(({ id, label }) => {
            const selected = (data.vibeStyles || []).includes(id)
            return (
              <button
                key={id}
                onClick={() => toggleVibe(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all',
                  selected
                    ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/15 text-[var(--ai-color)]'
                    : 'border-white/[0.1] bg-white/[0.03] text-white/50 hover:border-white/30 hover:text-white/80'
                )}
              >
                {selected && <IconCheck size={10} />}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* AI Preview */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
        <p className="text-[10px] uppercase tracking-widest text-[var(--ai-color)] font-semibold mb-2">AI Preview</p>
        {loadingPreview ? (
          <div className="space-y-2">
            <div className="h-3 rounded bg-white/[0.08] animate-pulse w-full" />
            <div className="h-3 rounded bg-white/[0.05] animate-pulse w-3/4" />
          </div>
        ) : (
          <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;{previewCaption}&rdquo;</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(2)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(4)} className="text-white/30 hover:text-white/60 text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(4)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
