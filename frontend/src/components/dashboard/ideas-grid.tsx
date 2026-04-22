'use client'

import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'

const IDEAS = [
  { label: 'Write me a carousel post', desc: 'Educational carousel for this week', emoji: '🎨' },
  { label: 'Plan next month content', desc: 'Full calendar with mix & cadence', emoji: '📅' },
  { label: 'Write a promotional caption', desc: 'Conversion-focused post copy', emoji: '✍️' },
  { label: 'Analyse my brand voice', desc: 'Deep dive on tone & personality', emoji: '🔍' },
]

export function IdeasGrid({ brand }: { brand: any }) {
  const router = useRouter()
  const brandName = brand?.name ?? 'your brand'

  const handleIdea = (label: string) => {
    // Calendar intents route to calendar
    if (/plan|calendar|month/i.test(label)) {
      router.push('/calendar/generate?brief=' + encodeURIComponent(label))
      return
    }
    // Others open chat — store in session for BrandChat to pick up
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bv_chat_prefill', label + ` for ${brandName}`)
    }
    router.push('/dashboard')
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.22)', marginBottom: 10,
      }}>
        Ideas to get started
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {IDEAS.map(({ label, desc, emoji }) => (
          <button
            key={label}
            onClick={() => handleIdea(label)}
            className="card-silver"
            style={{
              borderRadius: 12, padding: '12px 14px',
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 6,
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3, marginBottom: 3 }}>
                {label}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>
                {desc}
              </p>
            </div>
            <ArrowUpRight
              size={11}
              style={{ position: 'absolute', top: 10, right: 10, color: 'rgba(255,255,255,0.2)' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
