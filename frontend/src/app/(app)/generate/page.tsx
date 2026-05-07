'use client'

import { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import {
  ImageIcon,
  Loader2,
  Sparkles,
  Package,
  ImagePlus,
  X,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
  Wand2,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiCall, apiUpload, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer, PageHeader, SurfaceCard } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { logUxEvent } from '@/lib/ux-events'
import { cn } from '@/lib/utils'
import { displayCaption } from '@/lib/caption'

const PLATFORMS = ['instagram', 'linkedin', 'facebook', 'tiktok']
const RATIOS = ['1:1', '4:5', '9:16', '16:9'] as const
const QUALITIES = [
  { id: 'fast' as const, label: 'Fast', hint: 'Quicker, lighter detail' },
  { id: 'balanced' as const, label: 'Balanced', hint: 'Default quality' },
  { id: 'high' as const, label: 'High', hint: 'Richer detail (slower)' },
]

const CONTENT_FORMATS = [
  { id: 'post' as const, label: 'Feed post' },
  { id: 'story' as const, label: 'Story' },
  { id: 'carousel' as const, label: 'Carousel' },
  { id: 'reel' as const, label: 'Reel' },
]

const TONE_OPTIONS = ['Professional', 'Friendly', 'Bold', 'Playful'] as const
const PILLAR_PRESETS = ['Product quality', 'Customer trust', 'Innovation'] as const
const BRIEF_MAX = 1000

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Something went wrong'
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.message === 'string' && parsed.message.trim()) return parsed.message
    if (typeof parsed?.error === 'string' && parsed.error.trim()) return parsed.error
  } catch {
    // ignore parse errors
  }
  if (raw.includes('<!doctype html') || raw.includes('<html')) return 'Server returned an unexpected response. Please try again.'
  return raw
}

interface ProductRow {
  id: string
  name: string
  images?: string[]
}

interface AssetRow {
  id: string
  url: string
  type?: string
}

