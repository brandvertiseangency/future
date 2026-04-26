'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { Edit2, Trash2, CheckCircle2, Loader2, ChevronLeft, Check } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')
async function getToken() { try { return (await getFirebaseAuth()?.currentUser?.getIdToken()) ?? null } catch { return null } }

interface Slot {
  id: string
  slot_date: string
  day_of_week: string
  content_type: 'post' | 'reel' | 'carousel' | 'story'
  content_category: string
  post_idea: string
  creative_brief?: string
  platform: string
  status: string
}

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  post:     { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.14)', text: 'rgba(255,255,255,0.7)', label: 'Post' },
  reel:     { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.55)', label: 'Reel' },
  carousel: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)', label: 'Carousel' },
  story:    { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.4)', label: 'Story' },
}

function SlotCard({ slot, selected, onToggle, onDelete, onEdit }: {
  slot: Slot
  selected: boolean
  onToggle: () => void
  onDelete: () => void
  onEdit: (value: { post_idea?: string; creative_brief?: string }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [idea, setIdea] = useState(slot.post_idea)
  const [creativeBrief, setCreativeBrief] = useState(slot.creative_brief || '')
  const styles = TYPE_STYLES[slot.content_type] ?? TYPE_STYLES.post
  const date = new Date(slot.slot_date)
  const day = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className="card-silver"
      style={{
        borderRadius: 12, padding: '12px 14px',
        borderColor: selected ? 'rgba(255,255,255,0.22)' : undefined,
        position: 'relative', transition: 'border-color 0.15s',
      }}
    >
      {/* Select checkbox */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 18, height: 18, borderRadius: 5,
          background: selected ? 'linear-gradient(135deg,#fff,#c8c8c8)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${selected ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {selected && <Check size={10} color="#000" strokeWidth={3} />}
      </button>

      {/* Date */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{day} {dateStr}</span>
        <span style={{
          marginLeft: 6, fontSize: 9, padding: '2px 6px', borderRadius: 4,
          background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text,
        }}>
          {styles.label}
        </span>
      </div>

      {/* Idea */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            autoFocus
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onBlur={() => { onEdit({ post_idea: idea, creative_brief: creativeBrief }); setEditing(false) }}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 7, padding: '6px 8px', color: 'rgba(255,255,255,0.8)', fontSize: 12,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            rows={3}
          />
          <textarea
            value={creativeBrief}
            onChange={e => setCreativeBrief(e.target.value)}
            onBlur={() => { onEdit({ post_idea: idea, creative_brief: creativeBrief }); setEditing(false) }}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 7, padding: '6px 8px', color: 'rgba(255,255,255,0.65)', fontSize: 11.5,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            rows={3}
            placeholder="Creative brief (composition, lighting, product placement...)"
          />
        </div>
      ) : (
        <div style={{ marginBottom: 8, paddingRight: 24 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, marginBottom: slot.creative_brief ? 6 : 0 }}>
            {idea}
          </p>
          {slot.creative_brief && (
            <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
              {slot.creative_brief}
            </p>
          )}
        </div>
      )}

      {/* Platform + category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{slot.platform}</span>
        {slot.content_category && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>· {slot.content_category}</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <button onClick={() => setEditing(true)} style={iconBtnStyle}>
          <Edit2 size={11} color="rgba(255,255,255,0.3)" />
        </button>
        <button onClick={onDelete} style={iconBtnStyle}>
          <Trash2 size={11} color="rgba(244,100,100,0.5)" />
        </button>
      </div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer',
}

function CalendarReviewInner() {
  const router = useRouter()
  const params = useSearchParams()
  const planId = params.get('planId')

  const { data: planData, mutate } = useSWR(
    planId ? `/api/calendar/plans/${planId}` : null,
    (u: string) => apiCall<any>(u),
    { revalidateOnFocus: false }
  )

  const plan = planData?.plan ?? planData
  const allSlots: Slot[] = planData?.slots ?? []
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string, { post_idea?: string; creative_brief?: string }>>({})
  const [approving, setApproving] = useState(false)

  const slots = allSlots.filter(s => !deletedIds.has(s.id))
  const approvedCount = selected.size === 0 ? slots.length : selected.size
  const creditsNeeded = approvedCount * 2

  const toggleAll = () => {
    if (selected.size === slots.length) setSelected(new Set())
    else setSelected(new Set(slots.map(s => s.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  // Group by date
  const byDate: Record<string, Slot[]> = {}
  slots.forEach(s => {
    const d = s.slot_date.split('T')[0]
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(s)
  })

  const handleApprove = async () => {
    setApproving(true)
    try {
      const slotIds = selected.size > 0 ? Array.from(selected) : slots.map(s => s.id)
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/calendar/plans/${planId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ selectedSlotIds: slotIds, slotEdits: edits }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { jobId } = await res.json()
      router.push(`/generate/queue?jobId=${jobId}`)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setApproving(false)
    }
  }

  if (!planData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 size={24} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', marginBottom: 10, fontSize: 12 }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Review your calendar
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {slots.length} posts planned · Edit or remove any before approving
          </p>
        </div>

        {/* Approve CTA */}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleApprove}
            disabled={approving || slots.length === 0}
            className={!approving && slots.length > 0 ? 'btn-silver' : ''}
            style={{
              padding: '11px 22px', borderRadius: 11, border: 'none',
              background: approving || slots.length === 0 ? 'rgba(255,255,255,0.06)' : undefined,
              color: approving || slots.length === 0 ? 'rgba(255,255,255,0.2)' : '#000',
              fontSize: 13, fontWeight: 600, cursor: approving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            {approving
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Starting...</>
              : <><CheckCircle2 size={14} /> Approve & Generate ({creditsNeeded} credits)</>
            }
          </button>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 5 }}>
            {selected.size === 0 ? 'All posts selected' : `${selected.size} selected`}
          </p>
        </div>
      </div>

      {/* Select all */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button
          onClick={toggleAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'rgba(255,255,255,0.4)',
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            background: selected.size === slots.length ? 'linear-gradient(135deg,#fff,#c8c8c8)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selected.size === slots.length && <Check size={9} color="#000" strokeWidth={3} />}
          </div>
          {selected.size === slots.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Grid by date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
          <div key={date}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
              {dateSlots.map(slot => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  selected={selected.size === 0 || selected.has(slot.id)}
                  onToggle={() => toggleOne(slot.id)}
                  onDelete={() => setDeletedIds(prev => new Set([...prev, slot.id]))}
                  onEdit={(value) => setEdits(prev => ({ ...prev, [slot.id]: { ...(prev[slot.id] || {}), ...value } }))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CalendarReviewPage() {
  return <Suspense><CalendarReviewInner /></Suspense>
}
