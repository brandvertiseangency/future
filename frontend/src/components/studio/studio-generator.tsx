'use client'

import { useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import {
  Sparkles,
  Loader2,
  ImagePlus,
  X,
  ChevronDown,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { apiCall, apiUpload, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { displayCaption } from '@/lib/caption'
import { PageContainer } from '@/components/ui/page-primitives'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettingField =
  | { type: 'select'; key: string; label: string; options: { value: string; label: string }[] }
  | { type: 'toggle'; key: string; label: string; hint?: string }
  | { type: 'radio'; key: string; label: string; options: { value: string; label: string }[] }

export interface StudioConfig {
  type: string
  label: string
  description: string
  icon: LucideIcon
  accentColor: string
  settingFields: SettingField[]
}

const TONE_OPTIONS = ['Professional', 'Friendly', 'Bold', 'Playful', 'Minimal'] as const
const PILLAR_PRESETS = ['Product Quality', 'Customer Trust', 'Innovation', 'Brand Story'] as const
const QUALITY_OPTIONS = [
  { id: 'fast', label: 'Fast', hint: 'Quick preview' },
  { id: 'balanced', label: 'Balanced', hint: 'Default' },
  { id: 'high', label: 'High', hint: 'Richer detail' },
]
const BRIEF_MAX = 1000

interface ProductRow { id: string; name: string }
interface AssetRow { id: string; url: string; type?: string }

// ─── Component ────────────────────────────────────────────────────────────────

export function StudioGenerator({ config }: { config: StudioConfig }) {
  const { mutate: globalMutate } = useSWRConfig()
  const refFileInput = useRef<HTMLInputElement>(null)
  const Icon = config.icon

  const [brief, setBrief] = useState('')
  const [tone, setTone] = useState<string>('Professional')
  const [pillars, setPillars] = useState<string[]>([])
  const [imageQuality, setImageQuality] = useState<string>('balanced')
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  const [uploadingRef, setUploadingRef] = useState(false)
  const [includeProduct, setIncludeProduct] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [settings, setSettings] = useState<Record<string, string | boolean>>({})
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ caption?: string; image_url?: string }[]>([])
  const [stage, setStage] = useState('')

  const { data: creditsData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number; plan?: string }>(url), { revalidateOnFocus: false })
  const credits = creditsData?.balance ?? 0
  const isOutOfCredits = credits === 0

  const { data: productsData } = useSWR('/api/brand-products', (url: string) => apiCall<{ products: ProductRow[] }>(url), { revalidateOnFocus: false })
  const products = productsData?.products ?? []

  const { data: assetsData } = useSWR('/api/assets?limit=24', (url: string) => apiCall<{ assets: AssetRow[] }>(url), { revalidateOnFocus: false })
  const imageAssets = (assetsData?.assets ?? []).filter((a) => a.url)

  const setSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const togglePillar = (p: string) => {
    setPillars((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  const addReferenceUrl = (url: string) => {
    if (!url) return
    setReferenceUrls((prev) => {
      if (prev.includes(url)) return prev
      if (prev.length >= 3) { toast.message('Up to 3 reference images'); return prev }
      return [...prev, url]
    })
  }

  const toggleReferenceUrl = (url: string) => {
    setReferenceUrls((prev) => prev.includes(url) ? prev.filter((u) => u !== url) : (prev.length >= 3 ? (toast.message('Up to 3'), prev) : [...prev, url]))
  }

  const handleRefUpload = async (files: FileList | null) => {
    if (!files?.length) return
    const file = files[0]
    if (!file.type.startsWith('image/')) { toast.error('Choose an image file'); return }
    setUploadingRef(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const data = await apiUpload('/api/brand-products/upload-image', fd, 60_000) as { url?: string }
      if (data?.url) { addReferenceUrl(data.url); toast.success('Reference image added') }
      else toast.error('Upload did not return a URL')
    } catch { toast.error('Upload failed') } finally {
      setUploadingRef(false)
      if (refFileInput.current) refFileInput.current.value = ''
    }
  }

  const generate = async () => {
    if (brief.trim().length < 8) { toast.error('Add a brief (8+ characters)'); return }
    setLoading(true)
    setStage(`Generating ${config.label}…`)
    try {
      const body = {
        studioType: config.type,
        brief: brief.trim(),
        tone,
        imageQuality,
        pillars,
        settings,
        ...(includeProduct && selectedProductId ? { selectedProductId } : {}),
        ...(referenceUrls.length ? { referenceImageUrls: referenceUrls } : {}),
      }
      const result = await apiCall<{ post: { caption?: string; image_url?: string } }>('/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ platform: 'instagram', ...body }),
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      })
      setPreview((prev) => [result.post, ...prev])
      toast.success('Generated!')
      void globalMutate('/api/credits/balance')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
      setStage('')
    }
  }

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white', config.accentColor)}>
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{config.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[440px_1fr]">
        {/* ── Left: Configure ── */}
        <div className="space-y-4">
          <section className="app-card-elevated p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Brief</h2>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Describe your request</label>
                <span className="text-[10px] text-muted-foreground tabular-nums">{brief.length}/{BRIEF_MAX}</span>
              </div>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value.slice(0, BRIEF_MAX))}
                rows={4}
                placeholder={`Describe what you want to create for ${config.label.toLowerCase()}…`}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Type-specific settings */}
            {config.settingFields.map((field) => {
              if (field.type === 'select') {
                return (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</label>
                    <select
                      value={String(settings[field.key] ?? field.options[0]?.value ?? '')}
                      onChange={(e) => setSetting(field.key, e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                )
              }
              if (field.type === 'radio') {
                return (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</label>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((o) => {
                        const active = (settings[field.key] ?? field.options[0]?.value) === o.value
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setSetting(field.key, o.value)}
                            className={cn(
                              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                              active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted',
                            )}
                          >
                            {o.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              if (field.type === 'toggle') {
                const val = Boolean(settings[field.key] ?? false)
                return (
                  <div key={field.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{field.label}</p>
                      {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                    </div>
                    <button type="button" onClick={() => setSetting(field.key, !val)} className={cn('transition-colors', val ? 'text-primary' : 'text-muted-foreground')}>
                      {val ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                )
              }
              return null
            })}

            {/* Tone */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tone of Voice</label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors', tone === t ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Content pillars */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Content Pillars <span className="normal-case font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2">
                {PILLAR_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePillar(p)}
                    className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', pillars.includes(p) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference images */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reference Images <span className="normal-case font-normal">(optional, up to 3)</span></label>
              <input ref={refFileInput} type="file" accept="image/*" className="hidden" onChange={(e) => void handleRefUpload(e.target.files)} />
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploadingRef || referenceUrls.length >= 3} onClick={() => refFileInput.current?.click()}>
                  {uploadingRef ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  Upload
                </Button>
                {referenceUrls.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setReferenceUrls((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-background/90 text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {imageAssets.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">From library</p>
                  <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                    {imageAssets.slice(0, 18).map((a) => (
                      <button key={a.id} type="button" onClick={() => toggleReferenceUrl(a.url)} className={cn('relative h-11 w-11 overflow-hidden rounded-md border transition-colors', referenceUrls.includes(a.url) ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40')}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced */}
            <button type="button" onClick={() => setAdvancedOpen((o) => !o)} className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
              Advanced Settings
              <ChevronDown className={cn('h-4 w-4 transition-transform', advancedOpen && 'rotate-180')} />
            </button>
            {advancedOpen && (
              <div className="space-y-4 rounded-lg border border-border p-4">
                {/* Quality */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Output Quality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUALITY_OPTIONS.map((q) => (
                      <button key={q.id} type="button" onClick={() => setImageQuality(q.id)} className={cn('rounded-lg border px-2 py-2 text-left text-sm transition-colors', imageQuality === q.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}>
                        <span className="font-medium">{q.label}</span>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{q.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Product image */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Include Product Image</p>
                      <p className="text-xs text-muted-foreground">Not applicable for service-based brands</p>
                    </div>
                    <button type="button" onClick={() => setIncludeProduct((v) => !v)} className={cn('transition-colors', includeProduct ? 'text-primary' : 'text-muted-foreground')}>
                      {includeProduct ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                  {includeProduct && products.length > 0 && (
                    <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
                      <option value="">Select a product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Credits info */}
            {isOutOfCredits ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <p className="text-xs font-semibold text-destructive">No credits remaining</p>
                <Link href="/pricing" className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline">
                  Upgrade plan <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Credits available: <span className="font-semibold text-foreground">{credits}</span></p>
            )}
          </section>

          {/* Generate button */}
          <Button onClick={generate} disabled={loading || isOutOfCredits} className="h-11 w-full gap-2 text-base" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{stage || 'Generating…'}</> : <><Sparkles className="h-4 w-4" />Generate {config.label}</>}
          </Button>
        </div>

        {/* ── Right: Preview ── */}
        <div className="app-card-elevated min-h-[400px] flex flex-col p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Preview</p>
              <p className="text-sm font-semibold text-foreground">Generated Output ({preview.length})</p>
            </div>
            <Button variant="outline" size="sm" onClick={generate} disabled={loading || isOutOfCredits}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
            {loading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <div className="absolute inset-0 animate-pulse rounded-2xl border-2 border-primary/30" />
                </div>
                <p className="text-sm font-medium text-foreground">{stage}</p>
              </div>
            ) : preview.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/10 py-16 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Your {config.label} will appear here</p>
                  <p className="mt-1 text-xs text-muted-foreground">Fill in the brief on the left and click Generate.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {preview.map((item, i) => (
                  <div key={i} className="app-card-elevated overflow-hidden border border-border/80">
                    <div className="aspect-video w-full bg-muted">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/30">
                          <ImageIcon size={32} />
                        </div>
                      )}
                    </div>
                    {item.caption && (
                      <div className="p-3">
                        <p className="line-clamp-3 text-xs text-muted-foreground">{displayCaption(item.caption, '')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
