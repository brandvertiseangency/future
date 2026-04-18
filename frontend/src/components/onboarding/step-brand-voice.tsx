'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'

const STYLES = ['Bold', 'Minimal', 'Playful', 'Authoritative', 'Witty', 'Inspirational', 'Educational', 'Luxury']

const toneLabel = (v: number) => {
  if (v <= 25) return 'Casual'
  if (v <= 50) return 'Conversational'
  if (v <= 74) return 'Balanced'
  return 'Professional'
}

export function StepBrandVoice() {
  const { data, updateData, setStep } = useOnboardingStore()
  const [previewCaption, setPreviewCaption] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchPreview = useCallback(async () => {
    setLoadingPreview(true)
    try {
      const { caption } = await apiCall<{ caption: string }>('/api/onboarding/preview-caption', {
        method: 'POST',
        body: JSON.stringify({ tone: data.tone, styles: data.styles, industry: data.industry }),
      })
      setPreviewCaption(caption)
    } catch {
      setPreviewCaption('Unable to load preview. Continue anyway!')
    } finally {
      setLoadingPreview(false)
    }
  }, [data.tone, data.styles, data.industry])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(fetchPreview, 800)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [fetchPreview])

  const toggleStyle = (s: string) => {
    const current = data.styles || []
    if (current.includes(s)) {
      updateData({ styles: current.filter((x) => x !== s) })
    } else if (current.length < 3) {
      updateData({ styles: [...current, s] })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Find your brand voice</h2>
        <p className="text-white/40 text-sm mt-2">This shapes how your AI captions will sound.</p>
      </div>

      {/* Tone slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">Casual</span>
          <span className="text-violet-400 text-sm font-semibold">{toneLabel(data.tone)}</span>
          <span className="text-white/40 text-xs">Professional</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={data.tone}
          onChange={(e) => updateData({ tone: parseInt(e.target.value) })}
          className="w-full accent-violet-500 cursor-pointer"
        />
      </div>

      {/* Style chips */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">
          Style chips <span className="text-white/25">(pick up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => {
            const selected = (data.styles || []).includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  selected
                    ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
                    : 'border-white/[0.1] bg-white/[0.03] text-white/50 hover:border-white/30'
                )}
              >
                {selected && <IconCheck size={10} />}
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Live caption preview */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] min-h-[80px]">
        <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Live caption preview</p>
        {loadingPreview ? (
          <div className="space-y-2">
            <div className="h-3 bg-white/[0.06] rounded animate-pulse w-full" />
            <div className="h-3 bg-white/[0.06] rounded animate-pulse w-3/4" />
          </div>
        ) : previewCaption ? (
          <p className="text-white/70 text-sm leading-relaxed">{previewCaption}</p>
        ) : (
          <p className="text-white/20 text-sm italic">Adjust tone to see a live preview…</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(2)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(4)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
            Skip for now →
          </button>
          <button
            onClick={() => setStep(4)}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
