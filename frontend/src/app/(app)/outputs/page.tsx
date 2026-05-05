'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
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
import { displayCaption } from '@/lib/caption'

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
  slot_topic?: string
  slot_creative_copy?: string
  slot_hashtags_draft?: string[]
  slot_content_type?: string
}

const PLATFORM_FILTERS = ['all', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook']
const STATUS_FILTERS = ['all', 'draft', 'approved', 'scheduled']

export default function OutputsPage() {
  const { mutate: globalMutate } = useSWRConfig()
  const router = useRouter()
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<Post | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement | null>(null)
  const triggerDownload = async (url?: string, filename = 'output-image') => {
    if (!url) return
    const t = toast.loading('Downloading…')
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error('Network error')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(objectUrl)
      toast.success('Saved to device.', { id: t })
    } catch {
      toast.error('Download failed. Try opening the image in a new tab.', { id: t })
    }
  }
  const regeneratePost = async (postId: string) => {
    setRegeneratingId(postId)
    try {
      await apiCall(`/api/posts/${postId}/regenerate`, {
        method: 'POST',
        body: JSON.stringify({ feedback: 'Regenerate with improved composition' }),
      })
      await globalMutate((key) => typeof key === 'string' && key.startsWith('/api/posts'))
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
    .filter((post) => {
      if (!search) return true
      const q = search.toLowerCase()
      return [
        displayCaption(post.caption),
        post.slot_topic,
        post.slot_creative_copy,
        ...(post.slot_hashtags_draft || []),
      ].filter(Boolean).join(' ').toLowerCase().includes(q)
    })

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
      <PageHeader
        variant="compact"
        title={
          <>
            Outputs <span className="text-highlight">library</span>
          </>
        }
        description={`${posts.length} creatives generated`}
      />
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not refresh outputs right now. Showing last available results.
        </div>
      ) : null}
      <NextStepCard
        dense
        title={selectedIds.length > 0 ? 'Schedule selected outputs' : 'Select outputs to schedule'}
        reason={selectedIds.length > 0 ? 'Selected outputs are ready. Send them to Scheduler to assign publishing slots.' : 'Choose one or more outputs to unlock fast scheduling handoff.'}
        primaryCta={selectedIds.length > 0 ? { label: 'Schedule Selected', href: `/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}` } : { label: 'Open Scheduler', href: '/scheduler' }}
        secondaryCta={{ label: 'Generate More', href: '/generate' }}
      />

      <SectionCard
        className="app-card-elevated"
        title="Library toolbar"
        subtitle="Search, filter, layout. Shortcuts: / focus search, S schedule selected."
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{selectedIds.length} selected</span>
              <Button
                size="sm"
                className="h-8"
                onClick={() => {
                  logUxEvent('outputs_schedule_selected_clicked', { selectedCount: selectedIds.length })
                  router.push(`/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}`)
                }}
              >
                Schedule selected
              </Button>
            </div>
          ) : null}
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outputs..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PLATFORM_FILTERS.map((p) => (
              <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
                {p === 'all' ? 'All platforms' : p}
              </FilterPill>
            ))}
            {STATUS_FILTERS.map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === 'all' ? 'All statuses' : s}
              </FilterPill>
            ))}
            <div className="ml-auto flex rounded-lg border border-border bg-muted/30 p-1">
              <button type="button" onClick={() => setLayoutMode('grid')} className={cn('min-h-9 rounded-md px-3 py-1.5 text-xs font-medium', layoutMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                Grid
              </button>
              <button type="button" onClick={() => setLayoutMode('list')} className={cn('min-h-9 rounded-md px-3 py-1.5 text-xs font-medium', layoutMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                List
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

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
              <div
                key={post.id}
                onClick={() => setSelected(post)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(post)
                  }
                }}
                role="button"
                tabIndex={0}
                className={cn(
                  'group app-card-elevated cursor-pointer overflow-hidden border border-border/80 text-left shadow-[var(--shadow-card)] transition hover:border-primary/50',
                  layoutMode === 'list' && 'flex items-center',
                )}
              >
                <div className={cn('bg-muted', layoutMode === 'grid' ? 'aspect-square' : 'h-24 w-24 shrink-0')}>
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt={displayCaption(post.caption, 'Generated output')} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/80"><ImageIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <div className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <div className="mb-2 flex items-center gap-1">
                      <Button size="sm" variant="secondary" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); setSelected(post) }}>Preview</Button>
                      <Button size="sm" variant="secondary" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); regeneratePost(post.id) }}>Regenerate</Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          triggerDownload(post.image_url, `output-${post.id}.png`)
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{post.slot_topic || 'Untitled output'}</p>
                  {post.slot_creative_copy ? <p className="line-clamp-2 text-xs text-muted-foreground">{post.slot_creative_copy}</p> : null}
                  <p className="line-clamp-3 text-xs text-muted-foreground">{displayCaption(post.caption, `${post.platform} ${post.content_type || 'post'}`)}</p>
                  {post.slot_hashtags_draft?.length ? (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">
                      {post.slot_hashtags_draft.map((h) => h.startsWith('#') ? h : `#${h}`).join(' ')}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <StatusBadge tone={getPostStatusTone(getEffectivePostStatus(post.status, post.approval_status))}>
                      <span title={getPostStatusHint(getEffectivePostStatus(post.status, post.approval_status))}>
                        {getEffectivePostStatus(post.status, post.approval_status)}
                      </span>
                    </StatusBadge>
                    <span className="text-xs text-muted-foreground capitalize">{post.slot_content_type || post.content_type || 'post'}</span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
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
              </div>
            ))}
          </div>
        )}
      </div>
      <SectionCard className="app-card-elevated xl:sticky xl:top-24" title="Selected output" subtitle="Inspect details and versions">
        {selected ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-border bg-muted">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image_url} alt={displayCaption(selected.caption, 'Selected output')} className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 items-center justify-center text-muted-foreground/80"><ImageIcon className="h-6 w-6" /></div>
              )}
            </div>
            <p className="text-sm text-foreground">{displayCaption(selected.caption, 'No caption')}</p>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Versions</p>
              <div className="grid grid-cols-3 gap-2">
                {['v1', 'v2', 'v3'].map((version) => (
                  <button key={version} className="rounded-lg border border-border py-2 text-sm text-foreground">{version}</button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => regeneratePost(selected.id)}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {regeneratingId === selected.id ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select an output card to inspect details.</p>
        )}
      </SectionCard>
      </div>
    </PageContainer>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-150', active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted')}>
      {children}
    </button>
  )
}
