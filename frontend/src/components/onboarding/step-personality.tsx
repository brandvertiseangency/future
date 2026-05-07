'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useOnboardingStore, type VibeStyle } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { VoiceToolbar } from '@/components/onboarding/controls/voice-toolbar'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

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
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 4"
        title="Define your brand voice"
        description="Pick voice controls that match your positioning and audience intent."
      />

      <div className="mt-6 space-y-6">
        <VoiceToolbar
          tone={data.tone}
          selectedStyles={data.vibeStyles || []}
          onToneChange={(tone) => updateData({ tone })}
          onToggleStyle={toggleVibe}
        />

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Caption preview
          </p>
          {loadingPreview ? (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-border" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-border/70" />
            </div>
          ) : (
            <p className="text-sm italic leading-relaxed text-foreground">&ldquo;{previewCaption}&rdquo;</p>
          )}
        </div>
      </div>

      <StepFooter
        onBack={() => setStep(3)}
        onSkip={() => setStep(5)}
        onContinue={() => setStep(5)}
      />
    </div>
  )
}
