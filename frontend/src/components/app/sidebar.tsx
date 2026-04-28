'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconLogout2,
  IconChevronRight,
  IconBolt,
  IconLock,
  IconLayoutDashboard,
  IconCalendarEvent,
  IconSparkles,
  IconPhoto,
  IconFolder,
  IconWorld,
  IconLayersIntersect,
  IconPresentation,
  IconSettings,
  IconBriefcase,
} from '@tabler/icons-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useAgentsStore } from '@/stores/agents'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'

type SvgIconComponent = React.ComponentType<{ active: boolean }>

// Wrap lucide icons with active-aware styling
function makeIcon(Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>) {
  return function ActiveIcon({ active }: { active: boolean }) {
    return <Icon size={15} strokeWidth={active ? 2 : 1.6} className={cn('transition-all', active ? 'text-white' : 'text-white/35')} />
  }
}

const SvgDashboard = makeIcon(IconLayoutDashboard)
const SvgCalendar  = makeIcon(IconCalendarEvent)
const SvgSparkles  = makeIcon(IconSparkles)
const SvgImages    = makeIcon(IconPhoto)
const SvgFolder    = makeIcon(IconFolder)
const SvgGlobe     = makeIcon(IconWorld)
const SvgLayers    = makeIcon(IconLayersIntersect)
const SvgPresentation = makeIcon(IconPresentation)
const SvgSettings  = makeIcon(IconSettings)
const SvgBriefcase = makeIcon(IconBriefcase)

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_WORKSPACE: { href: string; label: string; icon: SvgIconComponent }[] = [
  { href: '/dashboard',        label: 'Home',         icon: SvgDashboard },
  { href: '/calendar',         label: 'Calendar',     icon: SvgCalendar  },
  // Review requires a planId; send users to the generator entry instead.
  { href: '/calendar/generate',label: 'Content Plan', icon: SvgSparkles  },
  { href: '/generate',         label: 'Generate',     icon: SvgImages    },
]
const NAV_CONTENT: { href: string; label: string; icon: SvgIconComponent }[] = [
  { href: '/outputs', label: 'Outputs', icon: SvgImages },
  { href: '/assets',  label: 'Assets',  icon: SvgFolder },
]
const NAV_AGENTS: { href: string; label: string; icon: SvgIconComponent; locked?: boolean }[] = [
  { href: '/agents/website-builder', label: 'Website Builder', icon: SvgGlobe,        locked: true },
  { href: '/agents/branding-kit',    label: 'Branding Kit',    icon: SvgLayers,       locked: true },
  { href: '/agents/presentations',   label: 'Presentations',   icon: SvgPresentation, locked: true },
]

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  href, label, icon: Icon, locked, active,
}: { href: string; label: string; icon: SvgIconComponent; locked?: boolean; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12.5px] font-medium transition-all duration-150 group',
        active
          ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[18px] rounded-r-full bg-white/70" />
      )}
      <Icon active={active} />
      <span className={cn('flex-1 leading-none tracking-[-0.01em]', locked && 'opacity-50')}>{label}</span>
      {locked && (
        <span className="flex items-center gap-0.5 text-[9px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-md">
          <IconLock size={7} />PRO
        </span>
      )}
    </Link>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/20 select-none">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px mx-3 my-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentBrand } = useBrandStore()
  const { signOut } = useAuth()
  const { isUnlocked } = useAgentsStore()

  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ balance: number; plan?: string; trial_days_left?: number }>(url),
    { revalidateOnFocus: false }
  )
  const credits = creditsData?.balance ?? 0
  const plan = creditsData?.plan ?? 'trial'
  const planLabel = plan === 'trial' ? 'Trial' : plan.charAt(0).toUpperCase() + plan.slice(1)
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const pct = Math.min((credits / maxCredits) * 100, 100)
  const initials = currentBrand?.name?.slice(0, 2).toUpperCase() ?? 'BV'
  const brandName = currentBrand?.name ?? 'My Brand'
  const lowCredits = credits <= 50

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(21,27,36,0.96) 0%, rgba(14,18,25,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-5 h-14 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Image
          src="/Brandvertise-Light-Logo.webp"
          alt="Brandvertise"
          width={130}
          height={28}
          style={{ objectFit: 'contain', height: 24, width: 'auto' }}
          priority
        />
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-1 px-2 scrollbar-hide">
        <SectionLabel>Workspace</SectionLabel>
        <nav className="space-y-px">
          {NAV_WORKSPACE.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon}
              active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))} />
          ))}
        </nav>

        <Divider />

        <SectionLabel>Content</SectionLabel>
        <nav className="space-y-px">
          {NAV_CONTENT.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname.startsWith(href)} />
          ))}
        </nav>

        <Divider />

        <SectionLabel>Agents</SectionLabel>
        <nav className="space-y-px">
          {NAV_AGENTS.map(({ href, label, icon, locked: defaultLocked }) => {
            const agentId = href.split('/').pop() as import('@/stores/agents').AgentId
            const locked = defaultLocked && !isUnlocked(agentId)
            return (
              <NavItem key={href} href={href} label={label} icon={icon} locked={locked} active={pathname.startsWith(href)} />
            )
          })}
        </nav>

        <Divider />

        <nav className="pb-2">
          <NavItem href="/brand"    label="Your Brand" icon={SvgBriefcase} active={pathname.startsWith('/brand')} />
          <NavItem href="/settings" label="Settings"   icon={SvgSettings}  active={pathname.startsWith('/settings')} />
        </nav>
      </div>

      {/* Bottom */}
      <div className="px-2.5 pb-3 pt-2 flex-shrink-0 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Brand pill */}
        <div
          className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/[0.04] group"
          onClick={() => router.push('/brand')}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-black text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #aaaaaa 100%)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white/80 truncate leading-tight">{brandName}</p>
            <p className="text-[10px] text-white/25 leading-tight mt-0.5">{planLabel} plan</p>
          </div>
          <IconChevronRight size={11} className="text-white/20 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Credits bar */}
        <button className="px-1 text-left" onClick={() => router.push('/settings#billing')}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] text-white/30">
              {credits}
              <span className="text-white/15"> / {maxCredits} credits</span>
              {lowCredits && <span className="ml-2 text-[10px] font-semibold text-orange-300/80">LOW</span>}
            </span>
            <span className="text-[10px] font-medium text-white/20">{Math.round(pct)}%</span>
          </div>
          <div className="h-[2px] rounded-full overflow-hidden bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.75) 100%)' }}
            />
          </div>
        </button>

        {/* Upgrade + Sign out */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push('/pricing')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-black transition-all hover:opacity-90 hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #c8c8c8 100%)' }}
          >
            <IconBolt size={10} />
            Upgrade
          </button>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 border border-white/[0.06] hover:border-red-500/20"
          >
            <IconLogout2 size={12} />
          </button>
        </div>
      </div>
    </aside>
  )
}
