'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import {
  Check,
  Sparkles,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  CheckCheck,
  ChevronRight,
  X,
  Archive,
  ThumbsDown,
} from 'lucide-react'
import useSWR, { useSWRConfig } from 'swr'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { toast } from 'sonner'
import { displayCaption } from '@/lib/caption'
import { SocialIcon } from '@/components/ui/social-icon'

type PostStatus = 'draft' | 'needs_review' | 'approved' | 'rejected' | 'scheduled' | 'published' | 'failed' | 'archived'

type CalendarRow = {
  id: string
  day: string
  rawDate: Date | null
  type: string
  idea: string
  caption: string
  status: PostStatus
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  platform: string
  pillar?: string
  imageUrl?: string
}

const STATUS_TABS = [
  { id: 'all', label: 'All Ideas' },
  { id: 'needs_review', label: 'Needs Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
] as const

type TabId = (typeof STATUS_TABS)[number]['id']

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  needs_review: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  draft: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  rejected: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
  scheduled: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  published: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20',
  archived: 'bg-muted text-muted-foreground border-border',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  approved: <Check size={11} strokeWidth={2.5} />,
  needs_review: <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />,
  draft: <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />,
  rejected: <X size={11} strokeWidth={2.5} />,
  scheduled: <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />,
  published: <Check size={11} strokeWidth={2.5} />,
  archived: <Archive size={11} />,
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground border-border'
  const label = status === 'needs_review' ? 'Needs Review' : status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', colorClass)}>
      {STATUS_ICONS[status]}
      {label}
    </span>
  )
}

function getEffectiveStatus(status?: string, approvalStatus?: string): PostStatus {
  if (approvalStatus === 'approved') return 'approved'
  if (approvalStatus === 'rejected') return 'rejected'
  if (!status || status === 'draft') return approvalStatus === 'pending' ? 'needs_review' : 'draft'
  return (status as PostStatus) || 'draft'
}

const fetcher = (url: string) =>
  apiCall<{ posts?: Array<{ id: string; title?: string; content_type?: string; caption?: string; status?: string; approval_status?: string; platform?: string; scheduled_at?: string; image_url?: string; content_pillar?: string }> }>(url)

