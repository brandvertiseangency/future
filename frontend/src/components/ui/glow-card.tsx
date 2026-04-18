'use client'

import { CardSpotlight } from '@/components/ui/card-spotlight'
import { cn } from '@/lib/utils'

const ACCENT_COLORS = {
  ai: 'rgba(0,212,255,0.15)',
  credit: 'rgba(245,158,11,0.15)',
  success: 'rgba(16,185,129,0.15)',
  alert: 'rgba(244,63,94,0.15)',
  default: 'rgba(255,255,255,0.08)',
} as const

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  accentColor?: keyof typeof ACCENT_COLORS
}

export function GlowCard({ children, className, accentColor }: GlowCardProps) {
  return (
    <CardSpotlight
      className={cn('rounded-xl border border-white/10 bg-[var(--card-bg)]', className)}
      color={ACCENT_COLORS[accentColor || 'default']}
    >
      {children}
    </CardSpotlight>
  )
}
