'use client'

import { useMemo, useState } from 'react'
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Check, Sparkles, RefreshCcw, Pencil } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { toast } from 'sonner'

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

function getEffectiveStatus(status?: CalendarRow['status'], approvalStatus?: CalendarRow['approvalStatus']): CalendarRow['status'] {
  if (status === 'published' || status === 'scheduled') return status
  if (approvalStatus === 'approved' || status === 'approved') return 'approved'
  return status ?? 'draft'
}

export default function CalendarPage() {
  const { data, mutate } = useSWR('/api/posts?limit=100', fetcher, { revalidateOnFocus: false })
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  const [selected, setSelected] = useState<CalendarRow | null>(null)
  const [editedIdea, setEditedIdea] = useState('')
  const [editedCaption, setEditedCaption] = useState('')
  const [editedProduct, setEditedProduct] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)

  const rows: CalendarRow[] = useMemo(() => {
    return (data?.posts ?? []).map((post) => ({
      id: post.id,
      day: post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'TBD',
      type: post.content_type ?? 'post',
      idea: post.title ?? 'Untitled idea',
      caption: post.caption ?? '',
      status: getEffectiveStatus(post.status, post.approval_status),
      approvalStatus: post.approval_status ?? 'pending',
      platform: post.platform ?? 'instagram',
    }))
  }, [data?.posts])

  const columnHelper = createColumnHelper<CalendarRow>()
  const columns = [
    columnHelper.accessor('day', { header: 'Day', cell: (info) => <span className="text-sm text-[#6B7280]">{info.getValue()}</span> }),
    columnHelper.accessor('type', { header: 'Type', cell: (info) => <span className="capitalize text-sm text-[#111111]">{info.getValue()}</span> }),
    columnHelper.accessor('idea', { header: 'Idea', cell: (info) => <span className="text-sm text-[#111111]">{info.getValue()}</span> }),
    columnHelper.accessor('caption', { header: 'Caption', cell: (info) => <span className="line-clamp-1 text-sm text-[#6B7280]">{info.getValue()}</span> }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <StatusBadge tone={info.getValue() === 'published' || info.getValue() === 'approved' ? 'success' : 'neutral'}>
          {info.getValue()}
        </StatusBadge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            className="rounded border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#6B7280] hover:bg-[#F3F4F6]"
            onClick={(e) => { e.stopPropagation(); selectRow(row.original) }}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            className="rounded border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#6B7280] hover:bg-[#F3F4F6]"
            onClick={(e) => { e.stopPropagation(); void approveById(row.original) }}
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            className="rounded border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#6B7280] hover:bg-[#F3F4F6]"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <RefreshCcw className="h-3 w-3" />
          </button>
        </div>
      ),
    }),
  ]
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

  const selectRow = (row: CalendarRow) => {
    setSelected(row)
    setEditedIdea(row.idea)
    setEditedCaption(row.caption)
    setEditedProduct('')
  }

  const approve = async () => {
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
      toast.success('Post approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve post')
    } finally {
      setSaving(false)
    }
  }

  const approveById = async (row: CalendarRow) => {
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
      toast.success('Post approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve post')
    } finally {
      setSaving(false)
    }
  }

  const approveAll = async () => {
    if (!rows.length) return
    setBulkSaving(true)
    try {
      await Promise.all(
        rows.map((row) =>
          apiCall(`/api/posts/${row.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ approval_status: 'approved' }),
          })
        )
      )
      await mutate()
      toast.success('All posts approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve all posts')
    } finally {
      setBulkSaving(false)
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="calendar"
        title="Review and approve your content"
        description="Review each planned post, edit captions, and approve items before creative generation."
      />
      <PageHeader
        title={<>Content <span className="text-highlight">Calendar</span></>}
        description="Review ideas, edit captions, and approve content before generation."
        actions={
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[#E5E7EB] p-1">
              <button onClick={() => setViewMode('table')} className={cn('rounded px-2 py-1 text-xs', viewMode === 'table' ? 'bg-[#111111] text-white' : 'text-[#6B7280]')}>Table</button>
              <button onClick={() => setViewMode('calendar')} className={cn('rounded px-2 py-1 text-xs', viewMode === 'calendar' ? 'bg-[#111111] text-white' : 'text-[#6B7280]')}>Calendar</button>
            </div>
            <Link href="/calendar/generate">
              <Button><Sparkles className="mr-2 h-4 w-4" />Generate Calendar</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Weekly Plan" subtitle="Click a row to edit details on the right panel." className="xl:sticky xl:top-20">
          {!data ? (
            <div className="space-y-2">
              <SkeletonCard lines={4} />
              <SkeletonCard lines={4} />
            </div>
          ) : null}
          {viewMode === 'table' ? <div className="overflow-x-auto">
            {rows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E5E7EB] p-8 text-center">
                <p className="text-sm font-medium text-[#111111]">No content yet</p>
                <p className="mt-1 text-xs text-[#6B7280]">Generate your first calendar to begin approvals.</p>
                <Link href="/calendar/generate" className="mt-3 inline-block"><Button size="sm">Generate Calendar</Button></Link>
              </div>
            ) : null}
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="border-b border-[#E5E7EB] px-3 py-2 text-left text-xs font-medium text-[#6B7280]">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn('cursor-pointer hover:bg-[#F7F7F8]', selected?.id === row.original.id && 'bg-[#F3F4F6]')}
                    onClick={() => selectRow(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border-b border-[#F3F4F6] px-3 py-3 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div> : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <button key={row.id} onClick={() => selectRow(row)} className="rounded-lg border border-[#E5E7EB] p-3 text-left hover:bg-[#F7F7F8]">
                  <p className="text-xs text-[#6B7280]">{row.day}</p>
                  <p className="mt-1 text-sm font-medium text-[#111111]">{row.idea}</p>
                  <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{row.caption}</p>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Post Editor" subtitle="Update and approve selected item." className="xl:sticky xl:top-20 h-fit">
          {selected ? (
            <div className="space-y-3">
              <p className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] px-3 py-2 text-xs text-[#6B7280]">Editing Post #{rows.findIndex((r) => r.id === selected.id) + 1}</p>
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Idea</label>
                <input value={editedIdea} disabled className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] px-3 text-sm text-[#6B7280]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Caption</label>
                <textarea value={editedCaption} onChange={(e) => setEditedCaption(e.target.value)} className="min-h-24 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#111111]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Product</label>
                <input value={editedProduct} onChange={(e) => setEditedProduct(e.target.value)} placeholder="Select product name" className="h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#111111]" />
              </div>
              <Button className="w-full" onClick={approve} disabled={saving}>
                <Check className="mr-2 h-4 w-4" />
                {saving ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">Select a row from the calendar table to edit content.</p>
          )}
        </SectionCard>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link href="/calendar/generate">
          <Button variant="secondary">Regenerate</Button>
        </Link>
        <Button onClick={approveAll} disabled={bulkSaving}>
          {bulkSaving ? 'Approving...' : 'Approve All'}
        </Button>
      </div>
    </PageContainer>
  )
}

