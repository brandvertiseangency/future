'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useOnboardingStore, type VibeStyle } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { AIButton } from '@/components/ui/ai-button'
import { VoiceToolbar } from '@/components/onboarding/controls/voice-toolbar'

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
        <h2 className="text-[#111111] font-semibold text-2xl tracking-tight">Define your brand voice</h2>
        <p className="text-[#6B7280] text-sm mt-1">Pick voice controls that match your positioning and audience intent.</p>
      </div>

      <VoiceToolbar
        tone={data.tone}
        selectedStyles={data.vibeStyles || []}
        onToneChange={(tone) => updateData({ tone })}
        onToggleStyle={toggleVibe}
      />

      {/* AI Preview */}
      <div className="rounded-xl bg-[#F7F7F8] border border-[#E5E7EB] p-4">
        <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold mb-2">Caption preview</p>
        {loadingPreview ? (
          <div className="space-y-2">
            <div className="h-3 rounded bg-[#E5E7EB] animate-pulse w-full" />
            <div className="h-3 rounded bg-[#EFEFF1] animate-pulse w-3/4" />
          </div>
        ) : (
          <p className="text-[#111111] text-sm leading-relaxed italic">&ldquo;{previewCaption}&rdquo;</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(3)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(5)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(5)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
