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
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'

type NavIcon = React.ComponentType<{ size?: number; className?: string }>

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
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
        indent && 'pl-4',
        active
          ? 'border border-primary/25 bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon size={16} />
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
          'flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground',
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-4">
        <Image
          src={resolvedTheme === 'dark' ? '/Brandvertise-Light-Logo.webp' : '/Brandvertise-Dark-Logo.webp'}
          alt="Brandvertise"
          width={130}
          height={28}
          style={{ objectFit: 'contain', height: 22, width: 'auto' }}
          priority
        />
      </div>

      <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-3 py-4">
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
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick generate</p>
          <p className="px-2 text-[10px] leading-snug text-muted-foreground/90">Not tied to the content calendar — your own briefs.</p>
          <NavItem href="/generate" label="Studio generate" icon={Sparkles} active={quickGenActive} />
        </div>
      </div>

      <div className="space-y-3 border-t border-border px-3 py-3">
        <div
          className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background/60 px-2.5 py-2.5 transition-colors hover:bg-muted"
          onClick={() => router.push('/settings')}
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-tight text-foreground">{brandName}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{planLabel} plan</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/brand')}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left text-[12px] text-foreground hover:bg-muted"
        >
          <BriefcaseBusiness size={14} />
          Edit brand
        </button>

        <button className="px-1 text-left" onClick={() => router.push('/settings#billing')}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10.5px] text-muted-foreground">
              {credits}
              <span className="text-muted-foreground/70"> / {maxCredits} credits</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">{Math.round(pct)}%</span>
          </div>
          <div className="h-[4px] overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/pricing')} className="w-full flex-1 text-[11px]">
            Upgrade
          </Button>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