function GeneratePageInner() {
  const { mutate: globalMutate } = useSWRConfig()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [studioTab, setStudioTab] = useState<'configure' | 'inspiration'>('configure')
  const [brief, setBrief] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]>('1:1')
  const [contentFormat, setContentFormat] = useState<(typeof CONTENT_FORMATS)[number]['id']>('post')
  const [tone, setTone] = useState<(typeof TONE_OPTIONS)[number]>('Professional')
  const [pillars, setPillars] = useState<string[]>([])
  const [imageQuality, setImageQuality] = useState<(typeof QUALITIES)[number]['id']>('balanced')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  const [uploadingRef, setUploadingRef] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [sortPreview, setSortPreview] = useState<'newest' | 'oldest'>('newest')
  const refFileInput = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ caption?: string; image_url?: string; platform?: string }[]>([])
  const [stage, setStage] = useState('Idle')
  const [completedCount, setCompletedCount] = useState(0)
  const [failedPlatforms, setFailedPlatforms] = useState<string[]>([])

  const { data: creditsData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number }>(url), { revalidateOnFocus: false })
  const credits = creditsData?.balance ?? 0

  const { data: productsData } = useSWR('/api/brand-products', (url: string) => apiCall<{ products: ProductRow[] }>(url), {
    revalidateOnFocus: false,
  })
  const products = productsData?.products ?? []

  const { data: assetsData } = useSWR('/api/assets?limit=48', (url: string) => apiCall<{ assets: AssetRow[] }>(url), {
    revalidateOnFocus: false,
  })
  const imageAssets = (assetsData?.assets ?? []).filter((a) => a.url && (a.type === 'image' || !a.type || String(a.type).includes('image')))

  const sortedPreview = useMemo(() => {
    const copy = [...preview]
    if (sortPreview === 'oldest') copy.reverse()
    return copy
  }, [preview, sortPreview])

  useEffect(() => {
    const q = searchParams.get('brief')
    if (q) setBrief((prev) => (prev.trim() ? prev : decodeURIComponent(q)))
  }, [searchParams])

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const togglePillar = (p: string) => {
    setPillars((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const toggleReferenceUrl = (url: string) => {
    setReferenceUrls((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url)
      if (prev.length >= 3) {
        toast.message('Up to 3 reference images')
        return prev
      }
      return [...prev, url]
    })
  }

  const addReferenceUrl = (url: string) => {
    if (!url || !/^https:\/\//i.test(url)) return
    setReferenceUrls((prev) => {
      if (prev.includes(url)) return prev
      if (prev.length >= 3) {
        toast.message('Up to 3 reference images')
        return prev
      }
      return [...prev, url]
    })
  }

  const removeReferenceAt = (idx: number) => {
    setReferenceUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleRefUpload = async (files: FileList | null) => {
    if (!files?.length) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file')
      return
    }
    setUploadingRef(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = (await apiUpload('/api/brand-products/upload-image', fd, 60_000)) as { url?: string }
      if (data?.url) {
        addReferenceUrl(data.url)
        toast.success('Reference image added')
      } else toast.error('Upload did not return a URL')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingRef(false)
      if (refFileInput.current) refFileInput.current.value = ''
    }
  }

  const buildBriefPayload = () => {
    const core = brief.trim().slice(0, BRIEF_MAX)
    const pillarLine = pillars.length ? `Content pillars: ${pillars.join(', ')}.` : ''
    return [core, pillarLine].filter(Boolean).join('\n\n')
  }

  const generate = async () => {
    const payloadBrief = buildBriefPayload()
    if (payloadBrief.length < 8 || platforms.length === 0) {
      toast.error('Add an idea (8+ characters) and at least one platform')
      return
    }
    setLoading(true)
    setStage('Analyzing brand...')
    setCompletedCount(0)
    setFailedPlatforms([])
    const generated: { caption?: string; image_url?: string; platform?: string }[] = []
    const failures: string[] = []
    const bodyBase = {
      contentType: contentFormat,
      brief: payloadBrief,
      mood: tone,
      ratio,
      imageQuality,
      ...(selectedProductId ? { selectedProductId } : {}),
      ...(referenceUrls.length ? { referenceImageUrls: referenceUrls } : {}),
    }
    for (const platform of platforms) {
      try {
        setStage(`Writing prompts for ${platform}...`)
        const result = await apiCall<{ post: { caption?: string; image_url?: string; platform?: string } }>('/api/generate-content', {
          method: 'POST',
          body: JSON.stringify({ platform, ...bodyBase }),
          timeoutMs: AI_REQUEST_TIMEOUT_MS,
        })
        generated.push(result.post)
        logUxEvent('generate_platform_success', { platform })
        setCompletedCount((count) => count + 1)
        setStage(`Generated ${generated.length}/${platforms.length} platform outputs...`)
      } catch (error) {
        failures.push(`${platform}: ${parseApiError(error)}`)
        setFailedPlatforms((prev) => [...prev, platform])
        logUxEvent('generate_platform_failed', { platform, error: parseApiError(error) })
      }
    }
    setPreview(generated)
    setStage(`Completed: ${generated.length} succeeded, ${failures.length} failed`)
    setLoading(false)
    void globalMutate('/api/credits/balance')
    if (generated.length > 0) {
      logUxEvent('generate_completed', { selectedPlatforms: platforms.length, succeeded: generated.length, failed: failures.length })
      toast.success('Generation complete', {
        description: 'Preview updated below.',
        action: { label: 'View outputs', onClick: () => router.push('/outputs') },
      })
      if (failures.length) {
        toast.error(`Some platforms failed: ${failures.slice(0, 2).join(' | ')}`)
      }
    } else {
      logUxEvent('generate_failed_all', { selectedPlatforms: platforms.length })
      toast.error(failures[0] ?? 'Generation failed')
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="generate"
        title="AI is creating your creatives"
        description="Configure your idea, preview results here, then ship to Outputs or the calendar."
      />
      <PageHeader
        variant="hero"
        title={
          <span className="inline-flex items-center gap-2">
            <Wand2 className="h-7 w-7 text-primary md:h-8 md:w-8" />
            <span>
              Generate <span className="text-pull text-primary">studio</span>
            </span>
          </span>
        }
        description="Create on-brand content at scale. Your idea, our creativity."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[440px_1fr]">
        <div className="space-y-3">
          <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setStudioTab('configure')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                studioTab === 'configure' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Configure
            </button>
            <button
              type="button"
              onClick={() => setStudioTab('inspiration')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                studioTab === 'inspiration' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Inspiration
            </button>
          </div>

          {studioTab === 'inspiration' ? (
            <SectionCard className="app-card-elevated" title="Inspiration" subtitle="Jump to assets or the calendar for structured ideas.">
              <p className="text-sm text-muted-foreground">
                Pull references from your library, or start a full month from the content calendar when you need planned coverage.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/assets">
                  <Button variant="secondary" size="sm">
                    Open asset library
                  </Button>
                </Link>
                <Link href="/calendar/generate">
                  <Button variant="outline" size="sm">
                    Content calendar
                  </Button>
                </Link>
              </div>
            </SectionCard>
          ) : (
            <SectionCard className="app-card-elevated" title="Setup" subtitle="Idea, platforms, format, and tone.">
              <div className="space-y-5">
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-muted-foreground">What&apos;s your idea?</label>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {brief.length}/{BRIEF_MAX}
                    </span>
                  </div>
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value.slice(0, BRIEF_MAX))}
                    className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="Describe the post you want to create…"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => toast.message('Enhance with AI is coming soon', { description: 'For now, add more detail in your idea field.' })}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Enhance with AI
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Platform</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={cn(
                          'h-10 rounded-lg border text-sm capitalize transition-colors',
                          platforms.includes(platform)
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Format</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_FORMATS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setContentFormat(f.id)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                          contentFormat === f.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Aspect ratio</label>
                  <div className="flex flex-wrap gap-2">
                    {RATIOS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRatio(r)}
                        className={cn(
                          'min-h-9 min-w-[3.25rem] rounded-lg border px-2.5 text-xs font-medium transition-colors',
                          ratio === r ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tone of voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as (typeof TONE_OPTIONS)[number])}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Content pillars (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {PILLAR_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePillar(p)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          pillars.includes(p)
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reference (optional)</label>
                  <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">Upload up to 3 images to steer the visual.</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input ref={refFileInput} type="file" accept="image/*" className="hidden" onChange={(e) => void handleRefUpload(e.target.files)} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5"
                      disabled={uploadingRef || referenceUrls.length >= 3}
                      onClick={() => refFileInput.current?.click()}
                    >
                      {uploadingRef ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                      Upload
                    </Button>
                    {referenceUrls.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-background/90 text-foreground shadow"
                          onClick={() => removeReferenceAt(idx)}
                          aria-label="Remove reference"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {imageAssets.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">From library</p>
                      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                        {imageAssets.slice(0, 24).map((a) => {
                          const selected = referenceUrls.includes(a.url)
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleReferenceUrl(a.url)}
                              className={cn(
                                'relative h-12 w-12 overflow-hidden rounded-md border transition-colors',
                                selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40',
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={a.url} alt="" className="h-full w-full object-cover" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-sm font-medium text-foreground"
                >
                  Advanced settings
                  <ChevronDown className={cn('h-4 w-4 transition-transform', advancedOpen && 'rotate-180')} />
                </button>
                {advancedOpen ? (
                  <div className="space-y-4 border-t border-border pt-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Output quality</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {QUALITIES.map((q) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setImageQuality(q.id)}
                            className={cn(
                              'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                              imageQuality === q.id
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border text-muted-foreground hover:bg-muted',
                            )}
                          >
                            <span className="font-medium">{q.label}</span>
                            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{q.hint}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <label className="text-xs font-medium text-muted-foreground">Product (optional)</label>
                        <Link href="/assets" className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
                          <Package className="h-3 w-3" />
                          Assets
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </Link>
                      </div>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="">None — brand defaults only</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Credits left: <span className="font-medium text-foreground">{credits}</span>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <SurfaceCard className="app-card-elevated flex min-h-[320px] flex-col p-0 xl:min-h-[420px]">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-4 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preview</p>
                <p className="text-sm font-semibold text-foreground">
                  Preview ({preview.length}){' '}
                  <span className="ml-2 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Ready to generate
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => toast.message('Templates are coming soon', { description: 'Save presets will ship in a future update.' })}
                >
                  Save as template
                </Button>
                <Button type="button" size="sm" className="h-9 gap-1.5" onClick={() => void generate()} disabled={loading || studioTab !== 'configure'}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-border bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium',
                    layoutMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('list')}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium',
                    layoutMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <select
                value={sortPreview}
                onChange={(e) => setSortPreview(e.target.value as 'newest' | 'oldest')}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2 md:px-5">
            {loading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">{stage}</p>
                <p className="text-xs">
                  Progress: <span className="font-medium text-foreground">{completedCount}</span> / {platforms.length}
                </p>
              </div>
            ) : sortedPreview.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
                <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="max-w-md text-sm font-medium text-foreground">Your generated content will appear here.</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Fill in your idea and preferences on the left, then click Generate to create your content.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['On-brand content', 'AI-powered creativity', 'Ready to schedule'].map((t) => (
                    <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'gap-3',
                  layoutMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col',
                )}
              >
                {sortedPreview.map((item, idx) => (
                  <div
                    key={`${item.platform}-${idx}`}
                    className={cn(
                      'app-card-elevated overflow-hidden border border-border/80 shadow-[var(--shadow-card)]',
                      layoutMode === 'list' && 'flex flex-row',
                    )}
                  >
                    <div className={cn('bg-muted', layoutMode === 'list' ? 'h-28 w-28 shrink-0' : 'aspect-[4/5] sm:aspect-[4/3]')}>
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full min-h-[120px] items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 p-3">
                      <p className="mb-1 text-xs uppercase text-muted-foreground">{item.platform}</p>
                      <p className="line-clamp-3 text-sm text-foreground">{displayCaption(item.caption, 'No caption')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-border px-4 pb-4 pt-4 md:px-5">
            <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> Be specific for better results—audience, goal, key message, or angle.
                </p>
              </div>
              <Link href="/assets" className="shrink-0 text-xs font-semibold text-primary hover:underline">
                View examples
              </Link>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageContainer>
  )
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </PageContainer>
      }
    >
      <GeneratePageInner />
    </Suspense>
  )
}
