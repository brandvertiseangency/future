'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiUpload } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  label: string
  subLabel: string
  multiple?: boolean
  accept?: Record<string, string[]>
  currentUrls: string[]
  onUploaded: (urls: string[]) => void
}

function UploadZone({ label, subLabel, multiple = false, accept, currentUrls, onUploaded }: DropZoneProps) {
  const onDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await apiUpload('/api/assets/upload', formData) as { url: string }
          onUploaded([...currentUrls, res.url])
        } catch {
          toast.error(`Failed to upload ${file.name}`)
        }
      }
    },
    [currentUrls, onUploaded]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
  })

  return (
    <div className="space-y-3">
      <p className="text-white/60 text-sm font-medium">{label}</p>
      <div
        {...getRootProps()}
        className={cn(
          'border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-violet-500/40 bg-violet-500/[0.05]'
            : 'border-white/[0.12] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
        )}
      >
        <input {...getInputProps()} />
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
          <IconUpload size={18} className="text-white/50" />
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm">{isDragActive ? 'Drop here…' : subLabel}</p>
          <button className="text-violet-400 text-xs mt-1 hover:text-violet-300">Browse files</button>
        </div>
      </div>

      {currentUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {currentUrls.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/[0.03]">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconPhoto size={24} className="text-white/20" />
                </div>
              )}
              <button
                onClick={() => onUploaded(currentUrls.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition-colors"
              >
                <IconX size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StepUploads() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div>
        <span className="section-tag">Brand Assets</span>
        <h2 className="text-white font-semibold text-3xl tracking-tight">
          Upload your brand assets
        </h2>
        <p className="text-white/50 text-sm mt-2">
          These help AI generate content that looks uniquely yours.
        </p>
      </div>

      <UploadZone
        label="Logo"
        subLabel="SVG, PNG, or JPG — max 5MB"
        accept={{ 'image/*': ['.svg', '.png', '.jpg', '.jpeg'] }}
        currentUrls={data.logoUrl ? [data.logoUrl] : []}
        onUploaded={(urls) => updateData({ logoUrl: urls[urls.length - 1] })}
      />

      <UploadZone
        label="Product Images"
        subLabel="Up to 10 images — JPG, PNG, WebP"
        multiple
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
        currentUrls={data.productImageUrls}
        onUploaded={(urls) => updateData({ productImageUrls: urls })}
      />

      <UploadZone
        label="Brand References (optional)"
        subLabel="Mood board, inspiration images or PDFs"
        multiple
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] }}
        currentUrls={data.referenceUrls}
        onUploaded={(urls) => updateData({ referenceUrls: urls })}
      />
    </div>
  )
}
