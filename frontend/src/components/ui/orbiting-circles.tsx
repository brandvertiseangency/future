'use client'

import { cn } from '@/lib/utils'

interface OrbitingCirclesProps {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  radius?: number
  iconSize?: number
}

export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  radius = 40,
  iconSize = 20,
}: OrbitingCirclesProps) {
  return (
    <div
      style={
        {
          '--duration': duration,
          '--radius': radius,
          '--icon-size': iconSize,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'absolute flex items-center justify-center rounded-full',
          'animate-[orbit_calc(var(--duration)*1s)_linear_infinite]',
          reverse && '[animation-direction:reverse]'
        )}
        style={{
          width: iconSize,
          height: iconSize,
          transform: `translateY(calc(-${radius} * 1px))`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
