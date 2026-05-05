'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Lock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AgentCardProps = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  /** Tailwind gradient / accent classes for icon container */
  accentClassName: string
  locked: boolean
}

export function AgentCard({ title, description, href, icon: Icon, accentClassName, locked }: AgentCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow',
        locked && 'opacity-95'
      )}
    >
      {locked ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-card/90 via-card/40 to-transparent pb-4">
          <span className="rounded-full border border-border bg-muted/90 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Lock className="mr-1 inline h-3 w-3 align-middle" />
            Pro
          </span>
        </div>
      ) : null}
      <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white', accentClassName)}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {locked ? (
          <Link href="/settings#billing" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
            Unlock
          </Link>
        ) : (
          <Link href={href} className={cn(buttonVariants({ size: 'sm' }))}>
            Open
          </Link>
        )}
      </div>
    </div>
  )
}
