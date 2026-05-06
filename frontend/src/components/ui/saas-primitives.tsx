'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('app-card', className)}>
      <div className="flex items-start justify-between border-b border-border px-4 py-4 md:px-5">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle ? <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  )
}

export function StatCard({
  label,
  value,
  sublabel,
  delta,
}: {
  label: string
  value: string | number
  sublabel?: string
  /** Optional trend line (e.g. from analytics); use neutral copy if unknown */
  delta?: string
}) {
  return (
    <div className="app-card-elevated border border-border/80 p-4 shadow-[var(--shadow-card)] md:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none text-foreground md:text-[28px]">{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p> : null}
      {delta ? <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">{delta}</p> : null}
    </div>
  )
}

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700',
        tone === 'neutral' && 'border-border bg-muted text-muted-foreground'
      )}
    >
      {children}
    </span>
  )
}
