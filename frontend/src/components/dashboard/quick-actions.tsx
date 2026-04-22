'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, CalendarDays, Images, Upload } from 'lucide-react'

const ACTIONS = [
  { icon: CalendarDays, label: 'Generate Calendar', desc: 'Plan a full month', href: '/calendar/generate' },
  { icon: Sparkles,     label: 'Quick Generate',    desc: 'Single post now',   href: '/generate' },
  { icon: Images,       label: 'View Outputs',      desc: 'Browse creatives',  href: '/outputs' },
  { icon: Upload,       label: 'Upload Assets',     desc: 'Logos & products',  href: '/assets' },
]

export function QuickActions() {
  const router = useRouter()
  return (
    <div className="card-silver" style={{ borderRadius: 14, padding: '16px 18px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
        Quick Actions
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ACTIONS.map(({ icon: Icon, label, desc, href }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 9,
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.12s',
              width: '100%',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={13} color="rgba(255,255,255,0.55)" />
            </div>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>{label}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.2 }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
