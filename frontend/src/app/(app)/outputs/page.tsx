'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { ImageIcon, RefreshCcw, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader, EmptyState } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  caption: string
  image_url?: string
  platform: string
  status: string
  hashtags?: string[]
  created_at: string
  approval_status?: string
  content_type?: string
}

const PLATFORM_FILTERS = ['all', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook']
const STATUS_FILTERS = ['all', 'draft', 'approved', 'scheduled']

export default function OutputsPage() {
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Post | null>(null)

  const query = new URLSearchParams({ limit: '50' })
  if (platform !== 'all') query.set('platform', platform)
  if (status !== 'all') query.set('status', status)

  const swrKey = `/api/posts?${query}`
  const { data } = useSWR(swrKey, (u: string) => apiCall<{ posts: Post[] }>(u), { revalidateOnFocus: false })
  const posts: Post[] = (data?.posts ?? []).filter((post) =>
    !search || post.caption?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageContainer className="max-w-[1100px] pb-20">
      <PageHeader title="Outputs" description={`${posts.length} creatives generated`} />

      <SectionCard title="Filters" subtitle="Find outputs quickly by platform, status, or keyword.">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outputs..."
              className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#111111]"
            />
          </div>
          {PLATFORM_FILTERS.map((p) => (
            <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
              {p === 'all' ? 'All Platforms' : p}
            </FilterPill>
          ))}
          {STATUS_FILTERS.map((s) => (
            <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === 'all' ? 'All Statuses' : s}
            </FilterPill>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6">
        {posts.length === 0 ? (
          <EmptyState title="No outputs yet" subtitle="Generate your first content to see it here." />
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {posts.map((post) => (
              <button key={post.id} onClick={() => setSelected(post)} className="app-card overflow-hidden text-left transition hover:border-[#111111]">
                <div className="aspect-square bg-[#F3F4F6]">
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt={post.caption || 'Generated output'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9CA3AF]"><ImageIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-sm text-[#111111]">{post.caption || 'Untitled output'}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge tone={post.status === 'approved' ? 'success' : 'neutral'}>{post.status}</StatusBadge>
                    <span className="text-xs text-[#6B7280] capitalize">{post.platform}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 flex-1">View</Button>
                    <Button size="sm" variant="secondary" className="h-8 flex-1"><RefreshCcw className="mr-1 h-3 w-3" />Regenerate</Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]">
                {selected.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.image_url} alt={selected.caption || 'Selected output'} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center text-[#9CA3AF]"><ImageIcon className="h-6 w-6" /></div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#6B7280]">Caption</p>
                  <p className="mt-1 text-sm text-[#111111]">{selected.caption}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs text-[#6B7280]">Version Selector</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['v1', 'v2', 'v3'].map((version) => (
                      <button key={version} className="rounded-lg border border-[#E5E7EB] py-2 text-sm text-[#111111]">{version}</button>
                    ))}
                  </div>
                </div>
                <Button className="w-full"><RefreshCcw className="mr-2 h-4 w-4" />Regenerate</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-150', active ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6]')}>
      {children}
    </button>
  )
}
