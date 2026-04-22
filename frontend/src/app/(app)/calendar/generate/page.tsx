'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Sparkles, Loader2, ChevronLeft } from 'lucide-react'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

async function getToken() {
  try { return (await getFirebaseAuth()?.currentUser?.getIdToken()) ?? null } catch { return null }
}

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 2).padStart(2, '0')}`
}

const PLAN_LIMITS: Record<string, number> = { free: 12, pro: 30, agency: 60 }

const MIX_LABELS: Record<string, string> = {
  promotional: 'Promotional',
  educational: 'Educational',
  testimonial: 'Testimonial',
  bts: 'Behind the Scenes',
  festive: 'Festive / Seasonal',
}

function ContentMixSliders({
  mix, onChange,
}: {
  mix: Record<string, number>
  onChange: (m: Record<string, number>) => void
}) {
  const total = Object.values(mix).reduce((a, b) => a + b, 0)

  const update = (key: string, val: number) => {
    const next = { ...mix, [key]: val }
    onChange(next)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={labelStyle}>Content Mix</label>
        <span style={{ fontSize: 11, color: total === 100 ? 'rgba(200,255,200,0.6)' : 'rgba(244,100,100,0.8)' }}>
          {total}% {total === 100 ? '✓' : `(must = 100%)`}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(mix).map(([key, val]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{MIX_LABELS[key] ?? key}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontVariantNumeric: 'tabular-nums' }}>{val}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5} value={val}
              onChange={e => update(key, Number(e.target.value))}
              style={{ width: '100%', accentColor: 'rgba(255,255,255,0.7)' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)',
  letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.09)',
  color: 'rgba(255,255,255,0.85)', fontSize: 13, width: '100%',
  outline: 'none', transition: 'border-color 0.15s',
}

function CalendarGenerateInner() {
  const router = useRouter()
  const params = useSearchParams()

  const { data: brandData } = useSWR('/api/brands/current', (u: string) => apiCall<any>(u), { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', (u: string) => apiCall<{ balance: number }>(u), { revalidateOnFocus: false })

  const brand = brandData?.brand ?? brandData
  const credits = creditsData?.balance ?? 0

  const [month, setMonth] = useState(getCurrentMonth())
  const [postCount, setPostCount] = useState(16)
  const [mix, setMix] = useState({ promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const plan = brand?.plan ?? 'free'
  const maxPosts = PLAN_LIMITS[plan] ?? 12
  const creditsNeeded = postCount * 2
  const hasCredits = credits >= creditsNeeded
  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0)
  const canGenerate = hasCredits && mixTotal === 100 && !generating

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/calendar/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ month, postCount, mixPreferences: mix }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { planId } = await res.json()
      router.push(`/calendar/review?planId=${planId}`)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* Header */}
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', marginBottom: 24, fontSize: 13 }}
      >
        <ChevronLeft size={15} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={13} color="rgba(255,255,255,0.6)" />
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Content Calendar
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 400, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Plan your content
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 32, lineHeight: 1.5 }}>
        AI will create a full month of post ideas using your Brand DNA.
        You review and approve before anything is generated.
      </p>

      {/* Form card */}
      <div className="card-silver" style={{ borderRadius: 16, padding: '24px' }}>

        {/* Month */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Month</label>
          <input
            type="month" value={month}
            onChange={e => setMonth(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
          />
        </div>

        {/* Post count slider */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={labelStyle}>How many posts?</label>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {postCount}
            </span>
          </div>
          <input
            type="range" min={4} max={maxPosts} step={1} value={postCount}
            onChange={e => setPostCount(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'rgba(255,255,255,0.7)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>4 min</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{maxPosts} max ({plan})</span>
          </div>
        </div>

        {/* Content mix */}
        <ContentMixSliders mix={mix} onChange={(m) => setMix(m as typeof mix)} />
      </div>

      {/* Credits summary */}
      <div style={{
        marginTop: 16, padding: '13px 16px', borderRadius: 12,
        background: hasCredits ? 'rgba(255,255,255,0.03)' : 'rgba(244,63,94,0.06)',
        border: `1px solid ${hasCredits ? 'rgba(255,255,255,0.08)' : 'rgba(244,63,94,0.25)'}`,
      }}>
        <p style={{ fontSize: 13, color: hasCredits ? 'rgba(255,255,255,0.5)' : 'rgba(244,100,100,0.9)' }}>
          {hasCredits
            ? `Will use ${creditsNeeded} credits — ${credits - creditsNeeded} remaining after`
            : `Not enough credits. Need ${creditsNeeded}, have ${credits}.`}
        </p>
      </div>

      {error && (
        <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(244,100,100,0.8)' }}>{error}</p>
      )}

      {/* CTA */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={canGenerate ? 'btn-silver' : ''}
        style={{
          marginTop: 16, width: '100%', padding: '14px',
          borderRadius: 12, border: 'none',
          background: canGenerate ? undefined : 'rgba(255,255,255,0.05)',
          color: canGenerate ? '#000' : 'rgba(255,255,255,0.2)',
          fontSize: 14, fontWeight: 600,
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {generating
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Planning calendar...</>
          : <><Sparkles size={15} /> Generate Content Plan</>
        }
      </button>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
        Credits charged only after you approve & confirm
      </p>
    </div>
  )
}

export default function CalendarGeneratePage() {
  return (
    <Suspense>
      <CalendarGenerateInner />
    </Suspense>
  )
}
