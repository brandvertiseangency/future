'use client'

import { useRouter } from 'next/navigation'
import { GlowingEffect } from '@/components/ui/glowing-effect'

// Inline SVG icons — animated on hover (Chamaac-style approach)
function IconCalendar({ hovered }: { hovered: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'stroke 0.2s', stroke: hovered ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>
      <rect x="3" y="4" width="18" height="18" rx="2"
        style={{ strokeDasharray: hovered ? '0' : '64', strokeDashoffset: hovered ? '0' : '64', transition: 'stroke-dashoffset 0.4s ease' }} />
      <line x1="16" y1="2" x2="16" y2="6" style={{ transition: 'opacity 0.2s', opacity: hovered ? 1 : 0.5 }} />
      <line x1="8" y1="2" x2="8" y2="6" style={{ transition: 'opacity 0.2s', opacity: hovered ? 1 : 0.5 }} />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconSparkles({ hovered }: { hovered: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: hovered ? '#ffffff' : 'rgba(255,255,255,0.5)', transition: 'stroke 0.2s, transform 0.3s', transform: hovered ? 'rotate(15deg) scale(1.1)' : 'rotate(0) scale(1)' }}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.25s 0.1s' }} />
    </svg>
  )
}
function IconImages({ hovered }: { hovered: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: hovered ? '#ffffff' : 'rgba(255,255,255,0.5)', transition: 'stroke 0.2s' }}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" style={{ fill: hovered ? 'rgba(255,255,255,0.8)' : 'none', transition: 'fill 0.2s' }} />
      <polyline points="21,15 16,10 5,21" style={{ strokeDasharray: hovered ? '0' : '30', strokeDashoffset: hovered ? '0' : '30', transition: 'stroke-dashoffset 0.35s ease' }} />
    </svg>
  )
}
function IconUpload({ hovered }: { hovered: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: hovered ? '#ffffff' : 'rgba(255,255,255,0.5)', transition: 'stroke 0.2s' }}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17,8 12,3 7,8" style={{ transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.25s ease', display: 'block' }} />
      <line x1="12" y1="3" x2="12" y2="15" style={{ transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.25s ease', display: 'block' }} />
    </svg>
  )
}

const ICON_MAP = {
  calendar: IconCalendar,
  sparkles: IconSparkles,
  images: IconImages,
  upload: IconUpload,
} as const

const ACTIONS = [
  {
    icon: 'calendar' as const,
    label: 'Generate Calendar',
    desc: 'Plan a full month of posts',
    href: '/calendar/generate',
    span: 'col-span-2',
  },
  {
    icon: 'sparkles' as const,
    label: 'Quick Generate',
    desc: 'Create a single post now',
    href: '/generate',
    span: 'col-span-1',
  },
  {
    icon: 'images' as const,
    label: 'Outputs',
    desc: 'Browse all creatives',
    href: '/outputs',
    span: 'col-span-1',
  },
  {
    icon: 'upload' as const,
    label: 'Assets',
    desc: 'Logos & products',
    href: '/assets',
    span: 'col-span-2',
  },
]

import { useState } from 'react'

function ActionCard({
  icon,
  label,
  desc,
  href,
  span,
}: {
  icon: keyof typeof ICON_MAP
  label: string
  desc: string
  href: string
  span: string
}) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const IconComp = ICON_MAP[icon]

  return (
    <div
      className={`relative rounded-xl p-px ${span}`}
      style={{
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        transition: 'background 0.2s',
      }}
    >
      <GlowingEffect
        spread={28}
        glow={true}
        disabled={false}
        proximity={55}
        inactiveZone={0.05}
        borderWidth={1}
      />
      <button
        onClick={() => router.push(href)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-full h-full rounded-[11px] p-3.5 flex flex-col gap-2 text-left cursor-pointer"
        style={{
          background: hovered ? '#111' : '#0a0a0a',
          border: 'none',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'background 0.2s, border-color 0.2s',
        }}>
          <IconComp hovered={hovered} />
        </div>
        <div>
          <p style={{
            fontSize: 12.5, fontWeight: 500, margin: 0, lineHeight: 1.3,
            color: hovered ? '#ffffff' : 'rgba(255,255,255,0.75)',
            transition: 'color 0.2s',
          }}>
            {label}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', lineHeight: 1.3 }}>
            {desc}
          </p>
        </div>
      </button>
    </div>
  )
}

export function QuickActions() {
  return (
    <div className="card-silver" style={{ borderRadius: 14, padding: '16px 18px' }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 12 }}>
        Quick Actions
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
        }}
      >
        {ACTIONS.map((a) => (
          <ActionCard key={a.label} {...a} />
        ))}
      </div>
    </div>
  )
}
