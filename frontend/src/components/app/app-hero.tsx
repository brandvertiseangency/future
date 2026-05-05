'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppHeroProps = {
  /** e.g. "Hey, Alex" */
  greeting: ReactNode
  /** Short line under greeting */
  subtitle?: ReactNode
  /** Optional top-right slot (e.g. link) */
  aside?: ReactNode
  /** Main row: prompt / search */
  children?: ReactNode
  className?: string
}

export function AppHero({ greeting, subtitle, aside, children, className }: AppHeroProps) {
  return (
    <div className={cn('bv-surface-hero px-5 py-6 md:px-8 md:py-8', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-normal tracking-tight text-foreground md:text-[1.75rem] md:leading-snug">
            {greeting}
          </h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">{subtitle}</p> : null}
        </div>
        {aside ? <div className="shrink-0 md:pt-1">{aside}</div> : null}
      </div>
      {children ? <div className="mt-5 md:mt-6">{children}</div> : null}
    </div>
  )
}
