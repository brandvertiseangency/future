'use client'

import { useRef, useState } from 'react'
import { Upload, Globe, Phone, MapPin, Tag, X, Link2, Loader2 } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'

const inputClass =
  'w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111111] placeholder:text-[#9CA3AF] text-sm focus:outline-none focus:border-[#111111]/40 transition-all duration-200'

const inputWithIcon =
  'w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-[#111111] placeholder:text-[#9CA3AF] text-sm focus:outline-none focus:border-[#111111]/40 transition-all duration-200'

type SitePreview = {
  sourceUrl: string
  title: string
  description: string
  suggestedLogoUrl: string | null
  suggestedProductImageUrls: string[]
}

export function StepBrandIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [sitePreview, setSitePreview] = useState<SitePreview | null>(null)

  const initials = data.brandName
    ? data.brandName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const canContinue = data.brandName.trim() && data.description.trim()

  const fetchSitePreview = async () => {
    if (!importUrl.trim()) {
      toast.error('Enter your website URL first')
      return
    }
    setImportLoading(true)
    setSitePreview(null)
    try {
      const res = await apiCall<{ preview: SitePreview }>('/api/brands/import-site-preview', {
        method: 'POST',
        body: JSON.stringify({ url: importUrl.trim() }),
      })
      setSitePreview(res.preview)
      toast.success('Fetched — review and apply, or edit manually')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not fetch site')
    } finally {
      setImportLoading(false)
    }
  }

  const applySitePreview = () => {
    if (!sitePreview) return
    updateData({
      brandName: sitePreview.title || data.brandName,
      description: sitePreview.description || data.description,
      website: sitePreview.sourceUrl || data.website,
      logoUrl: sitePreview.suggestedLogoUrl || data.logoUrl,
      productImageUrls: sitePreview.suggestedProductImageUrls?.length
        ? sitePreview.suggestedProductImageUrls
        : data.productImageUrls,
    })
    toast.success('Applied to your brief — tweak anything below')
  }

  const briefSnippets = [
    'Premium D2C brand for design-conscious millennials.',
    'Local service business focused on trust and speed.',
    'Heritage craft meets modern minimal packaging.',
  ]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => updateData({ logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-foreground font-semibold text-2xl tracking-tight">Brand identity and brief</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Import signals from your site <span className="text-pull text-primary">or</span> fill manually — you always confirm before we use anything.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link2 size={14} className="text-primary" />
              Import from website
            </label>
            <input
              className={inputClass}
              placeholder="https://yourbrand.com"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={fetchSitePreview}
            disabled={importLoading}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Fetch brand signals
          </button>
        </div>
        {sitePreview ? (
          <div className="mt-4 space-y-3 rounded-xl border border-border bg-background/80 p-4 text-sm">
            <p className="font-medium text-foreground">{sitePreview.title}</p>
            <p className="line-clamp-3 text-muted-foreground">{sitePreview.description}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applySitePreview}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Apply to form below
              </button>
              <button type="button" onClick={() => setSitePreview(null)} className="text-xs text-muted-foreground underline">
                Dismiss preview
              </button>
            </div>
          </div>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Quick brief starters (tap to use, then edit):
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {briefSnippets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => updateData({ description: t })}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-left text-[11px] text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Logo upload + brand name row */}
      <div className="flex items-start gap-4">
        {/* Logo uploader */}
        <div className="flex-shrink-0">
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            onClick={() => logoInputRef.current?.click()}
            className={cn(
              'w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all group overflow-hidden',
              data.logoUrl
                ? 'border-white/20'
                : 'border-[#D1D5DB] hover:border-[#9CA3AF] hover:bg-[#F7F7F8]'
            )}
          >
            {data.logoUrl ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <X size={14} className="text-white" />
                </div>
              </div>
            ) : (
              <>
                <Upload size={16} className="text-[#6B7280] group-hover:text-[#111111] transition-colors" />
                <span className="text-[9px] text-[#9CA3AF] mt-1">Logo</span>
              </>
            )}
          </button>
          {data.logoUrl && (
            <button onClick={() => updateData({ logoUrl: '' })} className="text-[10px] text-[#9CA3AF] hover:text-red-500 mt-1 w-full text-center transition-colors">
              Remove
            </button>
          )}
        </div>

        {/* Brand name + tagline */}
        <div className="flex-1 space-y-3">
          <div className="relative">
            <input
              className={inputClass}
              placeholder="Brand name *"
              maxLength={50}
              value={data.brandName}
              onChange={(e) => updateData({ brandName: e.target.value })}
            />
            <span className="absolute right-3 top-3 text-xs text-[#9CA3AF]">{data.brandName.length}/50</span>
          </div>
          <div className="relative">
            <Tag size={14} className="absolute left-3.5 top-3.5 text-[#9CA3AF] pointer-events-none" />
            <input
              className={inputWithIcon}
              placeholder="Tagline (optional) — e.g. Wear your story"
              maxLength={80}
              value={data.tagline}
              onChange={(e) => updateData({ tagline: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="relative">
        <input
          className={inputClass}
          placeholder="One-line description * (e.g. We make sustainable sneakers for urban runners)"
          maxLength={120}
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
        />
        <span className="absolute right-3 top-3 text-xs text-[#9CA3AF]">{data.description.length}/120</span>
      </div>

      {/* Contact & location row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Globe size={14} className="absolute left-3.5 top-3.5 text-[#9CA3AF] pointer-events-none" />
          <input
            className={inputWithIcon}
            placeholder="Website (optional)"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
          />
        </div>
        <div className="relative">
          <Phone size={14} className="absolute left-3.5 top-3.5 text-[#9CA3AF] pointer-events-none" />
          <input
            className={inputWithIcon}
            placeholder="Phone (optional)"
            value={(data as unknown as { phone: string }).phone ?? ''}
            onChange={(e) => updateData({ phone: e.target.value } as never)}
          />
        </div>
        <div className="relative col-span-2">
          <MapPin size={14} className="absolute left-3.5 top-3.5 text-[#9CA3AF] pointer-events-none" />
          <input
            className={inputWithIcon}
            placeholder="Address / City (optional) — e.g. 123 Main St, Mumbai"
            value={(data as unknown as { address: string }).address ?? data.city ?? ''}
            onChange={(e) => updateData({ address: e.target.value, city: e.target.value } as never)}
          />
        </div>
      </div>

      {/* Live preview */}
      {data.brandName && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F7F7F8] border border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#111111]">
            {data.logoUrl
              ? <img src={data.logoUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-lg">{initials}</span>
            }
          </div>
          <div>
            <p className="text-[#111111] font-semibold text-sm">{data.brandName}</p>
            {data.tagline && <p className="text-[#111111] text-xs mt-0.5 italic">{data.tagline}</p>}
            {data.description && (
              <p className="text-[#6B7280] text-xs mt-0.5 line-clamp-1">{data.description}</p>
            )}
            {data.website && <p className="text-[#9CA3AF] text-[10px] mt-0.5">{data.website}</p>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(1)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(3)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">
            Skip for now →
          </button>
          <AIButton
            onClick={() => setStep(3)}
            disabled={!canContinue}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
