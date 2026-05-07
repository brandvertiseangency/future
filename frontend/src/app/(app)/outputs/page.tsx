'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { ChevronDown, Download, ImageIcon, MoreHorizontal, RefreshCcw, Search, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader, EmptyState, NextStepCard } from '@/components/ui/page-primitives'
import { StatusBadge } from '@/components/ui/saas-primitives'
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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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

const PLATFORM_FILTERS = ['all', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'] as const
const STATUS_FILTERS = ['all', 'draft', 'approved', 'scheduled'] as const

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
  const [platform, setPlatform] = useState<(typeof PLATFORM_FILTERS)[number]>('all')
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [mediaTab, setMediaTab] = useState<MediaTabId>('all')
  const [search, setSearch] = useState('')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null)
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

  const activeFilterCount =
    (platform !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0) + (mediaTab !== 'all' ? 1 : 0)

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxPost) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPost(null)
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const idx = posts.findIndex((p) => p.id === lightboxPost.id)
        if (idx === -1) return
        const next = e.key === 'ArrowRight' ? idx + 1 : idx - 1
        const target = posts[(next + posts.length) % posts.length]
        if (target) setLightboxPost(target)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxPost, posts])

  return (
    <PageContainer className="max-w-[1400px] pb-20">
      <PageIntroModal
        pageKey="outputs"
        title="View, refine, and finalize your creatives"
        description="Use quick actions, compare versions, and schedule the best results."
      />
      <PageHeader
        variant="compact"
        title={
          <>
            Outputs <span className="text-pull text-primary">library</span>
          </>
        }
        description={`${posts.length} creatives match your filters`}
      />
      {error ? (
        <div className="mb-4 rounded-lg border border-amber-300/60 bg-card/75 px-3 py-2 text-xs text-amber-900 backdrop-blur-sm dark:border-amber-700/50 dark:bg-card/60 dark:text-amber-200">
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{selectedIds.length} selected</span>
            <span className="text-muted-foreground">Bulk actions</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
            <Button size="sm" onClick={goScheduleSelected}>
              Schedule selected
            </Button>
          </div>
        </div>
      ) : null}

      {/* Toolbar — search + media tabs + filters + layout */}
      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outputs…"
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Platform"
              value={platform}
              options={[...PLATFORM_FILTERS]}
              onChange={(v) => setPlatform(v as typeof platform)}
            />
            <FilterDropdown
              label="Status"
              value={status}
              options={[...STATUS_FILTERS]}
              onChange={(v) => setStatus(v as typeof status)}
            />
            <FilterDropdown
              label="Type"
              value={mediaTab}
              options={MEDIA_TABS.map((t) => t.id)}
              labelMap={Object.fromEntries(MEDIA_TABS.map((t) => [t.id, t.label]))}
              onChange={(v) => setMediaTab(v as MediaTabId)}
            />
            {activeFilterCount > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            ) : null}
            <div className="flex h-9 rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={cn(
                  'rounded-md px-3 text-xs font-medium transition-colors',
                  layoutMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={cn(
                  'rounded-md px-3 text-xs font-medium transition-colors',
                  layoutMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5">
        {isLoading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        ) : null}

        {posts.length === 0 && !isLoading ? (
          activeFilterCount > 0 ? (
            <EmptyState
              title="No outputs match these filters"
              subtitle="Try clearing one or more filters to see your creatives."
              action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              title="No outputs yet"
              subtitle="Generate your first piece of content from a brief and it will appear here, ready to schedule."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => window.location.assign('/generate')}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate content
                  </Button>
                  <Button variant="secondary" onClick={() => window.location.assign('/calendar/generate')}>
                    Plan a calendar
                  </Button>
                </div>
              }
            />
          )
        ) : null}

        {posts.length > 0 ? (
          <div
            className={cn(layoutMode === 'grid' ? 'grid gap-3' : 'space-y-3')}
            style={layoutMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' } : undefined}
          >
            {posts.map((post) => {
              const eff = getEffectivePostStatus(post.status, post.approval_status)
              const typeLabel = (post.slot_content_type || post.content_type || 'post').replace(/_/g, ' ')
              const isChecked = selectedIds.includes(post.id)
              return (
                <div
                  key={post.id}
                  onClick={() => setLightboxPost(post)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setLightboxPost(post)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)]',
                    layoutMode === 'list' && 'flex items-stretch',
                  )}
                >
                  {/* Top bar: checkbox + platform + actions */}
                  <div className="absolute left-2 top-2 z-[2]">
                    <label
                      className="flex cursor-pointer items-center rounded-md bg-card/85 p-1 shadow-sm backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation()
                          setSelectedIds((prev) => (e.target.checked ? [...prev, post.id] : prev.filter((id) => id !== post.id)))
                        }}
                        className="h-3.5 w-3.5 rounded border-border accent-primary"
                      />
                    </label>
                  </div>
                  <div className="absolute right-2 top-2 z-[2]">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        className="rounded-md bg-card/85 p-1 text-muted-foreground shadow-sm outline-none backdrop-blur-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault()
                            setLightboxPost(post)
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
                    <div className={cn('relative bg-muted', layoutMode === 'grid' ? 'aspect-square w-full' : 'h-28 w-32 shrink-0')}>
                      {post.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.image_url}
                          alt={displayCaption(post.caption, 'Generated output')}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/80">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5 p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge tone={getPostStatusTone(eff)}>
                          <span title={getPostStatusHint(eff)}>{eff}</span>
                        </StatusBadge>
                        <span className="text-[10px] capitalize text-muted-foreground">{typeLabel}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{formatShortDate(post.created_at)}</span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-foreground">{post.slot_topic || displayCaption(post.caption, 'Untitled output')}</p>
                      <p className="text-[11px] capitalize text-muted-foreground">{post.platform}</p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLightboxPost(post)
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            void regeneratePost(post.id)
                          }}
                        >
                          <RefreshCcw className="h-3.5 w-3.5" />
                          {regeneratingId === post.id ? '…' : ''}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            void triggerDownload(post.image_url, `output-${post.id}.png`)
                          }}
                          aria-label="Download"
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

      {/* Lightbox */}
      {lightboxPost ? (
        <Lightbox
          post={lightboxPost}
          onClose={() => setLightboxPost(null)}
          onPrev={() => {
            const idx = posts.findIndex((p) => p.id === lightboxPost.id)
            if (idx === -1) return
            setLightboxPost(posts[(idx - 1 + posts.length) % posts.length])
          }}
          onNext={() => {
            const idx = posts.findIndex((p) => p.id === lightboxPost.id)
            if (idx === -1) return
            setLightboxPost(posts[(idx + 1) % posts.length])
          }}
          onRegenerate={() => regeneratePost(lightboxPost.id)}
          onDownload={() => triggerDownload(lightboxPost.image_url, `output-${lightboxPost.id}.png`)}
          onSchedule={() => router.push(`/scheduler?postIds=${encodeURIComponent(lightboxPost.id)}`)}
          regeneratingId={regeneratingId}
        />
      ) : null}
    </PageContainer>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  labelMap,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  labelMap?: Record<string, string>
  onChange: (next: string) => void
}) {
  const display = labelMap?.[value] ?? (value === 'all' ? `All ${label.toLowerCase()}` : value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'secondary', size: 'sm' }),
          'gap-1.5 capitalize',
          value !== 'all' && 'border-primary/40 text-foreground',
        )}
      >
        {label}: <span className="font-medium">{display}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o} value={o} className="capitalize">
              {labelMap?.[o] ?? (o === 'all' ? `All ${label.toLowerCase()}` : o)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Lightbox({
  post,
  onClose,
  onPrev,
  onNext,
  onRegenerate,
  onDownload,
  onSchedule,
  regeneratingId,
}: {
  post: Post
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onRegenerate: () => void
  onDownload: () => void
  onSchedule: () => void
  regeneratingId: string | null
}) {
  const eff = getEffectivePostStatus(post.status, post.approval_status)
  const typeLabel = (post.slot_content_type || post.content_type || 'post').replace(/_/g, ' ')
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md outline-none ring-1 ring-border transition hover:bg-background"
        aria-label="Close preview"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className="grid h-full max-h-[88vh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:grid-cols-[1.4fr_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="relative flex items-center justify-center bg-muted">
          {post.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt={displayCaption(post.caption, 'Output preview')}
              className="max-h-[88vh] w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm">No image generated</span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md ring-1 ring-border outline-none transition hover:bg-background"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md ring-1 ring-border outline-none transition hover:bg-background"
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col overflow-y-auto">
          <div className="space-y-3 border-b border-border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={getPostStatusTone(eff)}>
                <span>{eff}</span>
              </StatusBadge>
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] capitalize text-muted-foreground">
                {post.platform}
              </span>
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] capitalize text-muted-foreground">
                {typeLabel}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">{formatShortDate(post.created_at)}</span>
            </div>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
              {post.slot_topic || displayCaption(post.caption, 'Untitled output')}
            </h2>
            {post.slot_creative_copy ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{post.slot_creative_copy}</p>
            ) : null}
          </div>

          <div className="flex-1 space-y-4 p-5">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Caption</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {displayCaption(post.caption, 'No caption available.')}
              </p>
            </div>

            {post.slot_hashtags_draft && post.slot_hashtags_draft.length > 0 ? (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hashtags</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {post.slot_hashtags_draft.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border p-4">
            <Button size="sm" onClick={onSchedule} className="flex-1">
              Schedule
            </Button>
            <Button size="sm" variant="secondary" onClick={onRegenerate} disabled={regeneratingId === post.id}>
              <RefreshCcw className="h-3.5 w-3.5" />
              {regeneratingId === post.id ? 'Regenerating…' : 'Regenerate'}
            </Button>
            <Button size="sm" variant="secondary" onClick={onDownload}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
