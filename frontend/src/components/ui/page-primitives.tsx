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
    <div className="mb-8 flex items-start justify-between gap-4 md:mb-10">
      <div className="max-w-3xl">
        {eyebrow && <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground md:text-[36px] md:leading-[1.1]">{title}</h1>
        {description && <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-[17px]">{description}</p>}
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
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      {subtitle && <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p>}
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
    <SurfaceCard className={cn('border-primary/20 ring-1 ring-primary/15 p-4 md:p-5', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Priority next step</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason}</p>
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
