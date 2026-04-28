'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { ImageIcon, Sparkles, Download, Pencil, Trash2, CalendarDays, Check, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { PageContainer, PageHeader, EmptyState } from '@/components/ui/page-primitives'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

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

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c', linkedin: '#0077b5', twitter: '#94a3b8',
  tiktok: '#ff0050', facebook: '#1877f2',
}

export default function OutputsPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')

  const query = new URLSearchParams({ limit: '50' })
  if (platform !== 'all') query.set('platform', platform)
  if (status !== 'all') query.set('status', status)

  const swrKey = `/api/posts?${query}`
  const { data } = useSWR(swrKey, (u: string) => apiCall<any>(u), { revalidateOnFocus: false })
  const posts: Post[] = data?.posts ?? []

  return (
    <PageContainer className="max-w-[1100px] pb-20">
      <PageHeader title="Outputs" description={`${posts.length} creatives generated`} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-7">
        <div className="flex items-center gap-1.5 flex-wrap">
          {PLATFORM_FILTERS.map(p => (
            <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
              {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
            </FilterPill>
          ))}
        </div>
        <div className="w-px h-5 bg-white/[0.07] mx-1" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterPill>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="No outputs yet"
          subtitle="Generate your first content to see it here"
          action={
            <button
              onClick={() => router.push('/generate')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-black transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#ffffff 0%,#d0d0d0 100%)' }}
            >
              <Sparkles size={12} /> Generate Content
            </button>
          }
        />
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <OutputCard post={post} swrKey={swrKey} />
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-all duration-150 border', active ? 'bg-white/[0.12] border-white/[0.25] text-white' : 'bg-transparent border-white/[0.07] text-white/35 hover:text-white/60 hover:border-white/[0.14]')}>
      {children}
    </button>
  )
}

function OutputCard({ post, swrKey }: { post: Post; swrKey: string }) {
  const platformColor = PLATFORM_COLORS[post.platform?.toLowerCase()] ?? 'rgba(255,255,255,0.5)'
  const isApproved = post.approval_status === 'approved' || post.status === 'approved'
  const imageMissing = !post.image_url
  const [editingCaption, setEditingCaption] = useState(false)
  const [caption, setCaption] = useState(post.caption)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveCaption = async () => {
    setSaving(true)
    try {
      await apiCall(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify({ caption }) })
      mutate(swrKey)
      toast.success('Caption updated')
      setEditingCaption(false)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await apiCall(`/api/posts/${post.id}`, { method: 'DELETE' })
      mutate(swrKey)
      toast.success('Post deleted')
    } catch { toast.error('Delete failed') }
    finally { setShowDeleteConfirm(false) }
  }

  const handleSchedule = async () => {
    try {
      await apiCall(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'scheduled' }) })
      mutate(swrKey)
      toast.success('Moved to scheduled')
    } catch { toast.error('Failed to schedule') }
  }

  const handleApprove = async () => {
    try {
      await apiCall(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved', approval_status: 'approved' }) })
      mutate(swrKey)
      toast.success('Post approved')
    } catch { toast.error('Failed to approve') }
  }

  const handleDownload = () => {
    if (!post.image_url) return toast.error('No image to download')
    const a = document.createElement('a')
    a.href = post.image_url
    a.download = `brandvertise-${post.platform}-${post.id}.jpg`
    a.target = '_blank'
    a.rel = 'noreferrer'
    a.click()
  }

  return (
    <>
    <div className="group rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] transition-all duration-200 hover:border-white/[0.18] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Image */}
      <div className="aspect-square relative bg-white/[0.03] overflow-hidden">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ImageIcon size={28} className="text-white/10" /></div>
        )}
        {/* Status badge */}
        <span className={cn('absolute top-2.5 left-2.5 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border',
          imageMissing ? 'bg-rose-500/15 border-rose-500/25 text-rose-400'
          : isApproved ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
          : post.status === 'scheduled' ? 'bg-blue-500/15 border-blue-500/25 text-blue-400'
          : 'bg-white/[0.06] border-white/[0.10] text-white/35')}>
          {imageMissing ? 'image failed' : isApproved ? 'approved' : post.status}
        </span>
        {/* Platform badge */}
        <span className="absolute top-2.5 right-2.5 text-[9px] font-semibold capitalize px-2 py-0.5 rounded-md" style={{ background: `${platformColor}25`, color: platformColor, border: `1px solid ${platformColor}40` }}>
          {post.platform}
        </span>
        {/* Hover overlay — quick actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
          <div className="flex items-center gap-1.5">
            {[
              { icon: Download, label: 'Download', fn: handleDownload, color: 'white', disabled: imageMissing },
              { icon: CalendarDays, label: 'Schedule', fn: handleSchedule, color: '#60a5fa' },
              { icon: Check, label: 'Approve', fn: handleApprove, color: '#34d399' },
              { icon: Trash2, label: 'Delete', fn: () => setShowDeleteConfirm(true), color: '#f87171' },
            ].map(({ icon: Icon, label, fn, color, disabled }) => (
              <button key={label} title={disabled ? `${label} unavailable` : label} onClick={fn} disabled={disabled}
                className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center hover:bg-black/80 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <Icon size={13} style={{ color }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Caption area */}
      <div className="p-3 border-t border-white/[0.05]">
        <AnimatePresence mode="wait">
          {editingCaption ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <textarea
                autoFocus
                rows={3}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-2.5 py-2 text-white/80 text-[11.5px] resize-none focus:outline-none focus:border-white/[0.25] transition-all"
              />
              <div className="flex gap-1.5">
                <button onClick={handleSaveCaption} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-white/90 transition-all disabled:opacity-50">
                  {saving ? '...' : <><Check size={11} />Save</>}
                </button>
                <button onClick={() => { setEditingCaption(false); setCaption(post.caption) }}
                  className="w-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.10] transition-all">
                  <X size={12} className="text-white/40" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-[11.5px] text-white/55 leading-[1.5] line-clamp-2 mb-2.5">{caption || post.caption}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingCaption(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all text-[11px] font-medium flex-1">
                  <Pencil size={11} />Edit
                </button>
                <button onClick={handleDownload} title={imageMissing ? 'Download unavailable' : 'Download'} disabled={imageMissing}
                  className="w-8 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-35 disabled:cursor-not-allowed">
                  <Download size={12} />
                </button>
                <button onClick={handleSchedule} title="Schedule"
                  className="w-8 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                  <CalendarDays size={12} />
                </button>
                <button onClick={handleApprove} title="Approve"
                  className="w-8 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                  <Check size={12} />
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} title="Delete"
                  className="w-8 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-[10px] text-white/20 mt-2">
          {new Date(post.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
    <ConfirmDialog
      open={showDeleteConfirm}
      title="Delete this post?"
      description="This action cannot be undone."
      confirmLabel="Delete"
      tone="danger"
      onCancel={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
    />
    </>
  )
}
