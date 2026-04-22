'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { apiCall } from '@/lib/api'

interface Post { id: string; caption: string; image_url?: string; platform: string; created_at: string }

export function RecentOutputs() {
  const router = useRouter()
  const { data } = useSWR(
    '/api/posts?limit=6&status=approved',
    (url: string) => apiCall<{ posts: Post[] }>(url),
    { revalidateOnFocus: false }
  )
  const posts: Post[] = (data as any)?.posts ?? []

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
          Recent Outputs
        </p>
        {posts.length > 0 && (
          <button
            onClick={() => router.push('/outputs')}
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View all →
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="card-silver" style={{
          borderRadius: 14, padding: '28px 24px',
          textAlign: 'center',
        }}>
          <ImageIcon size={22} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>No outputs yet</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>
            Generate your first content to see it here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => router.push(`/outputs/${post.id}`)}
              style={{
                aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer', transition: 'border-color 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              {post.image_url ? (
                <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={16} color="rgba(255,255,255,0.15)" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
