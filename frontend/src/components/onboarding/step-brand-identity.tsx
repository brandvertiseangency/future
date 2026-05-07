'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Globe, Phone, MapPin, Tag, X, Link2, Loader2 } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground/40 focus:outline-none'

const inputWithIcon =
  'w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground/40 focus:outline-none'

type SitePreviewExtracted = {
  tagline?: string
  telephone?: string
  address?: string
  sameAs?: string[]
  products?: { name: string; image?: string | null; description?: string }[]
  organization?: {
    name?: string
    url?: string
    logo?: string | null
    description?: string
    slogan?: string
  } | null
}

type SitePreview = {
  sourceUrl: string
  title: string
  description: string
  suggestedLogoUrl: string | null
  suggestedProductImageUrls: string[]
  extracted?: SitePreviewExtracted
  crawlPagesVisited?: string[]
  fetchedAt?: string
}

export function StepBrandIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [sitePreview, setSitePreview] = useState<SitePreview | null>(null)
  const [selectedProductImages, setSelectedProductImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!sitePreview) {
      setSelectedProductImages(new Set())
      return
    }
    const urls = sitePreview.suggestedProductImageUrls ?? []
    setSelectedProductImages(new Set(urls))
  }, [sitePreview?.fetchedAt, sitePreview?.sourceUrl])

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

  const toggleProductImage = (url: string) => {
    setSelectedProductImages((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const applySitePreview = () => {
    if (!sitePreview) return
    const ext = sitePreview.extracted
    const suggested = sitePreview.suggestedProductImageUrls ?? []
    const chosen = suggested.filter((u) => selectedProductImages.has(u))
    updateData({
      brandName: sitePreview.title || data.brandName,
      description: sitePreview.description || data.description,
      website: sitePreview.sourceUrl || data.website,
      logoUrl: sitePreview.suggestedLogoUrl || data.logoUrl,
      productImageUrls: suggested.length === 0 ? data.productImageUrls : chosen,
      tagline: ext?.tagline || data.tagline,
      phone: ext?.telephone || data.phone,
      address: ext?.address || data.address,
    })
    toast.success('Applied to your brief — tweak anything below')
    setSitePreview(null)
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
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 2"
        title="Brand identity and brief"
        description="Import signals from your site or fill manually — you always confirm before we use anything."
      />

      <div className="mt-6 space-y-5">
      <div className="rounded-xl border border-border bg-muted/30 p-4">
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
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Fetch brand signals
          </button>
        </div>
        {sitePreview ? (
          <div className="mt-4 space-y-4 rounded-xl border border-border bg-background/80 p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Review extracted brand DNA</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Toggle product reference shots, then apply. You can still edit every field below afterward.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{sitePreview.title || '—'}</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Tagline</p>
                <p className="text-foreground">{sitePreview.extracted?.tagline || '—'}</p>
              </div>
              <div className="sm:col-span-2 rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Description</p>
                <p className="line-clamp-4 text-muted-foreground">{sitePreview.description || '—'}</p>
              </div>
              {(sitePreview.extracted?.telephone || sitePreview.extracted?.address) && (
                <div className="sm:col-span-2 grid gap-2 sm:grid-cols-2">
                  {sitePreview.extracted?.telephone ? (
                    <div className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Phone</p>
                      <p className="text-foreground">{sitePreview.extracted.telephone}</p>
                    </div>
                  ) : null}
                  {sitePreview.extracted?.address ? (
                    <div className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Address</p>
                      <p className="text-foreground">{sitePreview.extracted.address}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            {sitePreview.suggestedProductImageUrls?.length ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Reference images
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {sitePreview.suggestedProductImageUrls.map((url) => {
                    const on = selectedProductImages.has(url)
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => toggleProductImage(url)}
                        className={cn(
                          'relative overflow-hidden rounded-lg border-2 text-left transition-colors',
                          on ? 'border-primary ring-2 ring-primary/25' : 'border-transparent opacity-80 hover:opacity-100',
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                        <span className="absolute bottom-1 right-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                          {on ? 'On' : 'Off'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
            {sitePreview.crawlPagesVisited && sitePreview.crawlPagesVisited.length > 1 ? (
              <p className="text-[10px] text-muted-foreground">
                Enriched from {sitePreview.crawlPagesVisited.length} pages (same site, capped crawl).
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applySitePreview}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Apply to brief
              </button>
              <button
                type="button"
                onClick={() => setSitePreview(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Dismiss
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

      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className={cn(
              'group flex h-14 w-14 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors',
              data.logoUrl ? 'border-border' : 'border-border hover:border-foreground/40 hover:bg-muted/40',
            )}
          >
            {data.logoUrl ? (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <X size={14} className="text-background" />
                </div>
              </div>
            ) : (
              <>
                <Upload size={15} className="text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="mt-0.5 text-[9px] text-muted-foreground">Logo</span>
              </>
            )}
          </button>
          {data.logoUrl && (
            <button
              type="button"
              onClick={() => updateData({ logoUrl: '' })}
              className="mt-1 w-full text-center text-[10px] text-muted-foreground transition-colors hover:text-destructive"
            >
              Remove
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="relative">
            <input
              className={inputClass}
              placeholder="Brand name *"
              maxLength={50}
              value={data.brandName}
              onChange={(e) => updateData({ brandName: e.target.value })}
            />
            <span className="absolute right-3 top-2.5 text-[11px] text-muted-foreground">{data.brandName.length}/50</span>
          </div>
          <div className="relative">
            <Tag size={14} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
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

      <div className="relative">
        <input
          className={inputClass}
          placeholder="One-line description * (e.g. We make sustainable sneakers for urban runners)"
          maxLength={120}
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
        />
        <span className="absolute right-3 top-2.5 text-[11px] text-muted-foreground">{data.description.length}/120</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="relative">
          <Globe size={14} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
          <input
            className={inputWithIcon}
            placeholder="Website (optional)"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
          />
        </div>
        <div className="relative">
          <Phone size={14} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
          <input
            className={inputWithIcon}
            placeholder="Phone (optional)"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
          />
        </div>
        <div className="relative sm:col-span-2">
          <MapPin size={14} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
          <input
            className={inputWithIcon}
            placeholder="Address / City (optional) — e.g. 123 Main St, Mumbai"
            value={data.address || data.city}
            onChange={(e) => updateData({ address: e.target.value, city: e.target.value })}
          />
        </div>
      </div>

      {data.brandName && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground">
            {data.logoUrl
              ? // eslint-disable-next-line @next/next/no-img-element
                <img src={data.logoUrl} alt="" className="h-full w-full object-cover" />
              : <span className="text-base font-bold text-background">{initials}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{data.brandName}</p>
            {data.tagline && <p className="mt-0.5 truncate text-xs italic text-foreground/85">{data.tagline}</p>}
            {data.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{data.description}</p>
            )}
            {data.website && <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">{data.website}</p>}
          </div>
        </div>
      )}
      </div>

      <StepFooter
        onBack={() => setStep(1)}
        onSkip={() => setStep(3)}
        onContinue={() => setStep(3)}
        continueDisabled={!canContinue}
      />
    </div>
  )
}
