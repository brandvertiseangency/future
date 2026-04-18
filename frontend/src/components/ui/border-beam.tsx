'use client'

import { cn } from '@/lib/utils'

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
}

export function BorderBeam({
  className,
  size = 200,
  duration = 8,
  colorFrom = '#8b5cf6',
  colorTo = '#3b82f6',
}: BorderBeamProps) {
  return (
    <span
      style={
        {
          '--size': size,
          '--duration': `${duration}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        'after:absolute after:inset-[-1px] after:rounded-[inherit]',
        'after:animate-[border-beam_var(--duration)_infinite_linear]',
        className
      )}
    />
  )
}
