'use client'

import { CalendarDays, ImageIcon, Sparkles, WandSparkles } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => apiCall<Record<string, unknown>>(url)

export default function DashboardPage() {
  const { data: brandData } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', fetcher, { revalidateOnFocus: false })
  const { data: statsData } = useSWR('/api/posts/stats', fetcher, { revalidateOnFocus: false })
  const { data: scheduledData } = useSWR('/api/posts/scheduled?week=current', fetcher, { revalidateOnFocus: false })
  const { data: outputsData } = useSWR('/api/posts?limit=4', fetcher, { revalidateOnFocus: false })

  const brand = (brandData as { brand?: { name?: string } })?.brand
  const credits = (creditsData as { balance?: number })?.balance ?? 0
  const totalPosts = (statsData as { total?: number })?.total ?? 0
  const scheduledPosts = ((scheduledData as { posts?: unknown[] })?.posts ?? []).length
  const postsLeft = Math.max(0, 30 - totalPosts)
  const reelsLeft = Math.max(0, 10 - Math.floor(totalPosts / 3))
  const recentOutputs = ((outputsData as { posts?: { id: string; caption?: string; image_url?: string; created_at?: string }[] })?.posts ?? []).slice(0, 4)
  const brandName = brand?.name ?? 'My Brand'

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Dashboard" description={`Welcome back. Here's what's happening for ${brandName}.`} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Posts Remaining" value={postsLeft} />
        <StatCard label="Reels Remaining" value={reelsLeft} />
        <StatCard label="Credits Left" value={credits} />
        <StatCard label="Active Brand" value={brandName} />
      </div>

      <SectionCard title="Quick Actions" subtitle="Create your next output in one click.">
        <div className="flex flex-wrap gap-3">
          <Link href="/generate">
            <Button className="h-10"><WandSparkles className="mr-2 h-4 w-4" />Generate Content</Button>
          </Link>
          <Link href="/brand">
            <Button variant="secondary" className="h-10">Create Brand</Button>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Recent Outputs" subtitle="Latest generated creatives.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentOutputs.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
              No outputs yet. Start from Generate Content.
            </div>
          ) : (
            recentOutputs.map((output) => (
              <div key={output.id} className="app-card overflow-hidden">
                <div className="aspect-[4/3] bg-[#F3F4F6]">
                  {output.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={output.image_url} alt={output.caption ?? 'Output image'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9CA3AF]"><ImageIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm text-[#111111]">{output.caption ?? 'Untitled output'}</p>
                  <p className="mt-2 text-xs text-[#6B7280]">{output.created_at ? new Date(output.created_at).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Activity" subtitle="Weekly progress">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#6B7280]">Scheduled this week</span>
          <span className="font-medium text-[#111111]">{scheduledPosts}</span>
        </div>
        <div className="h-2 rounded-full bg-[#EFEFF1]">
          <div className="h-2 rounded-full bg-[#111111]" style={{ width: `${Math.min((scheduledPosts / 10) * 100, 100)}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[#6B7280]">
          <CalendarDays className="h-4 w-4" />
          <Sparkles className="h-4 w-4" />
          Keep approving content to increase publishing momentum.
        </div>
      </SectionCard>
    </PageContainer>
  )
}
