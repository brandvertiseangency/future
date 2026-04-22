'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { ChevronLeft, RotateCcw, Download, Check, Clock, Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')
async function getToken() { try { return (await getFirebaseAuth()?.currentUser?.getIdToken()) ?? null } catch { return null } }

interface Version {
  id: string
  version_number: number
  caption: string
  image_url?: string
  hashtags?: string[]
  feedback_note?: string
  created_at: string
}

interface Post {
  id: string
  caption: string
  image_url?: string
  platform: string
  hashtags?: string[]
  approval_status: string
  version_number: number
  created_at: string
}

export default function OutputDetailPage() {
  const router = useRouter()
  const { postId } = useParams<{ postId: string }>()
  const [feedback, setFeedback] = useState('')
  const [regenerating, setRegenerate] = useState(false)
  const [approving, setApproving] = useState(false)
  const [activeVersion, setActiveVersion] = useState<number | null>(null)

  const { data, mutate } = useSWR(
    `/api/posts/${postId}`,
    (u: string) => apiCall<{ post: Post; versions: Version[] }>(u),
    { revalidateOnFocus: false }
  )
  const post: Post | undefined = data?.post
  const versions: Version[] = data?.versions ?? []
  const displayVersion = versions.find(v => v.version_number === (activeVersion ?? post?.version_number)) ?? versions[0]

  const handleRegenerate = async () => {
    setRegenerate(true)
    try {
      const token = await getToken()
      await fetch(`${API_BASE}/api/posts/${postId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ feedback }),
      })
      setFeedback('')
      mutate()
    } catch (e: any) { alert(e.message) }
    finally { setRegenerate(false) }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const token = await getToken()
      await fetch(`${API_BASE}/api/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      mutate()
    } catch (e: any) { alert(e.message) }
    finally { setApproving(false) }
  }

  if (!post) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 size={22} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const isApproved = post.approval_status === 'approved'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 80px' }}>

      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', marginBottom: 22, fontSize: 12 }}>
        <ChevronLeft size={14} /> Back to Outputs
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20 }}>

        {/* Left — image */}
        <div>
          <div style={{
            aspectRatio: '1', borderRadius: 16, overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {displayVersion?.image_url
              ? <img src={displayVersion.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>No image</p>
                </div>
            }
          </div>

          {/* Version history */}
          {versions.length > 1 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Version history
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                {versions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVersion(v.version_number)}
                    style={{
                      width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
                      border: `1.5px solid ${(activeVersion ?? post.version_number) === v.version_number ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer', background: 'rgba(255,255,255,0.04)',
                      position: 'relative', padding: 0,
                    }}
                  >
                    {v.image_url
                      ? <img src={v.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>v{v.version_number}</span>
                    }
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 5,
              background: isApproved ? 'rgba(200,255,200,0.08)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isApproved ? 'rgba(200,255,200,0.2)' : 'rgba(255,255,255,0.1)'}`,
              color: isApproved ? 'rgba(200,255,200,0.7)' : 'rgba(255,255,255,0.35)',
              textTransform: 'capitalize',
            }}>
              {isApproved ? '✓ Approved' : post.approval_status}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
              v{displayVersion?.version_number ?? 1} · {post.platform}
            </span>
          </div>

          {/* Caption */}
          <div className="card-silver" style={{ borderRadius: 12, padding: '14px' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Caption</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {displayVersion?.caption ?? post.caption}
            </p>
          </div>

          {/* Hashtags */}
          {(displayVersion?.hashtags ?? post.hashtags ?? []).length > 0 && (
            <div className="card-silver" style={{ borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hashtags</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(displayVersion?.hashtags ?? post.hashtags ?? []).map((tag: string) => (
                  <span key={tag} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.07)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate */}
          <div className="card-silver" style={{ borderRadius: 12, padding: '14px' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Regenerate with feedback
            </p>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="What should change? e.g. more casual tone, different background..."
              rows={2}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8,
                padding: '8px 10px', color: 'rgba(255,255,255,0.7)', fontSize: 12,
                resize: 'none', outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{
                marginTop: 8, width: '100%', padding: '9px', borderRadius: 9,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {regenerating
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Regenerating...</>
                : <><RotateCcw size={13} /> Regenerate</>
              }
            </button>
          </div>

          {/* Approve / Download */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleApprove}
              disabled={isApproved || approving}
              className={!isApproved ? 'btn-silver' : ''}
              style={{
                flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                background: isApproved ? 'rgba(200,255,200,0.06)' : undefined,
                color: isApproved ? 'rgba(200,255,200,0.6)' : undefined,
                fontSize: 13, fontWeight: 600, cursor: isApproved ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Check size={14} />
              {isApproved ? 'Approved' : 'Approve'}
            </button>
            {post.image_url && (
              <a
                href={post.image_url}
                download
                style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Download size={14} color="rgba(255,255,255,0.4)" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
