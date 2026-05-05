'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('bv-page-canvas min-h-[calc(100vh-1px)]')}>
      <div className={cn('app-container py-6 md:py-8 pb-24', className)}>{children}</div>
    </div>
  )
}

export type PageHeaderVariant = 'default' | 'compact' | 'hero'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  variant = 'default',
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  variant?: PageHeaderVariant
}) {
  const isHero = variant === 'hero'
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        isHero ? 'mb-8 md:mb-10' : isCompact ? 'mb-5 md:mb-6' : 'mb-8 md:mb-10',
      )}
    >
      <div className={cn('min-w-0', isHero ? 'max-w-3xl' : 'max-w-3xl')}>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</div>
        )}
        <h1
          className={cn(
            'tracking-tight text-foreground',
            isHero && 'font-display text-3xl font-normal md:text-[2.25rem] md:leading-[1.15]',
            !isHero && !isCompact && 'text-[28px] font-semibold md:text-[36px] md:leading-[1.1]',
            isCompact && 'text-xl font-semibold md:text-2xl',
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              'leading-relaxed text-muted-foreground',
              isHero ? 'mt-3 text-base md:text-[17px]' : isCompact ? 'mt-1.5 text-sm' : 'mt-3 text-base md:text-[17px]',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
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
  dense,
}: {
  title: ReactNode
  reason: ReactNode
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  className?: string
  /** Smaller footprint for dashboard / scheduler */
  dense?: boolean
}) {
  return (
    <SurfaceCard
      className={cn(
        'border-primary/15 ring-1 ring-primary/10',
        dense ? 'p-3 md:p-4' : 'p-4 md:p-5',
        className,
      )}
    >
      <p className={cn('font-semibold uppercase tracking-[0.12em] text-primary', dense ? 'text-[10px]' : 'text-xs')}>
        Priority next step
      </p>
      <p className={cn('font-semibold tracking-tight text-foreground', dense ? 'mt-1.5 text-base md:text-lg' : 'mt-2 text-lg md:text-xl')}>
        {title}
      </p>
      <p className={cn('leading-relaxed text-muted-foreground', dense ? 'mt-1.5 text-xs md:text-sm' : 'mt-2 text-sm')}>
        {reason}
      </p>
      <div className={cn('flex flex-wrap gap-2', dense ? 'mt-3' : 'mt-4')}>
        <Link href={primaryCta.href}>
          <Button className={dense ? 'h-8 text-xs' : undefined}>{primaryCta.label}</Button>
        </Link>
        {secondaryCta ? (
          <Link href={secondaryCta.href}>
            <Button variant="secondary" className={dense ? 'h-8 text-xs' : undefined}>
              {secondaryCta.label}
            </Button>
          </Link>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
