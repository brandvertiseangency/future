'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  ImageIcon,
  Clock3,
  Bot,
  Settings,
  BriefcaseBusiness,
  LogOut,
  FileStack,
  ClipboardCheck,
  Wand2,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'

type NavIcon = LucideIcon

type NavLeaf = { href: string; label: string; icon: NavIcon; match: (pathname: string) => boolean }

const STUDIO_ITEMS: NavLeaf[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
  { href: '/agents', label: 'Agents', icon: Bot, match: (p) => p === '/agents' || p.startsWith('/agents/') },
  { href: '/settings', label: 'Settings', icon: Settings, match: (p) => p === '/settings' || p.startsWith('/settings/') },
]

const PIPELINE_ITEMS: NavLeaf[] = [
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays,
    match: (p) => p === '/calendar' || p === '/calendar/',
  },
  {
    href: '/calendar/generate',
    label: 'Generate plan',
    icon: Wand2,
    match: (p) => p.startsWith('/calendar/generate'),
  },
  {
    href: '/calendar/content',
    label: 'Content',
    icon: FileStack,
    match: (p) => p.startsWith('/calendar/content'),
  },
  {
    href: '/calendar/review',
    label: 'Review',
    icon: ClipboardCheck,
    match: (p) => p.startsWith('/calendar/review'),
  },
]

const SHIP_ITEMS: NavLeaf[] = [
  { href: '/outputs', label: 'Outputs', icon: ImageIcon, match: (p) => p === '/outputs' || p.startsWith('/outputs/') },
  { href: '/scheduler', label: 'Scheduler', icon: Clock3, match: (p) => p === '/scheduler' || p.startsWith('/scheduler/') },
]

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  indent,
}: {
  href: string
  label: string
  icon: NavIcon
  active: boolean
  indent?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-150',
        indent && 'pl-4',
        active
          ? 'bg-primary/[0.09] text-foreground before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
      )}
    >
      <Icon size={17} strokeWidth={active ? 2 : 1.65} className="opacity-90" />
      <span>{label}</span>
    </Link>
  )
}

function NavSection({
  title,
  defaultOpen,
  children,
  highlighted,
}: {
  title: string
  defaultOpen: boolean
  children: React.ReactNode
  highlighted?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  return (
    <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground',
          highlighted && 'text-primary',
        )}
      >
        {title}
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </summary>
      <div className="mt-1 space-y-0.5 pl-0.5">{children}</div>
    </details>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const { currentBrand } = useBrandStore()
  const { signOut } = useAuth()

  const pipelineOpen = useMemo(() => PIPELINE_ITEMS.some((i) => i.match(pathname)), [pathname])

  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ balance: number; plan?: string; trial_days_left?: number }>(url),
    { revalidateOnFocus: false },
  )
  const credits = creditsData?.balance ?? 0
  const plan = creditsData?.plan ?? 'trial'
  const planLabel = plan === 'trial' ? 'Trial' : plan
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const pct = Math.min((credits / maxCredits) * 100, 100)
  const initials = currentBrand?.name?.slice(0, 2).toUpperCase() ?? 'BV'
  const brandName = currentBrand?.name ?? 'My Brand'

  const quickGenActive = pathname === '/generate'

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-border/80 bg-card shadow-[var(--shadow-card)]">
      <div className="flex h-[52px] items-center px-4">
        <Image
          src={resolvedTheme === 'dark' ? '/Brandvertise-Light-Logo.webp' : '/Brandvertise-Dark-Logo.webp'}
          alt="Brandvertise"
          width={130}
          height={28}
          style={{ objectFit: 'contain', height: 22, width: 'auto' }}
          priority
        />
      </div>

      <div className="px-3 pb-2">
        <Link
          href="/generate"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 active:opacity-90"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          Create content
        </Link>
      </div>

      <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-3 py-2">
        <nav className="space-y-0.5">
          {STUDIO_ITEMS.map(({ href, label, icon, match }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={match(pathname)} />
          ))}
        </nav>

        <NavSection title="Content pipeline" defaultOpen={pipelineOpen} highlighted={pipelineOpen}>
          {PIPELINE_ITEMS.map(({ href, label, icon, match }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={match(pathname)} indent />
          ))}
        </NavSection>

        <NavSection title="Ship" defaultOpen={SHIP_ITEMS.some((i) => i.match(pathname))}>
          {SHIP_ITEMS.map(({ href, label, icon, match }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={match(pathname)} indent />
          ))}
        </NavSection>

        <div className="space-y-1">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quick generate</p>
          <p className="px-2 text-[10px] leading-snug text-muted-foreground/85">One-off posts — not tied to the calendar.</p>
          <NavItem href="/generate" label="Studio generate" icon={Sparkles} active={quickGenActive} />
        </div>
      </div>

      <div className="border-t border-border/80 p-3">
        <div className="app-card space-y-3 rounded-[var(--radius-card)] border border-border/90 bg-background/50 p-3 dark:bg-background/30">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2.5 text-left transition-opacity hover:opacity-90"
            onClick={() => router.push('/settings')}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{brandName}</p>
              <p className="text-[11px] text-muted-foreground">{planLabel} plan</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/settings#brand')}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left text-[12px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            <BriefcaseBusiness size={14} className="text-muted-foreground" />
            Edit brand
          </button>

          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {credits}
                <span className="text-muted-foreground/75"> / {maxCredits}</span>
              </span>
              <span className="font-medium tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/pricing')} className="h-9 min-h-9 flex-1 text-xs">
              Upgrade
            </Button>
            <button
              type="button"
              onClick={signOut}
              title="Sign out"
              className="flex h-9 min-h-9 min-w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
