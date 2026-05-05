'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { ImageIcon, Loader2, Sparkles, Package, ImagePlus, X, ExternalLink } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiCall, apiUpload, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { logUxEvent } from '@/lib/ux-events'
import { cn } from '@/lib/utils'

const PLATFORMS = ['instagram', 'linkedin', 'facebook', 'tiktok']
const RATIOS = ['1:1', '4:5', '9:16', '16:9'] as const
const QUALITIES = [
  { id: 'fast' as const, label: 'Fast', hint: 'Quicker, lighter detail' },
  { id: 'balanced' as const, label: 'Balanced', hint: 'Default quality' },
  { id: 'high' as const, label: 'High', hint: 'Richer detail (slower)' },
]

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
  const [brief, setBrief] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]>('1:1')
  const [imageQuality, setImageQuality] = useState<(typeof QUALITIES)[number]['id']>('balanced')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  const [uploadingRef, setUploadingRef] = useState(false)
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

  useEffect(() => {
    const q = searchParams.get('brief')
    if (q) setBrief((prev) => (prev.trim() ? prev : decodeURIComponent(q)))
  }, [searchParams])

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
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

  const generate = async () => {
    if (!brief.trim() || platforms.length === 0) {
      toast.error('Add a brief and at least one platform')
      return
    }
    setLoading(true)
    setStage('Analyzing brand...')
    setCompletedCount(0)
    setFailedPlatforms([])
    const generated: { caption?: string; image_url?: string; platform?: string }[] = []
    const failures: string[] = []
    const bodyBase = {
      contentType: 'post' as const,
      brief: brief.trim(),
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
      toast.success('Generation complete')
      if (failures.length) {
        toast.error(`Some platforms failed: ${failures.slice(0, 2).join(' | ')}`)
      }
      router.push('/outputs')
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
        description="Optional references, product lock-in, and output shape — separate from the content calendar."
      />
      <PageHeader
        title={<>Quick <span className="text-pull text-primary">generate</span></>}
        description="Idea-led creatives in one run. Use the content calendar when you want a planned month of posts."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[440px_1fr]">
        <SectionCard title="Setup" subtitle="Platform, format, quality, and visual anchors.">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Platforms</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    type="button"
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
                <Link
                  href="/assets"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  <Package className="h-3 w-3" />
                  Assets & products
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

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reference images (max 3)</label>
              <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                Upload a new image or pick from your library. Used to steer the visual; combined with your product selection.
              </p>
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
                  <div
                    key={`${url}-${idx}`}
                    className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted"
                  >
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

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Brief</label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                placeholder="Describe the scene, offer, mood, and any must-haves…"
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Credits left: <span className="font-medium text-foreground">{credits}</span>
            </div>
            <Button onClick={() => void generate()} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Preview" subtitle="Latest generated posts for this session.">
          {loading ? (
            <div className="min-h-[260px] space-y-3">
              <div className="flex items-center justify-center pt-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {stage}
              </div>
              <div className="mx-auto max-w-md rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Progress: <span className="font-medium text-foreground">{completedCount}</span> / {platforms.length} completed
                {failedPlatforms.length > 0 ? <p className="mt-1 text-destructive">Failed: {failedPlatforms.join(', ')}</p> : null}
              </div>
            </div>
          ) : preview.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-sm text-muted-foreground">
              <p>No output yet.</p>
              <p className="mt-1">Configure setup and click Generate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {preview.map((item, idx) => (
                <div key={`${item.platform}-${idx}`} className="app-card overflow-hidden">
                  <div className="aspect-[4/3] bg-muted">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="Generated output" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="mb-1 text-xs uppercase text-muted-foreground">{item.platform}</p>
                    <p className="line-clamp-2 text-sm text-foreground">{item.caption ?? 'No caption'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
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
