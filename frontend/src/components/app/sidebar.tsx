'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarPlus,
  ClipboardCheck,
  Wand2,
  Clock,
  ImageIcon,
  Printer,
  Layers,
  Layout,
  Mail,
  PresentationIcon,
  Globe,
  TrendingUp,
  MapPin,
  CreditCard,
  Rotate3D,
  BriefcaseBusiness,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Gift,
  User,
  Bell,
  Moon,
  Sun,
  Laptop,
  BookOpen,
  LifeBuoy,
  Sparkles,
  Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  Sidebar as AppSidebarShell,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
type NavLeaf = { href: string; label: string; icon: NavIcon; match: (p: string) => boolean }

// ─── Navigation definitions ──────────────────────────────────────────────────

const AUTO_PILOT: NavLeaf[] = [
  { href: '/calendar/generate', label: 'Plan Content', icon: CalendarPlus, match: (p) => p.startsWith('/calendar/generate') },
  { href: '/calendar', label: 'Review Content', icon: ClipboardCheck, match: (p) => p === '/calendar' || (p.startsWith('/calendar/') && !p.startsWith('/calendar/generate')) },
  { href: '/generate', label: 'Generate Media', icon: Wand2, match: (p) => p === '/generate' || p.startsWith('/generate/') },
  { href: '/scheduler', label: 'Schedule Posts', icon: Clock, match: (p) => p === '/scheduler' || p.startsWith('/scheduler/') },
  { href: '/outputs', label: 'My Outputs', icon: ImageIcon, match: (p) => p === '/outputs' || p.startsWith('/outputs/') },
]

const MARKETING_STUDIO: NavLeaf[] = [
  { href: '/studio/print', label: 'Printing Assets', icon: Printer, match: (p) => p.startsWith('/studio/print') },
  { href: '/studio/posters', label: 'Digital Posters', icon: Layers, match: (p) => p.startsWith('/studio/posters') },
  { href: '/studio/banners', label: 'Social Banners', icon: Layout, match: (p) => p.startsWith('/studio/banners') },
  { href: '/studio/email', label: 'Email Graphics', icon: Mail, match: (p) => p.startsWith('/studio/email') },
  { href: '/studio/presentations', label: 'Presentation Slides', icon: PresentationIcon, match: (p) => p.startsWith('/studio/presentations') },
]

const PREMIUM_TOOLS: (NavLeaf & { comingSoon: true })[] = [
  { href: '/tools/website-builder', label: 'Website Builder', icon: Globe, match: (p) => p.startsWith('/tools/website-builder'), comingSoon: true },
  { href: '/tools/seo', label: 'SEO Optimizer', icon: TrendingUp, match: (p) => p.startsWith('/tools/seo'), comingSoon: true },
  { href: '/tools/google-business', label: 'Google My Business', icon: MapPin, match: (p) => p.startsWith('/tools/google-business'), comingSoon: true },
  { href: '/tools/digital-card', label: 'Digital Visiting Card', icon: CreditCard, match: (p) => p.startsWith('/tools/digital-card'), comingSoon: true },
  { href: '/tools/vr', label: '360 VR Generator', icon: Rotate3D, match: (p) => p.startsWith('/tools/vr'), comingSoon: true },
]

const WORKSPACE: NavLeaf[] = [
  { href: '/brand/edit', label: 'Brand Setup', icon: BriefcaseBusiness, match: (p) => p.startsWith('/brand') },
  { href: '/settings', label: 'Settings', icon: Settings, match: (p) => p === '/settings' || p.startsWith('/settings/') },
]

// ─── NavItem ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  comingSoon,
}: {
  href: string
  label: string
  icon: NavIcon
  active: boolean
  comingSoon?: boolean
}) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-primary/10 text-foreground before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.6} className="shrink-0" />
      {!collapsed && (
        <span className="flex-1 leading-snug truncate">{label}</span>
      )}
      {!collapsed && comingSoon && (
        <span className="ml-auto shrink-0 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          Soon
        </span>
      )}
    </Link>
  )
}

