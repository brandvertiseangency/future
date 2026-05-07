'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { ChevronDown, Download, ImageIcon, MoreHorizontal, RefreshCcw, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader, EmptyState, NextStepCard } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button, buttonVariants } from '@/components/ui/button'
import { toast } from 'sonner'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { getEffectivePostStatus, getPostStatusHint, getPostStatusTone } from '@/lib/post-status'
import { logUxEvent } from '@/lib/ux-events'
import { displayCaption } from '@/lib/caption'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

const MEDIA_TABS = [
  { id: 'all' as const, label: 'All' },
  { id: 'image' as const, label: 'Images' },
  { id: 'carousel' as const, label: 'Carousels' },
  { id: 'video' as const, label: 'Videos' },
  { id: 'reel' as const, label: 'Reels' },
]

type MediaTabId = (typeof MEDIA_TABS)[number]['id']

function mediaBucket(post: Post): 'image' | 'carousel' | 'video' | 'reel' {
  const t = (post.slot_content_type || post.content_type || 'post').toLowerCase()
  if (t.includes('carousel')) return 'carousel'
  if (t === 'reel' || t === 'story') return 'reel'
  if (t === 'video' || t.includes('video')) return 'video'
  return 'image'
}

function matchesMediaTab(post: Post, tab: MediaTabId): boolean {
  if (tab === 'all') return true
  return mediaBucket(post) === tab
}

function formatShortDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function OutputsPage() {
  const { mutate: globalMutate } = useSWRConfig()
  const router = useRouter()
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')
  const [mediaTab, setMediaTab] = useState<MediaTabId>('all')
  const [search, setSearch] = useState('')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<Post | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement | null>(null)

  const resetFilters = () => {
    setPlatform('all')
    setStatus('all')
    setMediaTab('all')
    setSearch('')
  }

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

  const goScheduleSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    logUxEvent('outputs_schedule_selected_clicked', { selectedCount: selectedIds.length })
    router.push(`/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}`)
  }, [router, selectedIds])

  const query = new URLSearchParams({ limit: '50' })
  if (platform !== 'all') query.set('platform', platform)
  if (status !== 'all') query.set('status', status)

  const swrKey = `/api/posts?${query}`
  const { data, error, isLoading } = useSWR(swrKey, (u: string) => apiCall<{ posts: Post[] }>(u), { revalidateOnFocus: false })

  const posts = useMemo(() => {
    return (data?.posts ?? []).filter((post) => {
      if (!matchesMediaTab(post, mediaTab)) return false
      if (!search) return true
      const q = search.toLowerCase()
      return [
        displayCaption(post.caption),
        post.slot_topic,
        post.slot_creative_copy,
        ...(post.slot_hashtags_draft || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [data?.posts, mediaTab, search])

  const filterRail = (
    <SectionCard className="app-card-elevated" title="Filters" subtitle="Platform, status, and reset.">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Platform</p>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORM_FILTERS.map((p) => (
              <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
                {p === 'all' ? 'All' : p}
              </FilterPill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === 'all' ? 'All' : s}
              </FilterPill>
            ))}
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" className="w-full" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>
    </SectionCard>
  )

  const selectedPanel = (
    <SectionCard className="app-card-elevated" title="Selected output" subtitle="Inspect details and versions">
      {selected ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            {selected.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.image_url} alt={displayCaption(selected.caption, 'Selected output')} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 items-center justify-center text-muted-foreground/80">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <p className="text-sm text-foreground">{displayCaption(selected.caption, 'No caption')}</p>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Versions</p>
            <div className="grid grid-cols-3 gap-2">
              {['v1', 'v2', 'v3'].map((version) => (
                <button key={version} type="button" className="rounded-lg border border-border py-2 text-sm text-foreground">
                  {version}
                </button>
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
  )

  return (
    <PageContainer className="max-w-[1100px] pb-20 xl:max-w-[min(1600px,calc(100vw-2rem))]">
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
        description={`${posts.length} creatives match your filters`}
      />
      {error ? (
        <div className="rounded-lg border border-amber-300/60 bg-card/75 px-3 py-2 text-xs text-amber-900 backdrop-blur-sm dark:border-amber-700/50 dark:bg-card/60 dark:text-amber-200">
          Could not refresh outputs right now. Showing last available results.
        </div>
      ) : null}
      <NextStepCard
        dense
        title={selectedIds.length > 0 ? 'Schedule selected outputs' : 'Select outputs to schedule'}
        reason={
          selectedIds.length > 0
            ? 'Selected outputs are ready. Send them to Scheduler to assign publishing slots.'
            : 'Choose one or more outputs to unlock fast scheduling handoff.'
        }
        primaryCta={
          selectedIds.length > 0
            ? { label: 'Schedule Selected', href: `/scheduler?postIds=${encodeURIComponent(selectedIds.join(','))}` }
            : { label: 'Open Scheduler', href: '/scheduler' }
        }
        secondaryCta={{ label: 'Generate More', href: '/generate' }}
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{selectedIds.length} selected</span>
            <span className="text-muted-foreground">Bulk actions</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-9 gap-1')}>
              Actions
              <ChevronDown className="h-4 w-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onClick={() => goScheduleSelected()}>Schedule selected</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedIds([])}>Clear selection</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <SectionCard
        className="app-card-elevated"
        title="Library toolbar"
        subtitle="Search, media type, and layout controls."
      >
        <div className="flex flex-col gap-3">
          <div className="relative min-w-[200px] w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outputs..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MEDIA_TABS.map((m) => (
              <FilterPill key={m.id} active={mediaTab === m.id} onClick={() => setMediaTab(m.id)}>
                {m.label}
              </FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:hidden">
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
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          <div className="flex justify-end">
            <div className="flex rounded-lg border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={cn(
                  'min-h-9 rounded-md px-3 py-1.5 text-xs font-medium',
                  layoutMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={cn(
                  'min-h-9 rounded-md px-3 py-1.5 text-xs font-medium',
                  layoutMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_min(300px,32%)]">
        <div>
          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCard lines={4} />
              <SkeletonCard lines={4} />
            </div>
          ) : null}
          {posts.length === 0 && !isLoading ? (
            <EmptyState
              title="No outputs match"
              subtitle="Try another media filter or generate new creatives in the studio."
              action={<Button onClick={() => window.location.assign('/generate')}>Open Generate studio</Button>}
            />
          ) : null}
          {posts.length > 0 ? (
            <div
              className={cn(layoutMode === 'grid' ? 'grid gap-3' : 'space-y-3')}
              style={layoutMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' } : undefined}
            >
              {posts.map((post) => {
                const eff = getEffectivePostStatus(post.status, post.approval_status)
                const typeLabel = (post.slot_content_type || post.content_type || 'post').replace(/_/g, ' ')
                return (
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
                      layoutMode === 'list' && 'flex items-stretch',
                      selected?.id === post.id && 'ring-1 ring-primary/40',
                    )}
                  >
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-muted/40 px-2.5 py-1.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <label
                          className="flex cursor-pointer items-center"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(post.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              setSelectedIds((prev) => (e.target.checked ? [...prev, post.id] : prev.filter((id) => id !== post.id)))
                            }}
                            className="rounded border-border"
                          />
                        </label>
                        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-foreground">{post.platform}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          type="button"
                          className="rounded-md p-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              setSelected(post)
                            }}
                          >
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              void regeneratePost(post.id)
                            }}
                          >
                            Regenerate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              void triggerDownload(post.image_url, `output-${post.id}.png`)
                            }}
                          >
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className={cn('min-w-0 flex-1', layoutMode === 'list' && 'flex flex-row')}>
                      <div className={cn('bg-muted', layoutMode === 'grid' ? 'aspect-square w-full' : 'h-24 w-28 shrink-0')}>
                        {post.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.image_url}
                            alt={displayCaption(post.caption, 'Generated output')}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground/80">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={getPostStatusTone(eff)}>
                            <span title={getPostStatusHint(eff)}>{eff}</span>
                          </StatusBadge>
                          <span className="text-[10px] text-muted-foreground capitalize">{typeLabel}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground">{formatShortDate(post.created_at)}</span>
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-foreground">{post.slot_topic || 'Untitled output'}</p>
                        {post.slot_creative_copy ? (
                          <p className="line-clamp-2 text-xs text-muted-foreground">{post.slot_creative_copy}</p>
                        ) : null}
                        <p className="line-clamp-2 text-xs text-muted-foreground">{displayCaption(post.caption, '—')}</p>
                        {post.slot_hashtags_draft?.length ? (
                          <p className="line-clamp-1 text-[11px] text-muted-foreground">
                            {post.slot_hashtags_draft.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
                          </p>
                        ) : null}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-8 flex-1" onClick={(e) => { e.stopPropagation(); setSelected(post) }}>
                            View
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 flex-1" onClick={(e) => { e.stopPropagation(); void regeneratePost(post.id) }}>
                            <RefreshCcw className="mr-1 h-3 w-3" />
                            {regeneratingId === post.id ? '…' : 'Regen'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 shrink-0 px-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              void triggerDownload(post.image_url, `output-${post.id}.png`)
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="hidden flex-col gap-4 xl:flex xl:sticky xl:top-24 xl:self-start">
          {filterRail}
          {selectedPanel}
        </div>
      </div>

      <div className="mt-4 xl:hidden">{selectedPanel}</div>
    </PageContainer>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-150',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
