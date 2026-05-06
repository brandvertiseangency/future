'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Check, Sparkles, RefreshCcw, Pencil, Search, LayoutGrid, Rows3 } from 'lucide-react'
import useSWR, { useSWRConfig } from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { NextStepCard, PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { DataTableShell } from '@/components/ui/data-table-shell'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { toast } from 'sonner'
import { getEffectivePostStatus, getPostStatusHint, getPostStatusTone } from '@/lib/post-status'
import { displayCaption } from '@/lib/caption'

type CalendarRow = {
  id: string
  day: string
  type: string
  idea: string
  caption: string
  status: 'draft' | 'approved' | 'scheduled' | 'published' | 'failed'
  approvalStatus?: 'pending' | 'approved'
  platform: string
}

const fetcher = (url: string) => apiCall<{ posts?: Array<{ id: string; title?: string; content_type?: string; caption?: string; status?: CalendarRow['status']; approval_status?: CalendarRow['approvalStatus']; platform?: string; scheduled_at?: string }> }>(url)

export default function CalendarPage() {
  const { mutate: mutateKeys } = useSWRConfig()
  const { data, mutate } = useSWR('/api/posts?limit=100', fetcher, { revalidateOnFocus: false })
  const invalidatePostCaches = useCallback(
    () => mutateKeys((key) => typeof key === 'string' && key.startsWith('/api/posts')),
    [mutateKeys]
  )
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  const [selected, setSelected] = useState<CalendarRow | null>(null)
  const [editedIdea, setEditedIdea] = useState('')
  const [editedCaption, setEditedCaption] = useState('')
  const [editedProduct, setEditedProduct] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'approved' | 'scheduled' | 'published' | 'failed'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const rows: CalendarRow[] = useMemo(() => {
    return (data?.posts ?? []).map((post) => ({
      id: post.id,
      day: post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'TBD',
      type: post.content_type ?? 'post',
      idea: post.title ?? 'Untitled idea',
      caption: post.caption ?? '',
      status: getEffectivePostStatus(post.status, post.approval_status),
      approvalStatus: post.approval_status ?? 'pending',
      platform: post.platform ?? 'instagram',
    }))
  }, [data?.posts])
  const hasApprovedOrScheduled = rows.some((row) => row.status === 'approved' || row.status === 'scheduled' || row.status === 'published')

  const statusCounts = useMemo(() => {
    const c = { all: rows.length, draft: 0, approved: 0, scheduled: 0, published: 0, failed: 0 }
    for (const r of rows) {
      if (r.status === 'draft') c.draft++
      else if (r.status === 'approved') c.approved++
      else if (r.status === 'scheduled') c.scheduled++
      else if (r.status === 'published') c.published++
      else if (r.status === 'failed') c.failed++
    }
    return c
  }, [rows])

  const filteredRows = useMemo(() => {
    let r = rows
    if (statusFilter !== 'all') r = r.filter((x) => x.status === statusFilter)
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      r = r.filter((row) =>
        [row.idea, displayCaption(row.caption, ''), row.platform, row.type, row.day].join(' ').toLowerCase().includes(q),
      )
    }
    return r
  }, [rows, statusFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchQuery])

  const approvedPct = rows.length ? Math.round(((statusCounts.approved + statusCounts.scheduled + statusCounts.published) / rows.length) * 100) : 0

  const columnHelper = createColumnHelper<CalendarRow>()
  const columns = [
    columnHelper.accessor('day', { header: 'Day', cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue()}</span> }),
    columnHelper.accessor('type', { header: 'Type', cell: (info) => <span className="capitalize text-sm text-foreground">{info.getValue()}</span> }),
    columnHelper.accessor('idea', { header: 'Idea', cell: (info) => <span className="text-sm text-foreground">{info.getValue()}</span> }),
    columnHelper.accessor('caption', {
      header: 'Caption',
      cell: (info) => (
        <span className="line-clamp-2 max-w-[min(280px,32vw)] text-sm leading-snug text-muted-foreground">
          {displayCaption(String(info.getValue() ?? ''), '—')}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <StatusBadge tone={getPostStatusTone(info.getValue())}>
          <span title={getPostStatusHint(info.getValue())}>{info.getValue()}</span>
        </StatusBadge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); selectRow(row.original) }}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); void approveById(row.original) }}
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <RefreshCcw className="h-3 w-3" />
          </button>
        </div>
      ),
    }),
  ]
  const table = useReactTable({ data: paginatedRows, columns, getCoreRowModel: getCoreRowModel() })

  const selectRow = (row: CalendarRow) => {
    setSelected(row)
    setEditedIdea(row.idea)
    setEditedCaption(displayCaption(row.caption, ''))
    setEditedProduct('')
  }

  const approve = useCallback(async () => {
    if (!selected) return
    setSaving(true)
    try {
      await apiCall(`/api/posts/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          caption: editedCaption,
          approval_status: 'approved',
        }),
      })
      setSelected((prev) => prev ? { ...prev, caption: editedCaption, status: 'approved', approvalStatus: 'approved' } : prev)
      await mutate()
      await invalidatePostCaches()
      toast.success('Post approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve post')
    } finally {
      setSaving(false)
    }
  }, [selected, editedCaption, mutate, invalidatePostCaches])

  const approveById = useCallback(async (row: CalendarRow) => {
    setSaving(true)
    try {
      await apiCall(`/api/posts/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ approval_status: 'approved' }),
      })
      if (selected?.id === row.id) {
        setSelected((prev) => prev ? { ...prev, status: 'approved', approvalStatus: 'approved' } : prev)
      }
      await mutate()
      await invalidatePostCaches()
      toast.success('Post approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve post')
    } finally {
      setSaving(false)
    }
  }, [selected, mutate, invalidatePostCaches])

  const approveAll = useCallback(async () => {
    if (!filteredRows.length) return
    setBulkSaving(true)
    try {
      await Promise.all(
        filteredRows.map((row) =>
          apiCall(`/api/posts/${row.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ approval_status: 'approved' }),
          })
        )
      )
      await mutate()
      await invalidatePostCaches()
      toast.success('All posts approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve all posts')
    } finally {
      setBulkSaving(false)
    }
  }, [filteredRows, mutate, invalidatePostCaches])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'INPUT' || (event.target as HTMLElement)?.tagName === 'TEXTAREA') return
      if (event.key.toLowerCase() === 'a' && selected) {
        event.preventDefault()
        void approve()
      }
      if (event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        void approveAll()
      }
      if (event.key.toLowerCase() === 'g') {
        event.preventDefault()
        window.location.assign('/calendar/generate')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, approve, approveAll])

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="calendar"
        title="Review and approve your content"
        description="Review each planned post, edit captions, and approve items before creative generation."
      />
      <PageHeader
        variant="hero"
        title={<>Review content <span className="text-highlight">calendar</span></>}
        description="Review, refine, and approve your content ideas before scheduling."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                List view
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  viewMode === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Grid view
              </button>
            </div>
            <Link href="/calendar/generate">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate plan
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {(
          [
            { id: 'all' as const, label: 'All ideas' },
            { id: 'draft' as const, label: 'Draft' },
            { id: 'approved' as const, label: 'Approved' },
            { id: 'scheduled' as const, label: 'Scheduled' },
            { id: 'published' as const, label: 'Published' },
            { id: 'failed' as const, label: 'Failed' },
          ] as const
        ).map((tab) => {
          const count = tab.id === 'all' ? statusCounts.all : statusCounts[tab.id]
          const active = statusFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                active ? 'border-primary bg-primary/10 text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/70',
              )}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <SectionCard
            className="app-card-elevated"
            title="Content ideas"
            subtitle="Click a row to edit in the side panel."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px] max-w-[240px]">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ideas…"
                    className="h-9 w-full rounded-lg border border-border bg-background py-1 pl-8 pr-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="inline-flex rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                    aria-label="List"
                    onClick={() => setViewMode('table')}
                  >
                    <Rows3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                    aria-label="Grid"
                    onClick={() => setViewMode('calendar')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            }
          >
            {!hasApprovedOrScheduled && rows.length > 0 ? (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                No approved content yet. Approve one or more posts to unlock scheduling.
              </div>
            ) : null}
            {!data ? (
              <div className="space-y-2">
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
              </div>
            ) : null}
            {viewMode === 'table' ? (
              filteredRows.length === 0 ? (
                <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-muted/20 p-10 text-center">
                  <p className="text-sm font-medium text-foreground">No matching ideas</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try another tab or clear search.</p>
                </div>
              ) : (
                <>
                  <DataTableShell>
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className={cn('cursor-pointer', selected?.id === row.original.id && 'bv-row-selected')}
                          onClick={() => selectRow(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </DataTableShell>
                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {filteredRows.length === 0
                        ? 'No results'
                        : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filteredRows.length)} of ${filteredRows.length} results`}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="secondary" size="sm" className="h-8" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Previous
                      </Button>
                      <span className="text-foreground">
                        Page {page} of {Math.max(totalPages, 1)}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )
            ) : filteredRows.length === 0 ? (
              <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
                No ideas match this filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredRows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => selectRow(row)}
                    className="app-card-elevated border border-border/90 p-4 text-left"
                  >
                    <p className="text-xs text-muted-foreground">{row.day}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{row.idea}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{displayCaption(row.caption, '—')}</p>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <p className="text-xs text-muted-foreground">Shortcuts: A approve selected · Shift+A approve filtered page · G generate plan.</p>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/calendar/generate">
              <Button variant="secondary">Regenerate plan</Button>
            </Link>
            <Button onClick={approveAll} disabled={bulkSaving || filteredRows.length === 0}>
              {bulkSaving ? 'Approving…' : `Approve all filtered (${filteredRows.length})`}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:sticky xl:top-24">
          <div className="app-card-elevated rounded-[var(--radius-card-lg)] border border-border/80 p-4 shadow-[var(--shadow-card)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Summary</p>
            <div className="mt-3 flex items-center gap-4">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground"
                style={{
                  background: `conic-gradient(var(--primary) ${approvedPct}%, var(--muted) ${approvedPct}% 100%)`,
                }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-center text-[10px] leading-tight">
                  {rows.length}
                  <br />
                  total
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
                {(['approved', 'scheduled', 'draft', 'published', 'failed'] as const).map((k) => (
                  <li key={k} className="flex justify-between gap-2">
                    <span className="capitalize text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground">{statusCounts[k]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <NextStepCard
            dense
            title={hasApprovedOrScheduled ? 'Ready for scheduling' : 'Approve to continue'}
            reason={
              hasApprovedOrScheduled
                ? 'Approved content can move to the scheduler when you are ready.'
                : 'Approve ideas you want to produce, then generate assets from the content studio.'
            }
            primaryCta={
              hasApprovedOrScheduled
                ? { label: 'Open scheduler', href: '/scheduler' }
                : { label: 'Plan approval', href: '/calendar/review' }
            }
            secondaryCta={{ label: 'Generate plan', href: '/calendar/generate' }}
          />

          <SectionCard className="app-card-elevated h-fit" title="Post editor" subtitle="Selected row">
            {selected ? (
              <div className="space-y-3">
                <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  #{rows.findIndex((r) => r.id === selected.id) + 1} · {selected.platform}
                </p>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Idea</label>
                  <input
                    value={editedIdea}
                    disabled
                    className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Caption</label>
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="min-h-24 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Product</label>
                  <input
                    value={editedProduct}
                    onChange={(e) => setEditedProduct(e.target.value)}
                    placeholder="Optional"
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <Button className="w-full" onClick={approve} disabled={saving}>
                  <Check className="mr-2 h-4 w-4" />
                  {saving ? 'Approving…' : 'Approve'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select an idea from the list.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  )
}