// ─── NavSection ──────────────────────────────────────────────────────────────

function NavSection({
  title,
  badge,
  children,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  return (
    <SidebarGroup className="py-0">
      {!collapsed && (
        <div className="mb-1 flex items-center gap-1.5 px-3 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
            {title}
          </span>
          {badge}
        </div>
      )}
      {collapsed && <div className="mt-3 h-px bg-border/60" />}
      <SidebarGroupContent>
        <SidebarMenu>{children}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { currentBrand } = useBrandStore()
  const { signOut, user } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)

  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ balance: number; plan?: string; trial_days_left?: number }>(url),
    { revalidateOnFocus: false },
  )
  const credits = creditsData?.balance ?? 0
  const plan = creditsData?.plan ?? 'trial'
  const planLabel = plan === 'trial' ? 'Trial' : plan.charAt(0).toUpperCase() + plan.slice(1)
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const pct = Math.min((credits / maxCredits) * 100, 100)
  const isLowCredits = credits > 0 && pct < 15

  const initials = currentBrand?.name?.slice(0, 2).toUpperCase() ?? 'BV'
  const brandName = currentBrand?.name ?? 'My Brand'
  const userEmail = user?.email ?? ''

  const { data: notifData, mutate: mutateNotifs } = useSWR(
    '/api/notifications',
    (url: string) => apiCall<{ notifications: { read: boolean }[] }>(url),
    { refreshInterval: 60000, revalidateOnFocus: true },
  )
  const unreadCount = (notifData?.notifications ?? []).filter((n) => !n.read).length

  const { data: statsData } = useSWR(
    '/api/posts/stats',
    (url: string) => apiCall<{ scheduled?: number }>(url),
    { revalidateOnFocus: false, refreshInterval: 120000 },
  )
  const scheduledCount = statsData?.scheduled ?? 0

  const markAllRead = async () => {
    try {
      await apiCall('/api/notifications/read-all', { method: 'POST' })
      mutateNotifs()
    } catch { /* ignore */ }
  }

  return (
    <AppSidebarShell className="shadow-[var(--shadow-card)] border-r border-border/60">
      {/* Logo */}
      <SidebarHeader className={cn('flex h-[52px] items-center border-b border-border/40', collapsed ? 'justify-center px-2' : 'px-4')}>
        <Image
          src={resolvedTheme === 'dark' ? '/Brandvertise-Light-Logo.webp' : '/Brandvertise-Dark-Logo.webp'}
          alt="Brandvertise"
          width={collapsed ? 28 : 130}
          height={28}
          style={{ objectFit: 'contain', height: collapsed ? 28 : 22, width: 'auto' }}
          priority
        />
      </SidebarHeader>

      {/* Create Content CTA */}
      <SidebarHeader className={cn('pb-2 pt-3', collapsed ? 'px-2' : 'px-3')}>
        <Link
          href="/generate"
          title="Create content"
          className={cn(
            'flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-85',
            collapsed ? 'px-2 text-xs' : 'px-3 text-[13px]',
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className={cn(collapsed && 'sr-only')}>Create Content</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className={cn('scrollbar-hide py-1', collapsed ? 'px-2' : 'px-3')}>
        {/* Dashboard */}
        <SidebarGroup className="py-0 pt-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavItem
                  href="/dashboard"
                  label="Dashboard"
                  icon={LayoutDashboard}
                  active={pathname === '/dashboard'}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Brand Auto-Pilot */}
        <NavSection title="Brand Auto-Pilot">
          {AUTO_PILOT.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </NavSection>

        {/* Marketing Studio */}
        <NavSection title="Marketing Studio">
          {MARKETING_STUDIO.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </NavSection>

        {/* Premium Tools */}
        <NavSection
          title="Premium Tools"
          badge={
            !collapsed ? (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                Soon
              </span>
            ) : undefined
          }
        >
          {PREMIUM_TOOLS.map(({ href, label, icon, match, comingSoon }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} comingSoon={comingSoon} />
            </SidebarMenuItem>
          ))}
        </NavSection>

        {/* Workspace */}
        <NavSection title="Workspace">
          {WORKSPACE.map(({ href, label, icon, match }) => (
            <SidebarMenuItem key={href}>
              <NavItem href={href} label={label} icon={icon} active={match(pathname)} />
            </SidebarMenuItem>
          ))}
        </NavSection>
      </SidebarContent>

      <SidebarFooter className={cn('border-t border-border/60 space-y-2', collapsed ? 'p-2' : 'p-3')}>
        {/* Refer & Earn card */}
        {!collapsed && (
          <Link
            href="/refer"
            className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
              <Gift size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-foreground">Refer & Earn</p>
              <p className="text-[11px] text-muted-foreground">100 credits per paid referral</p>
            </div>
            <ChevronRight size={14} className="ml-auto shrink-0 text-muted-foreground/60 group-hover:text-primary" />
          </Link>
        )}
        {collapsed && (
          <Link
            href="/refer"
            title="Refer & Earn"
            className="flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-primary"
          >
            <Gift size={16} />
          </Link>
        )}

        {/* Credits + account card */}
        <div className={cn('rounded-xl border border-border/80 bg-card/50', collapsed ? 'space-y-2 p-2' : 'space-y-3 p-3')}>
          {/* User dropdown */}
          <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
            <DropdownMenuTrigger
              type="button"
              className={cn('flex w-full cursor-default items-center rounded-lg text-left outline-none transition-opacity hover:opacity-90', collapsed ? 'justify-center px-1 py-1.5' : 'gap-2.5')}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
                {initials}
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{brandName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{planLabel} plan</p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </>
              )}
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
                  <User className="text-muted-foreground" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings#brand')}>
                  <BriefcaseBusiness className="text-muted-foreground" /> Brand & workspace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings#notifications')}>
                  <Bell className="text-muted-foreground" /> Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void markAllRead()} disabled={unreadCount === 0}>
                  Mark notifications read
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light"><Sun className="text-muted-foreground" /> Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark"><Moon className="text-muted-foreground" /> Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system"><Laptop className="text-muted-foreground" /> System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setAccountOpen(false); window.location.href = 'mailto:support@brandvertise.ai' }}>
                <LifeBuoy className="text-muted-foreground" /> Support
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setAccountOpen(false); router.push('/') }}>
                <BookOpen className="text-muted-foreground" /> Documentation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Credits bar */}
          {!collapsed && (
            <div>
              {scheduledCount > 0 && (
                <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-primary/8 px-2 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="text-[11px] font-medium text-primary">
                    {scheduledCount} post{scheduledCount !== 1 ? 's' : ''} scheduled
                  </span>
                </div>
              )}
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className={cn('text-muted-foreground', isLowCredits && 'text-amber-500')}>
                  {credits.toLocaleString()} <span className="opacity-50">/ {maxCredits.toLocaleString()}</span>
                </span>
                <span className={cn('font-medium tabular-nums', isLowCredits ? 'text-amber-500' : 'text-muted-foreground')}>
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', isLowCredits ? 'bg-amber-500' : 'bg-primary')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isLowCredits && (
                <p className="mt-1 text-[10px] text-amber-500">Credits running low</p>
              )}
            </div>
          )}

          <Button
            onClick={() => router.push('/pricing')}
            size="sm"
            className={cn('w-full text-[12px]', collapsed && 'px-0', isLowCredits && 'border-0 bg-amber-500 text-white hover:bg-amber-600')}
          >
            {collapsed ? <Sparkles size={14} /> : isLowCredits ? 'Buy Credits' : 'Upgrade Plan'}
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </AppSidebarShell>
  )
}
