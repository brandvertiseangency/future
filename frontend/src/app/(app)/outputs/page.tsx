'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { Download, ImageIcon, RefreshCcw, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader, EmptyState, NextStepCard } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { getEffectivePostStatus, getPostStatusHint, getPostStatusTone } from '@/lib/post-status'
import { logUxEvent } from '@/lib/ux-events'

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
  const router = useRouter()
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<Post | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement | null>(null)
  const regeneratePost = async (postId: string) => {
    setRegeneratingId(postId)
    try {
      await apiCall(`/api/posts/${postId}/regenerate`, {
        method: 'POST',
        body: JSON.stringify({ feedback: 'Regenerate with improved composition' }),
      })
      toast.success('Regeneration started')
    } catch {
      toast.error('Failed to regenerate')
    } finally {
      setRegeneratingId(null)
    }
  }


  const query = new URLSearchParams({ limit: '50' })
  if (platform !== 'all') query.set('platform', platform)
  if (status !== 'all') query.set('status', status)

  const swrKey = `/api/posts?${query}`
  const { data, error, isLoading } = useSWR(swrKey, (u: string) => apiCall<{ posts: Post[] }>(u), { revalidateOnFocus: false })
  const posts: Post[] = (data?.posts ?? [])
    .filter((post) => !search || post.caption?.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key.toLowerCase() === 's' && selectedIds.length > 0) {
        event.preventDefault()
        router.push(`/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}`)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, selectedIds])

  return (
    <PageContainer className="max-w-[1100px] pb-20">
      <PageIntroModal
        pageKey="outputs"
        title="View, refine, and finalize your creatives"
        description="Use quick actions, compare versions, and schedule the best results."
      />
      <PageHeader title={<>Outputs <span className="text-highlight">Library</span></>} description={`${posts.length} creatives generated`} />
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not refresh outputs right now. Showing last available results.
        </div>
      ) : null}
      {selectedIds.length > 0 ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
          <span className="text-[#6B7280]">{selectedIds.length} selected</span>
          <Button
            size="sm"
            className="ml-3"
            onClick={() => {
              logUxEvent('outputs_schedule_selected_clicked', { selectedCount: selectedIds.length })
              router.push(`/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}`)
            }}
          >
            Schedule Selected
          </Button>
        </div>
      ) : null}
      <NextStepCard
        title={selectedIds.length > 0 ? 'Schedule selected outputs' : 'Select outputs to schedule'}
        reason={selectedIds.length > 0 ? 'Selected outputs are ready. Send them to Scheduler to assign publishing slots.' : 'Choose one or more outputs to unlock fast scheduling handoff.'}
        primaryCta={selectedIds.length > 0 ? { label: 'Schedule Selected', href: `/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}` } : { label: 'Open Scheduler', href: '/scheduler' }}
        secondaryCta={{ label: 'Generate More', href: '/generate' }}
      />

      <SectionCard title="Filters" subtitle="Find outputs quickly by platform, status, or keyword.">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              ref={searchRef}
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
          <div className="ml-auto rounded-lg border border-[#E5E7EB] p-1">
            <button onClick={() => setLayoutMode('grid')} className={cn('rounded px-2 py-1 text-xs', layoutMode === 'grid' ? 'bg-[#111111] text-white' : 'text-[#6B7280]')}>Grid</button>
            <button onClick={() => setLayoutMode('list')} className={cn('rounded px-2 py-1 text-xs', layoutMode === 'list' ? 'bg-[#111111] text-white' : 'text-[#6B7280]')}>List</button>
          </div>
        </div>
      </SectionCard>
      <p className="text-xs text-[#6B7280]">Shortcuts: `/` focus search, `S` schedule selected outputs.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
      <div>
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        ) : null}
        {posts.length === 0 ? (
          <EmptyState
            title="No outputs yet"
            subtitle="Generate your first creatives to begin reviewing and scheduling."
            action={<Button onClick={() => window.location.assign('/generate')}>Generate Content</Button>}
          />
        ) : (
          <div className={cn(layoutMode === 'grid' ? 'grid gap-3' : 'space-y-3')} style={layoutMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' } : undefined}>
            {posts.map((post) => (
              <button key={post.id} onClick={() => setSelected(post)} className={cn('group app-card overflow-hidden text-left transition hover:border-[#111111]', layoutMode === 'list' && 'flex items-center')}>
                <div className={cn('bg-[#F3F4F6]', layoutMode === 'grid' ? 'aspect-square' : 'h-24 w-24 shrink-0')}>
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt={post.caption || 'Generated output'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9CA3AF]"><ImageIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="mb-2 flex items-center gap-1">
                      <Button size="sm" variant="secondary" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); setSelected(post) }}>Preview</Button>
                      <Button size="sm" variant="secondary" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); regeneratePost(post.id) }}>Regenerate</Button>
                      <Button size="sm" variant="secondary" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); }}><Download className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-[#111111]">{post.caption || 'Untitled output'}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge tone={getPostStatusTone(getEffectivePostStatus(post.status, post.approval_status))}>
                      <span title={getPostStatusHint(getEffectivePostStatus(post.status, post.approval_status))}>
                        {getEffectivePostStatus(post.status, post.approval_status)}
                      </span>
                    </StatusBadge>
                    <span className="text-xs text-[#6B7280] capitalize">{post.platform}</span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-[#6B7280]">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        setSelectedIds((prev) => e.target.checked ? [...prev, post.id] : prev.filter((id) => id !== post.id))
                      }}
                    />
                    Select
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 flex-1" onClick={(e) => { e.stopPropagation(); setSelected(post) }}>View</Button>
                    <Button size="sm" variant="secondary" className="h-8 flex-1" onClick={(e) => { e.stopPropagation(); regeneratePost(post.id) }}>
                      <RefreshCcw className="mr-1 h-3 w-3" />
                      {regeneratingId === post.id ? '...' : 'Regenerate'}
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <SectionCard title="Selected Output" subtitle="Inspect details and versions">
        {selected ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image_url} alt={selected.caption || 'Selected output'} className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 items-center justify-center text-[#9CA3AF]"><ImageIcon className="h-6 w-6" /></div>
              )}
            </div>
            <p className="text-sm text-[#111111]">{selected.caption}</p>
            <div>
              <p className="mb-2 text-xs text-[#6B7280]">Versions</p>
              <div className="grid grid-cols-3 gap-2">
                {['v1', 'v2', 'v3'].map((version) => (
                  <button key={version} className="rounded-lg border border-[#E5E7EB] py-2 text-sm text-[#111111]">{version}</button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => regeneratePost(selected.id)}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {regeneratingId === selected.id ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">Select an output card to inspect details.</p>
        )}
      </SectionCard>
      </div>
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
