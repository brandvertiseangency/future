'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function StepReferences() {
  const {
    data,
    addReferenceImage,
    removeReferenceImage,
    setExtractedStyleProfile,
    setStep,
  } = useOnboardingStore()

  const [analysing, setAnalysing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const remaining = 10 - (data.referenceImages || []).length
    const toProcess = acceptedFiles.slice(0, remaining)
    for (const file of toProcess) {
      try {
        const base64 = await fileToBase64(file)
        addReferenceImage({ url: base64, fileName: file.name, analysed: false })
      } catch { /* skip */ }
    }
  }, [data.referenceImages, addReferenceImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
  })

  const analyseAll = async () => {
    if ((data.referenceImages || []).length === 0) return
    setAnalysing(true)
    setAnalysisError('')
    try {
      const images = (data.referenceImages || []).map((img) => img.url)
      const { styleProfile } = await apiCall<{ styleProfile: ReturnType<typeof setExtractedStyleProfile> extends void ? never : Parameters<typeof setExtractedStyleProfile>[0] }>('/api/onboarding/vision/analyse-references', {
        method: 'POST',
        body: JSON.stringify({ images }),
      })
      setExtractedStyleProfile(styleProfile)
    } catch {
      setAnalysisError('Analysis failed. You can continue without it.')
    } finally {
      setAnalysing(false)
    }
  }

  const profile = data.extractedStyleProfile

  return (
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 9"
        title="Upload reference images"
        description="Drop competitor posts, mood boards, or inspiration. Vision AI will extract your visual style."
      />

      <div className="mt-6 space-y-5">
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isDragActive
              ? 'border-primary bg-primary/[0.06]'
              : 'border-border bg-muted/30 hover:border-border/70 hover:bg-muted/50',
          )}
        >
          <input {...getInputProps()} />
          <Upload size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Drop your images here' : 'Drop images or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP · Max 5MB · Up to 10 images</p>
        </div>

        {(data.referenceImages || []).length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {(data.referenceImages || []).map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.fileName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => removeReferenceImage(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
                {img.analysed && (
                  <div className="absolute bottom-1 right-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(data.referenceImages || []).length > 0 && !data.referenceAnalysisComplete && (
          <button
            type="button"
            onClick={analyseAll}
            disabled={analysing}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/[0.08] text-sm font-semibold text-primary transition-colors hover:bg-primary/[0.14] disabled:opacity-50"
          >
            {analysing ? (
              <><Loader2 size={14} className="animate-spin" /> Analysing with Vision AI...</>
            ) : (
              <><Sparkles size={14} /> Analyse visual style</>
            )}
          </button>
        )}

        {analysisError && (
          <p className="text-xs text-destructive">{analysisError}</p>
        )}

        {profile && (
          <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              <p className="text-sm font-semibold text-primary">Visual style extracted</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Aesthetic</p>
                <p className="text-sm font-medium text-foreground">{profile.dominantAesthetic}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Photography</p>
                <p className="text-sm font-medium text-foreground">{profile.photographyStyle?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Typography</p>
                <p className="text-sm font-medium text-foreground">{profile.fontMoodDetected?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Layout</p>
                <p className="text-sm font-medium text-foreground">{profile.layoutStyle?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {(profile.extractedColors || []).length > 0 && (
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Extracted colours</p>
                <div className="flex gap-2">
                  {profile.extractedColors.map((hex, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="h-7 w-7 rounded-md border border-border" style={{ background: hex }} />
                      <p className="font-mono text-[9px] text-muted-foreground">{hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(profile.moodKeywords || []).length > 0 && (
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Mood keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.moodKeywords.map((kw, i) => (
                    <span key={i} className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <StepFooter
        onBack={() => setStep(8)}
        onSkip={() => setStep(10)}
        onContinue={() => setStep(10)}
      />
    </div>
  )
}
