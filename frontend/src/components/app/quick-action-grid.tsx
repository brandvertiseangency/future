'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuickActionItem = {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

export function QuickActionGrid({ items, className }: { items: QuickActionItem[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map(({ href, title, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="app-card-elevated group flex gap-4 p-4 md:p-5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-foreground">{title}</p>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
