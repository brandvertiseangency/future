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
  Bell,
  User,
  Moon,
  Sun,
  Laptop,
  BookOpen,
  LifeBuoy,
  ChevronDown,
  Megaphone,
  ClipboardList,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import {
  Sidebar as AppSidebarShell,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type NavIcon = LucideIcon

type NavLeaf = { href: string; label: string; icon: NavIcon; match: (pathname: string) => boolean }

const PRIMARY_NAV: NavLeaf[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
]

const PUBLISH_ITEMS: NavLeaf[] = [
  {
    href: '/calendar/generate',
    label: 'Plan calendar',
    icon: Wand2,
    match: (p) => p.startsWith('/calendar/generate'),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays,
    match: (p) =>
      (p === '/calendar' || p.startsWith('/calendar/')) &&
      !p.startsWith('/calendar/generate') &&
      !p.startsWith('/calendar/content') &&
      !p.startsWith('/calendar/review'),
  },
  { href: '/outputs', label: 'Outputs', icon: ImageIcon, match: (p) => p === '/outputs' || p.startsWith('/outputs/') },
  { href: '/scheduler', label: 'Queue', icon: Clock3, match: (p) => p === '/scheduler' || p.startsWith('/scheduler/') },
]

const PLAN_ITEMS: NavLeaf[] = [
  {
    href: '/calendar/review',
    label: 'Approve plan',
    icon: ClipboardCheck,
    match: (p) => p.startsWith('/calendar/review'),
  },
  {
    href: '/calendar/content',
    label: 'Studio',
    icon: FileStack,
    match: (p) => p.startsWith('/calendar/content'),
  },
]

const TOOLS_ITEMS: NavLeaf[] = [
  { href: '/generate', label: 'Generate', icon: Sparkles, match: (p) => p === '/generate' || p.startsWith('/generate/') },
  { href: '/agents', label: 'Agents', icon: Bot, match: (p) => p === '/agents' || p.startsWith('/agents/') },
  { href: '/settings', label: 'Settings', icon: Settings, match: (p) => p === '/settings' || p.startsWith('/settings/') },
]

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: NavIcon
  active: boolean
}) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-primary/10 text-foreground before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary'
          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
      )}
    >
      <Icon size={17} strokeWidth={active ? 2 : 1.6} className="shrink-0 opacity-90" />
      <span className={cn('leading-snug', collapsed && 'hidden')}>{label}</span>
    </Link>
  )
}

