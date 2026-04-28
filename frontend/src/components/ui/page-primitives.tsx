'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('max-w-6xl mx-auto px-6 py-8 pb-24', className)}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-2">{eyebrow}</div>}
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.035em] text-white leading-[1.05]">{title}</h1>
        {description && <p className="text-[13px] text-white/35 mt-2">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SurfaceCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-white/[0.08] bg-[#0a0a0a]', className)}>{children}</div>
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <SurfaceCard className="p-10 text-center">
      <p className="text-[15px] font-semibold text-white/55">{title}</p>
      {subtitle && <p className="text-[12px] text-white/25 mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex items-center justify-center">{action}</div>}
    </SurfaceCard>
  )
}
