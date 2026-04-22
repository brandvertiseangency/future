'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { ImageIcon, Download, RotateCcw } from 'lucide-react'

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

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20,
    background: active ? 'rgba(255,255,255,0.12)' : 'none',
    border: `1px solid ${active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
    fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
    textTransform: 'capitalize',
  })

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 400, color: '#fff', letterSpacing: '-0.025em', marginBottom: 4 }}>Outputs</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{posts.length} creatives generated</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {PLATFORM_FILTERS.map(p => (
          <button key={p} onClick={() => setPlatform(p)} style={filterBtnStyle(platform === p)}>
            {p === 'all' ? 'All platforms' : p}
          </button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', margin: '0 4px' }} />
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatus(s)} style={filterBtnStyle(status === s)}>
            {s === 'all' ? 'All statuses' : s}
          </button>
        ))}
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="card-silver" style={{ borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
          <ImageIcon size={28} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>No outputs yet</p>
          <button
            onClick={() => router.push('/calendar/generate')}
            className="btn-silver"
            style={{ marginTop: 16, padding: '10px 22px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Generate your first content
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {posts.map(post => (
            <OutputCard key={post.id} post={post} onClick={() => router.push(`/outputs/${post.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function OutputCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      className="card-silver"
      onClick={onClick}
      style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Image */}
      <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.03)', position: 'relative' }}>
        {post.image_url
          ? <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={24} color="rgba(255,255,255,0.1)" />
            </div>
        }
        {/* Status badge */}
        {post.approval_status === 'approved' && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(200,255,200,0.12)', border: '1px solid rgba(200,255,200,0.2)', color: 'rgba(200,255,200,0.7)',
          }}>approved</span>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {post.caption}
        </p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, textTransform: 'capitalize' }}>
          {post.platform} · {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
