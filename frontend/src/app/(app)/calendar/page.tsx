'use client'

import { useMemo, useState } from 'react'
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Check, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { apiCall } from '@/lib/api'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard, StatusBadge } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CalendarRow = {
  id: string
  day: string
  type: string
  idea: string
  caption: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  platform: string
}

const fetcher = (url: string) => apiCall<{ posts?: Array<{ id: string; title?: string; content_type?: string; caption?: string; status?: CalendarRow['status']; platform?: string; scheduled_at?: string }> }>(url)

export default function CalendarPage() {
  const { data } = useSWR('/api/posts/scheduled?week=current', fetcher, { revalidateOnFocus: false })
  const [selected, setSelected] = useState<CalendarRow | null>(null)
  const [editedIdea, setEditedIdea] = useState('')
  const [editedCaption, setEditedCaption] = useState('')
  const [editedProduct, setEditedProduct] = useState('')
  const [saving, setSaving] = useState(false)

  const rows: CalendarRow[] = useMemo(() => {
    return (data?.posts ?? []).map((post) => ({
      id: post.id,
      day: post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'TBD',
      type: post.content_type ?? 'post',
      idea: post.title ?? 'Untitled idea',
      caption: post.caption ?? '',
      status: post.status ?? 'draft',
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
        <StatusBadge tone={info.getValue() === 'published' ? 'success' : 'neutral'}>
          {info.getValue()}
        </StatusBadge>
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
          title: editedIdea,
          caption: editedCaption,
          status: 'approved',
        }),
      })
      setSelected((prev) => prev ? { ...prev, idea: editedIdea, caption: editedCaption, status: 'published' } : prev)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Content Calendar"
        description="Review ideas, edit captions, and approve content before generation."
        actions={
          <Link href="/calendar/generate">
            <Button><Sparkles className="mr-2 h-4 w-4" />Generate Calendar</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <SectionCard title="Weekly Plan" subtitle="Click a row to edit details on the right panel.">
          <div className="overflow-x-auto">
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
          </div>
        </SectionCard>

        <SectionCard title="Post Editor" subtitle="Update and approve selected item.">
          {selected ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Idea</label>
                <input value={editedIdea} onChange={(e) => setEditedIdea(e.target.value)} className="h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#111111]" />
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
        <Button variant="secondary">Regenerate</Button>
        <Button>Approve All</Button>
      </div>
    </PageContainer>
  )
}

