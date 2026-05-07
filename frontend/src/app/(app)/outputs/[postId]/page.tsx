'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { ChevronLeft, RotateCcw, Download, Check, Loader2 } from 'lucide-react'
import { PageContainer, PageHeader, SurfaceCard } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { displayCaption } from '@/lib/caption'
import { cn } from '@/lib/utils'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

async function getToken() {
  try {
    return (await getFirebaseAuth()?.currentUser?.getIdToken()) ?? null
  } catch {
    return null
  }
}

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

  const { data, mutate } = useSWR(`/api/posts/${postId}`, (u: string) => apiCall<{ post: Post; versions: Version[] }>(u), {
    revalidateOnFocus: false,
  })
  const post: Post | undefined = data?.post
  const versions: Version[] = data?.versions ?? []
  const displayVersion = versions.find((v) => v.version_number === (activeVersion ?? post?.version_number)) ?? versions[0]

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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to regenerate')
    } finally {
      setRegenerate(false)
    }
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve')
    } finally {
      setApproving(false)
    }
  }

  if (!post) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </PageContainer>
    )
  }

  const isApproved = post.approval_status === 'approved'
  const activeVer = activeVersion ?? post.version_number
  const tags = displayVersion?.hashtags ?? post.hashtags ?? []

  return (
    <PageContainer className="max-w-5xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} /> Back to outputs
      </button>

      <PageHeader
        variant="compact"
        title={<>Output <span className="text-pull text-primary">detail</span></>}
        description={`${post.platform} · Version ${displayVersion?.version_number ?? 1}`}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-4">
          <div className="app-card-elevated aspect-square overflow-hidden rounded-[var(--radius-card-lg)] border border-border/80 bg-muted shadow-[var(--shadow-card)]">
            {displayVersion?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayVersion.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <p className="max-w-[240px] text-sm text-muted-foreground">
                  Image generation failed for this version. Try regenerate with feedback.
                </p>
              </div>
            )}
          </div>

          {versions.length > 1 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Version history</p>
              <div className="flex flex-wrap gap-2">
                {versions.map((v) => {
                  const sel = activeVer === v.version_number
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveVersion(v.version_number)}
                      className={cn(
                        'relative h-11 w-11 overflow-hidden rounded-lg border-2 bg-muted/50 transition-colors',
                        sel ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40',
                      )}
                    >
                      {v.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] font-medium text-muted-foreground">v{v.version_number}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                isApproved
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-border bg-muted/50 text-muted-foreground',
              )}
            >
              {isApproved ? 'Approved' : post.approval_status}
            </span>
          </div>

          <SurfaceCard className="app-card-elevated p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Caption</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {displayCaption(displayVersion?.caption ?? post.caption, 'No caption')}
            </p>
          </SurfaceCard>

          {tags.length > 0 && (
            <SurfaceCard className="app-card-elevated p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard className="app-card-elevated p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Regenerate with feedback</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What should change? e.g. more casual tone, different background…"
              rows={3}
              className="min-h-[72px] w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <Button type="button" variant="secondary" className="mt-3 w-full" onClick={() => void handleRegenerate()} disabled={regenerating}>
              {regenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating…
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </SurfaceCard>

          <div className="flex gap-2">
            <Button className="min-h-11 flex-1" onClick={() => void handleApprove()} disabled={isApproved || approving}>
              <Check className="mr-2 h-4 w-4" />
              {isApproved ? 'Approved' : approving ? 'Saving…' : 'Approve'}
            </Button>
            {(displayVersion?.image_url || post.image_url) && (
              <a
                href={displayVersion?.image_url || post.image_url}
                download
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
