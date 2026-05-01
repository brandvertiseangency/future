'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('app-container py-6 md:py-8 pb-24', className)}>{children}</div>
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
        {eyebrow && <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">{eyebrow}</div>}
        <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-[#111111]">{title}</h1>
        {description && <p className="mt-2 text-sm text-[#6B7280]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SurfaceCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('app-card', className)}>{children}</div>
}

export function EmptyState({
  title,
  subtitle,
  action,
  secondaryAction,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
}) {
  return (
    <SurfaceCard className="p-10 text-center">
      <p className="text-[15px] font-semibold text-[#111111]">{title}</p>
      {subtitle && <p className="mt-1 text-[12px] text-[#6B7280]">{subtitle}</p>}
      {action && <div className="mt-4 flex items-center justify-center gap-2">{action}{secondaryAction}</div>}
    </SurfaceCard>
  )
}

export function NextStepCard({
  title,
  reason,
  primaryCta,
  secondaryCta,
  className,
}: {
  title: ReactNode
  reason: ReactNode
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  className?: string
}) {
  return (
    <SurfaceCard className={cn('p-4 md:p-5', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Priority Next Step</p>
      <p className="mt-2 text-base font-semibold text-[#111111]">{title}</p>
      <p className="mt-1 text-sm text-[#6B7280]">{reason}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={primaryCta.href}>
          <Button>{primaryCta.label}</Button>
        </Link>
        {secondaryCta ? (
          <Link href={secondaryCta.href}>
            <Button variant="secondary">{secondaryCta.label}</Button>
          </Link>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
