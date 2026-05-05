'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Scroll + sticky header + zebra rows for dense marketing tables */
export function DataTableShell({
  children,
  className,
  maxHeightClassName = 'max-h-[min(70vh,560px)]',
}: {
  children: ReactNode
  className?: string
  maxHeightClassName?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]',
        className
      )}
    >
      <div className={cn('overflow-auto', maxHeightClassName)}>
        <table className="bv-data-table w-full min-w-[640px] border-collapse text-sm">{children}</table>
      </div>
    </div>
  )
}
