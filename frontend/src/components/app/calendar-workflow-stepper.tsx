'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wand2, CheckSquare, Layers, CalendarDays, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'plan', label: 'Plan', href: '/calendar/generate', icon: Wand2, match: (p: string) => p.startsWith('/calendar/generate') },
  { id: 'review', label: 'Review', href: '/calendar/review', icon: CheckSquare, match: (p: string) => p.startsWith('/calendar/review') },
  { id: 'studio', label: 'Studio', href: '/calendar/content', icon: Layers, match: (p: string) => p.startsWith('/calendar/content') },
  { id: 'calendar', label: 'Calendar', href: '/calendar', icon: CalendarDays, match: (p: string) => p === '/calendar' },
]

export function CalendarWorkflowStepper() {
  const pathname = usePathname()
  const activeIdx = STEPS.findIndex((s) => s.match(pathname))

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border/70 bg-card/80 px-2 py-1.5 backdrop-blur-sm">
      {STEPS.map((step, idx) => {
        const active = step.match(pathname)
        const past = activeIdx > idx
        return (
          <div key={step.id} className="flex items-center gap-0.5">
            <Link
              href={step.href}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : past
                    ? 'text-foreground hover:bg-muted/70'
                    : 'text-muted-foreground hover:bg-muted/60',
              )}
            >
              <step.icon
                size={11}
                strokeWidth={active ? 2.5 : 2}
                className={cn('shrink-0', past && !active && 'text-primary')}
              />
              <span className="hidden sm:inline">{step.label}</span>
            </Link>
            {idx < STEPS.length - 1 && (
              <ChevronRight size={10} className="shrink-0 text-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