function CalendarPageInner() {
  const { mutate: mutateKeys } = useSWRConfig()
  const searchParams = useSearchParams()
  // planId param is available if navigated from generate page
  const _planId = searchParams.get('planId')

  const { data, mutate } = useSWR('/api/posts?limit=100', fetcher, { revalidateOnFocus: false })
  const invalidatePostCaches = useCallback(
    () => mutateKeys((key) => typeof key === 'string' && key.startsWith('/api/posts')),
    [mutateKeys],
  )

  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<CalendarRow | null>(null)
  const [editedCaption, setEditedCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const pageSize = 8

  // Date range display (approximate — first and last scheduled date)
  const rows: CalendarRow[] = useMemo(() => {
    return (data?.posts ?? []).map((post) => ({
      id: post.id,
      day: post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
      rawDate: post.scheduled_at ? new Date(post.scheduled_at) : null,
      type: post.content_type ?? 'post',
      idea: post.title ?? 'Untitled idea',
      caption: post.caption ?? '',
      status: getEffectiveStatus(post.status, post.approval_status),
      approvalStatus: (post.approval_status as CalendarRow['approvalStatus']) ?? 'pending',
      platform: post.platform ?? 'instagram',
      pillar: post.content_pillar ?? undefined,
      imageUrl: post.image_url ?? undefined,
    }))
  }, [data?.posts])

  const statusCounts = useMemo(() => {
    const c: Record<TabId, number> = { all: rows.length, needs_review: 0, approved: 0, rejected: 0, draft: 0, archived: 0 }
    for (const r of rows) {
      if (r.status === 'needs_review') c.needs_review++
      else if (r.status === 'approved' || r.status === 'scheduled' || r.status === 'published') c.approved++
      else if (r.status === 'rejected') c.rejected++
      else if (r.status === 'archived') c.archived++
      else c.draft++
    }
    return c
  }, [rows])

  // Content mix for summary donut
  const contentMix = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of rows) {
      const k = r.pillar ?? r.type ?? 'Other'
      counts[k] = (counts[k] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [rows])

  const filteredRows = useMemo(() => {
    let r = rows
    if (activeTab !== 'all') {
      if (activeTab === 'approved') {
        r = r.filter((x) => x.status === 'approved' || x.status === 'scheduled' || x.status === 'published')
      } else {
        r = r.filter((x) => x.status === activeTab)
      }
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      r = r.filter((row) =>
        [row.idea, displayCaption(row.caption, ''), row.platform, row.type, row.pillar ?? ''].join(' ').toLowerCase().includes(q),
      )
    }
    return r
  }, [rows, activeTab, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const paginatedRows = useMemo(() => filteredRows.slice((page - 1) * pageSize, page * pageSize), [filteredRows, page])

  useEffect(() => { setPage(1) }, [activeTab, searchQuery])

  const selectRow = (row: CalendarRow) => {
    setSelected(row)
    setEditedCaption(displayCaption(row.caption, ''))
  }

  const approveById = useCallback(async (row: CalendarRow) => {
    setSaving(true)
    try {
      await apiCall(`/api/posts/${row.id}`, { method: 'PATCH', body: JSON.stringify({ approval_status: 'approved' }) })
      if (selected?.id === row.id) setSelected((p) => p ? { ...p, status: 'approved', approvalStatus: 'approved' } : p)
      await mutate(); await invalidatePostCaches()
      toast.success('Post approved')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }, [selected, mutate, invalidatePostCaches])

  const rejectById = useCallback(async (row: CalendarRow) => {
    setSaving(true)
    try {
      await apiCall(`/api/posts/${row.id}`, { method: 'PATCH', body: JSON.stringify({ approval_status: 'rejected' }) })
      if (selected?.id === row.id) setSelected((p) => p ? { ...p, status: 'rejected', approvalStatus: 'rejected' } : p)
      await mutate(); await invalidatePostCaches()
      toast.success('Post rejected')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }, [selected, mutate, invalidatePostCaches])

  const saveCaption = useCallback(async () => {
    if (!selected) return
    setSaving(true)
    try {
      await apiCall(`/api/posts/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ caption: editedCaption, approval_status: 'approved' }) })
      setSelected((p) => p ? { ...p, caption: editedCaption, status: 'approved', approvalStatus: 'approved' } : p)
      await mutate(); await invalidatePostCaches()
      toast.success('Post approved')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }, [selected, editedCaption, mutate, invalidatePostCaches])

  const approveAll = useCallback(async () => {
    if (!filteredRows.length) return
    setBulkSaving(true)
    try {
      await Promise.all(filteredRows.map((r) => apiCall(`/api/posts/${r.id}`, { method: 'PATCH', body: JSON.stringify({ approval_status: 'approved' }) })))
      await mutate(); await invalidatePostCaches()
      toast.success(`${filteredRows.length} posts approved`)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') } finally { setBulkSaving(false) }
  }, [filteredRows, mutate, invalidatePostCaches])

  const dateRange = useMemo(() => {
    const dated = rows.filter((r) => r.rawDate).sort((a, b) => (a.rawDate?.getTime() ?? 0) - (b.rawDate?.getTime() ?? 0))
    if (!dated.length) return null
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return dated.length === 1 ? fmt(dated[0].rawDate!) : `${fmt(dated[0].rawDate!)} – ${fmt(dated[dated.length - 1].rawDate!)}`
  }, [rows])

  const hasApproved = rows.some((r) => r.status === 'approved' || r.status === 'scheduled' || r.status === 'published')

  return (
    <PageContainer className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Content Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review, refine and approve your content ideas before scheduling.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dateRange && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Calendar size={13} />
              {dateRange}
            </div>
          )}
          <Link href="/calendar/generate">
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-0 border-b border-border overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(({ id, label }) => {
          const count = id === 'all' ? statusCounts.all : statusCounts[id] ?? 0
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-bold', activeTab === id ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px] xl:items-start">
        {/* ── Left: table ── */}
        <div className="space-y-4">
          {/* Search + filter bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by content, pillar, platform…"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Table */}
          {!data ? (
            <div className="space-y-2">
              <SkeletonCard lines={4} />
              <SkeletonCard lines={4} />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
              <p className="text-sm font-semibold text-foreground">No content ideas found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different filter or generate a new plan.</p>
              <Link href="/calendar/generate" className="mt-4">
                <Button size="sm">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Plan
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Content Idea
                      </th>
                      <th className="hidden px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                        Pillar
                      </th>
                      <th className="hidden px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                        Platform
                      </th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="hidden px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                        Date
                      </th>
                      <th className="w-10 px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => selectRow(row)}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/30',
                          selected?.id === row.id && 'bg-primary/5',
                        )}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground leading-snug">{row.idea}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{displayCaption(row.caption, '')}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                              {row.type}
                            </span>
                            {row.pillar && (
                              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {row.pillar}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <span className="text-sm text-muted-foreground">{row.pillar ?? '—'}</span>
                        </td>
                        <td className="hidden px-3 py-3 sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <SocialIcon platform={row.platform} size={15} />
                            <span className="text-xs font-medium capitalize text-muted-foreground">{row.platform}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell">
                          <span className="text-xs text-muted-foreground">{row.day}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => void approveById(row)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                              title="Approve"
                            >
                              <Check size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                              title="More options"
                            >
                              <MoreHorizontal size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination + bulk */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {Math.min((page - 1) * pageSize + 1, filteredRows.length)}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} results
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={cn('h-8 w-8 rounded-lg text-sm font-medium transition-colors', page === n ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground')}
                      >
                        {n}
                      </button>
                    ))}
                    {totalPages > 4 && <span className="px-1 text-muted-foreground">…</span>}
                  </div>
                  <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>

              {/* Bulk action */}
              <div className="flex justify-end">
                <Button onClick={approveAll} disabled={bulkSaving || filteredRows.length === 0} variant="secondary">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  {bulkSaving ? 'Approving…' : `Approve All & Continue →`}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ── Right: Summary ── */}
        <div className="space-y-4 xl:sticky xl:top-6">
          {/* Summary card */}
          <div className="app-card-elevated p-4 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Summary</p>

            {/* Content mix */}
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Content Mix</p>
              {/* Simple conic gradient donut */}
              {rows.length > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                      {(() => {
                        const total = rows.length
                        let offset = 0
                        const colors = ['#4a7dff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
                        return contentMix.map(([, count], i) => {
                          const pct = (count / total) * 100
                          const stroke = colors[i % colors.length]
                          const el = (
                            <circle
                              key={i}
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke={stroke}
                              strokeWidth="6"
                              strokeDasharray={`${pct * 0.879646} 87.9646`}
                              strokeDashoffset={-offset * 0.879646}
                            />
                          )
                          offset += pct
                          return el
                        })
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-foreground">{rows.length}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {contentMix.map(([label, count], i) => {
                      const colors = ['#4a7dff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
                      return (
                        <div key={label} className="flex items-center gap-1.5 text-xs">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                          <span className="text-muted-foreground truncate max-w-[90px]">{label}</span>
                          <span className="ml-auto font-semibold text-foreground">{Math.round((count / rows.length) * 100)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No content yet.</p>
              )}
            </div>

            {/* Status overview */}
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Status Overview</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Approved', count: statusCounts.approved, color: 'text-emerald-500' },
                  { label: 'Needs Review', count: statusCounts.needs_review, color: 'text-amber-500' },
                  { label: 'Draft', count: statusCounts.draft, color: 'text-blue-500' },
                  { label: 'Rejected', count: statusCounts.rejected, color: 'text-red-500' },
                  { label: 'Archived', count: statusCounts.archived, color: 'text-muted-foreground' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className={cn('font-medium', color)}>{label}</span>
                    </span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next step */}
          <div className="app-card-elevated p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Next Step</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {hasApproved
                ? 'Looks good! Approve content to move to scheduling.'
                : 'Review and approve your content ideas to continue to scheduling.'}
            </p>
            {hasApproved ? (
              <Link href="/scheduler">
                <Button size="sm" className="w-full gap-1.5">
                  Approve All & Continue <ChevronRight size={13} />
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="w-full" variant="secondary" onClick={approveAll} disabled={bulkSaving || rows.length === 0}>
                <CheckCheck size={13} className="mr-1.5" />
                {bulkSaving ? 'Approving…' : 'Approve All'}
              </Button>
            )}
          </div>

          {/* Inline editor */}
          {selected && (
            <div className="app-card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Edit Post</p>
                <button type="button" onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <SocialIcon platform={selected.platform} size={14} />
                <span className="text-xs font-medium capitalize text-muted-foreground">{selected.platform}</span>
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Caption</p>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" onClick={saveCaption} disabled={saving}>
                  <Check size={13} className="mr-1.5" />
                  {saving ? 'Saving…' : 'Approve'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => void rejectById(selected)} disabled={saving}>
                  <ThumbsDown size={13} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarPageInner />
    </Suspense>
  )
}
