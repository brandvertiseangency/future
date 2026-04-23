'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { ImageIcon, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Post {
  id: string
  caption: string
  image_url?: string
  platform: string
  status: string
  hashtags?: string[]
  created_at: string
  approval_status?: string
}

const PLATFORM_FILTERS = ['all', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook']
const STATUS_FILTERS = ['all', 'draft', 'approved', 'scheduled']

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  linkedin: '#0077b5',
  twitter: '#94a3b8',
  tiktok: '#ff0050',
  facebook: '#1877f2',
}

export default function OutputsPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')

  const query = new URLSearchParams({ limit: '50' })
  if (platform !== 'all') query.set('platform', platform)
  if (status !== 'all') query.set('status', status)

  const { data } = useSWR(
    `/api/posts?${query}`,
    (u: string) => apiCall<any>(u),
    { revalidateOnFocus: false }
  )
  const posts: Post[] = data?.posts ?? []

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-20">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-white mb-1">Outputs</h1>
        <p className="text-[13px] text-white/35">{posts.length} creatives generated</p>
      </div>

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

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4">
            <ImageIcon size={20} className="text-white/20" />
          </div>
          <p className="text-[14px] font-medium text-white/40 mb-1">No outputs yet</p>
          <p className="text-[12px] text-white/20 mb-5">Generate your first content to see it here</p>
          <button
            onClick={() => router.push('/generate')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-black transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #d0d0d0 100%)' }}
          >
            <Sparkles size={12} />
            Generate Content
          </button>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <OutputCard post={post} onClick={() => router.push(`/outputs/${post.id}`)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-all duration-150 border',
        active
          ? 'bg-white/[0.12] border-white/[0.25] text-white'
          : 'bg-transparent border-white/[0.07] text-white/35 hover:text-white/60 hover:border-white/[0.14]'
      )}
    >
      {children}
    </button>
  )
}

function OutputCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const platformColor = PLATFORM_COLORS[post.platform?.toLowerCase()] ?? 'rgba(255,255,255,0.5)'
  const isApproved = post.approval_status === 'approved' || post.status === 'approved'

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] cursor-pointer transition-all duration-200 hover:border-white/[0.18] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="aspect-square relative bg-white/[0.03] overflow-hidden">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-white/10" />
          </div>
        )}
        {post.status && (
          <span className={cn(
            'absolute top-2.5 right-2.5 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border',
            isApproved
              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
              : post.status === 'scheduled'
              ? 'bg-white/[0.08] border-white/[0.14] text-white/50'
              : 'bg-white/[0.06] border-white/[0.10] text-white/35'
          )}>
            {isApproved ? 'approved' : post.status}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[12px] text-white/60 leading-[1.5] line-clamp-2 mb-2.5">{post.caption}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] font-medium capitalize" style={{ color: platformColor }}>{post.platform}</span>
          <span className="text-white/15 text-[10px]">·</span>
          <span className="text-[10.5px] text-white/25">
            {new Date(post.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}
