'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle2, Loader2, ImageIcon, Sparkles } from 'lucide-react'
import { useOnboardingStore, type ReferenceImage } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

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
    } catch (err) {
      setAnalysisError('Analysis failed. You can continue without it.')
    } finally {
      setAnalysing(false)
    }
  }

  const profile = data.extractedStyleProfile

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Upload reference images</h2>
        <p className="text-white/40 text-sm mt-2">
          Drop competitor posts, mood boards, or inspiration. Our Vision AI will extract your visual style.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-[var(--ai-color)] bg-[var(--ai-color)]/[0.06]'
            : 'border-white/[0.12] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
        )}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-3 text-white/30" />
        <p className="text-white/60 text-sm font-medium">
          {isDragActive ? 'Drop your images here' : 'Drop images or click to browse'}
        </p>
        <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP · Max 5MB per image · Up to 10 images</p>
      </div>

      {/* Image grid */}
      {(data.referenceImages || []).length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {(data.referenceImages || []).map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removeReferenceImage(i)}
                  className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white"
                >
                  <X size={14} />
                </button>
              </div>
              {img.analysed && (
                <div className="absolute bottom-1 right-1">
                  <CheckCircle2 size={16} className="text-[var(--ai-color)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Analyse button */}
      {(data.referenceImages || []).length > 0 && !data.referenceAnalysisComplete && (
        <button
          onClick={analyseAll}
          disabled={analysing}
          className="w-full py-3.5 rounded-xl border border-[var(--ai-border)]/50 bg-[var(--ai-color)]/[0.08] text-[var(--ai-color)] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--ai-color)]/[0.14] transition-all disabled:opacity-50"
        >
          {analysing ? (
            <><Loader2 size={16} className="animate-spin" /> Analysing with Vision AI...</>
          ) : (
            <><Sparkles size={16} /> Analyse visual style</>
          )}
        </button>
      )}

      {analysisError && (
        <p className="text-red-400 text-sm">{analysisError}</p>
      )}

      {/* Style profile result */}
      {profile && (
        <div className="rounded-2xl border border-[var(--ai-border)]/40 bg-[var(--ai-color)]/[0.05] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--ai-color)]" />
            <p className="text-[var(--ai-color)] text-sm font-semibold">Visual style extracted</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Aesthetic</p>
              <p className="text-white text-sm font-medium">{profile.dominantAesthetic}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Photography</p>
              <p className="text-white text-sm font-medium">{profile.photographyStyle?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Typography</p>
              <p className="text-white text-sm font-medium">{profile.fontMoodDetected?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Layout</p>
              <p className="text-white text-sm font-medium">{profile.layoutStyle?.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {(profile.extractedColors || []).length > 0 && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Extracted colours</p>
              <div className="flex gap-2">
                {profile.extractedColors.map((hex, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg border border-white/20" style={{ background: hex }} />
                    <p className="text-[9px] text-white/30 font-mono">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile.moodKeywords || []).length > 0 && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Mood keywords</p>
              <div className="flex flex-wrap gap-2">
                {profile.moodKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/60 text-xs">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(8)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(10)} className="text-white/30 hover:text-white/60 text-sm transition-colors">Skip →</button>
          <AIButton onClick={() => setStep(10)} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
