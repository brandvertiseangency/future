'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ImageIcon, ArrowRight } from 'lucide-react'
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20">
          Recent Outputs
        </p>
        {posts.length > 0 && (
          <button
            onClick={() => router.push('/outputs')}
            className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
          >
            View all <ArrowRight size={10} />
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="bento-card rounded-2xl p-8 text-center">
          <ImageIcon size={20} className="text-white/10 mx-auto mb-3" />
          <p className="text-[13px] text-white/25 mb-1">No outputs yet</p>
          <p className="text-[11px] text-white/15">Generate your first content to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => router.push(`/outputs/${post.id}`)}
              className="aspect-square rounded-xl overflow-hidden border border-white/[0.07] bg-white/[0.03]
                         cursor-pointer transition-all hover:border-white/[0.20] hover:-translate-y-0.5 group"
            >
              {post.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image_url} alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={14} className="text-white/15" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
