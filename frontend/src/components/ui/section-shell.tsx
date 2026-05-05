'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionShell({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className={cn(contentClassName)}>{children}</div>
    </section>
  )
}
