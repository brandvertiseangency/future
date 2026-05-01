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
      <div className="flex items-start justify-between border-b border-[#E5E7EB] px-4 py-4 md:px-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#111111]">{title}</h2>
          {subtitle ? <p className="mt-1 text-[13px] text-[#6B7280]">{subtitle}</p> : null}
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
}: {
  label: string
  value: string | number
  sublabel?: string
}) {
  return (
    <div className="app-card p-4 md:p-5">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none text-[#111111]">{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-[#6B7280]">{sublabel}</p> : null}
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
        tone === 'neutral' && 'border-[#E5E7EB] bg-[#F7F7F8] text-[#6B7280]'
      )}
    >
      {children}
    </span>
  )
}
