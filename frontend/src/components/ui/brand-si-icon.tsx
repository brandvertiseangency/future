'use client'

import type { SimpleIcon } from 'simple-icons'
import { cn } from '@/lib/utils'

export function BrandSiIcon({
  icon,
  className,
  size = 20,
  monochrome,
}: {
  icon: SimpleIcon
  className?: string
  size?: number
  /** When true, uses currentColor instead of brand hex (for pills on light backgrounds). */
  monochrome?: boolean
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path fill={monochrome ? 'currentColor' : `#${icon.hex}`} d={icon.path} />
    </svg>
  )
}