function NavGroup({
  title,
  icon: Icon,
  highlighted,
  children,
}: {
  title: string
  icon: NavIcon
  highlighted?: boolean
  children: React.ReactNode
}) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  return (
    <SidebarGroup>
      {!collapsed ? (
        <SidebarGroupLabel
          className={cn(
            // Same horizontal indent (px-3) as NavItem so section icons sit in the
            // exact same column as sub-page icons.
            'h-7 px-3 mb-0',
            highlighted ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Icon size={13} className="shrink-0 opacity-90" />
          {title}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>{children}</SidebarGroupContent>
    </SidebarGroup>
  )
}

export function Sidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { currentBrand } = useBrandStore()
  const { signOut, user } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)

  const publishActive = useMemo(() => PUBLISH_ITEMS.some((i) => i.match(pathname)), [pathname])
  const planActive = useMemo(() => PLAN_ITEMS.some((i) => i.match(pathname)), [pathname])
  const toolsActive = useMemo(() => TOOLS_ITEMS.some((i) => i.match(pathname)), [pathname])

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
  const userEmail = user?.email ?? ''

  const { data: notifData, mutate: mutateNotifs } = useSWR(
    '/api/notifications',
    (url: string) => apiCall<{ notifications: { read: boolean }[] }>(url),
    { refreshInterval: 60000, refreshWhenHidden: false, revalidateOnFocus: true },
  )
  const notifications = notifData?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = async () => {
    try {
      await apiCall('/api/notifications/read-all', { method: 'POST' })
      mutateNotifs()
    } catch {
      /* ignore */
    }
  }

  return (
    <AppSidebarShell className="shadow-[var(--shadow-card)]">
      <SidebarHeader className={cn('flex h-[52px] items-center', collapsed ? 'justify-center px-2' : 'px-4')}>
        <Image
          src={resolvedTheme === 'dark' ? '/Brandvertise-Light-Logo.webp' : '/Brandvertise-Dark-Logo.webp'}
          alt="Brandvertise"
          width={collapsed ? 28 : 130}
          height={28}
          style={{ objectFit: 'contain', height: collapsed ? 28 : 22, width: 'auto' }}
          priority
        />
      </SidebarHeader>

      <SidebarHeader className={cn('pb-2', collapsed ? 'px-2' : 'px-3')}>
        <Link
          href="/generate"
          title="Create content"
          className={cn(
            'flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 active:opacity-90',
            collapsed ? 'px-2 text-xs' : 'px-3 text-[13px]',
          )}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          <span className={cn(collapsed && 'sr-only')}>Create content</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className={cn('scrollbar-hide space-y-5 py-2', collapsed ? 'px-2' : 'px-3')}>
        <SidebarMenu>
          {PRIMARY_NAV.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <NavGroup title="Publish" icon={Megaphone} highlighted={publishActive}>
          {PUBLISH_ITEMS.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </NavGroup>

        <NavGroup title="Plan" icon={ClipboardList} highlighted={planActive}>
          {PLAN_ITEMS.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </NavGroup>

        <NavGroup title="Tools" icon={Wrench} highlighted={toolsActive}>
          {TOOLS_ITEMS.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </NavGroup>
      </SidebarContent>

      <SidebarFooter className={cn('border-t border-border/80', collapsed ? 'p-2' : 'p-3')}>
        <div className={cn('app-card rounded-[var(--radius-card)] border border-border/90 bg-background/50 dark:bg-background/30', collapsed ? 'space-y-2 p-2' : 'space-y-3 p-3')}>
          <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
            <DropdownMenuTrigger
              type="button"
              className={cn('flex w-full cursor-default items-center rounded-lg text-left outline-none transition-opacity hover:opacity-90', collapsed ? 'justify-center px-1 py-1.5' : 'gap-2.5')}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
                {initials}
              </div>
              <div className={cn('min-w-0 flex-1', collapsed && 'hidden')}>
                <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{brandName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{userEmail || planLabel + ' plan'}</p>
              </div>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground', collapsed && 'hidden')} aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <span className="text-xs text-muted-foreground">Signed in</span>
                  <p className="truncate text-sm font-medium text-foreground">{userEmail || 'Account'}</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/settings#profile')}>
                  <User className="text-muted-foreground" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings#brand')}>
                  <BriefcaseBusiness className="text-muted-foreground" />
                  Brand & workspace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings#notifications')}>
                  <Bell className="text-muted-foreground" />
                  Notifications
                  {unreadCount > 0 ? (
                    <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void markAllRead()} disabled={unreadCount === 0}>
                  Mark notifications read
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <Sun className="text-muted-foreground" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="text-muted-foreground" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Laptop className="text-muted-foreground" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setAccountOpen(false)
                  window.location.href = 'mailto:support@brandvertise.ai'
                }}
              >
                <LifeBuoy className="text-muted-foreground" />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setAccountOpen(false)
                  router.push('/')
                }}
              >
                <BookOpen className="text-muted-foreground" />
                Documentation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => router.push('/brand/edit')}
            title="Brand setup"
            className={cn(
              'flex h-8 w-full items-center rounded-lg border border-border bg-background text-left font-medium text-foreground transition-colors hover:bg-muted/60',
              collapsed ? 'justify-center px-1 text-[11px]' : 'gap-2 px-2.5 text-[12px]',
            )}
          >
            <BriefcaseBusiness size={14} className="text-muted-foreground" />
            <span className={cn(collapsed && 'hidden')}>Brand setup</span>
          </button>

          <div className={cn(collapsed && 'hidden')}>
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

          <Button onClick={() => router.push('/pricing')} size="sm" className={cn('w-full', collapsed && 'px-0')}>
            Upgrade
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </AppSidebarShell>
  )
}
