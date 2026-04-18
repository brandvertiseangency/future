'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface DotPatternProps {
  className?: string
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
}

export function DotPattern({
  className,
  width = 20,
  height = 20,
  cx = 1,
  cy = 1,
  cr = 1,
}: DotPatternProps) {
  const id = useId()
  return (
    <svg
      className={cn('absolute inset-0 h-full w-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x={0} y={0} width={width} height={height} patternUnits="userSpaceOnUse">
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
