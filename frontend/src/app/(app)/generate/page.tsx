'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiCall, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { logUxEvent } from '@/lib/ux-events'

const PLATFORMS = ['instagram', 'linkedin', 'facebook', 'tiktok']

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

export default function GeneratePage() {
  const { mutate: globalMutate } = useSWRConfig()
  const router = useRouter()
  const [brief, setBrief] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ caption?: string; image_url?: string; platform?: string }[]>([])
  const [stage, setStage] = useState('Idle')
  const [completedCount, setCompletedCount] = useState(0)
  const [failedPlatforms, setFailedPlatforms] = useState<string[]>([])

  const { data: creditsData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number }>(url), { revalidateOnFocus: false })
  const credits = creditsData?.balance ?? 0

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform])
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
    for (const platform of platforms) {
      try {
        setStage(`Writing prompts for ${platform}...`)
        const result = await apiCall<{ post: { caption?: string; image_url?: string; platform?: string } }>('/api/generate-content', {
          method: 'POST',
          body: JSON.stringify({ platform, contentType: 'post', brief }),
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
      // This route generates posts directly, not calendar jobs.
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
        description="The system analyzes your brand context, writes prompts, and generates visuals you can refine."
      />
      <PageHeader
        title={<>Generate <span className="text-pull text-primary">creatives</span></>}
        description="Create content aligned to your brand style and audience."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <SectionCard title="Generation Setup" subtitle="Choose platform and describe what to create.">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Platforms</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    type="button"
                    className={`h-10 rounded-lg border text-sm capitalize transition-colors ${platforms.includes(platform) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Brief</label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                placeholder="Describe what you want to generate..."
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Credits left: <span className="font-medium text-foreground">{credits}</span>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate</>}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Preview" subtitle="Latest generated posts.">
          {loading ? (
            <div className="min-h-[260px] space-y-3">
              <div className="flex items-center justify-center pt-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {stage}
              </div>
              <div className="mx-auto max-w-md rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Progress: <span className="font-medium text-foreground">{completedCount}</span> / {platforms.length} completed
                {failedPlatforms.length > 0 ? (
                  <p className="mt-1 text-destructive">Failed: {failedPlatforms.join(', ')}</p>
                ) : null}
              </div>
            </div>
          ) : preview.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-sm text-muted-foreground">
              <p>No output yet.</p>
              <p className="mt-1">Add a brief and click Generate to begin.</p>
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
                      <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
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
