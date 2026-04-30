'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'

const PLATFORMS = ['instagram', 'linkedin', 'facebook', 'tiktok']

export default function GeneratePage() {
  const router = useRouter()
  const [brief, setBrief] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ caption?: string; image_url?: string; platform?: string }[]>([])

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
    const generated: { caption?: string; image_url?: string; platform?: string }[] = []
    for (const platform of platforms) {
      try {
        const result = await apiCall<{ post: { caption?: string; image_url?: string; platform?: string } }>('/api/generate-content', {
          method: 'POST',
          body: JSON.stringify({ platform, contentType: 'post', brief }),
        })
        generated.push(result.post)
      } catch {
        // continue
      }
    }
    setPreview(generated)
    setLoading(false)
    if (generated.length > 0) {
      toast.success('Generation complete')
      router.push('/generate/queue')
    } else {
      toast.error('Generation failed')
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Generate Creatives" description="Create content aligned to your brand style." />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <SectionCard title="Generation Setup" subtitle="Choose platform and describe what to create.">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Platforms</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`h-10 rounded-lg border text-sm capitalize ${platforms.includes(platform) ? 'border-[#111111] bg-[#F3F4F6] text-[#111111]' : 'border-[#E5E7EB] text-[#6B7280]'}`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Brief</label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="min-h-28 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#111111]"
                placeholder="Describe what you want to generate..."
              />
            </div>
            <p className="text-xs text-[#6B7280]">Credits left: {credits}</p>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate</>}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Preview" subtitle="Latest generated posts.">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-[#6B7280]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </div>
          ) : preview.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-[#6B7280]">No output yet</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {preview.map((item, idx) => (
                <div key={`${item.platform}-${idx}`} className="app-card overflow-hidden">
                  <div className="aspect-[4/3] bg-[#F3F4F6]">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="Generated output" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#9CA3AF]"><ImageIcon className="h-5 w-5" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="mb-1 text-xs uppercase text-[#6B7280]">{item.platform}</p>
                    <p className="line-clamp-2 text-sm text-[#111111]">{item.caption ?? 'No caption'}</p>
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
