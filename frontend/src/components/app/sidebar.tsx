'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Lock, LogOut, ChevronRight, Zap } from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useAgentsStore } from '@/stores/agents'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'

// ── Animated SVG Icons ────────────────────────────────────────────────────────
function SvgDashboard({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'stroke 0.2s' }}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"
        style={{ strokeDasharray: active ? '0' : '28', strokeDashoffset: active ? '0' : '28', transition: 'stroke-dashoffset 0.45s ease' }} />
      <rect x="14" y="3" width="7" height="7" rx="1.5"
        style={{ strokeDasharray: active ? '0' : '28', strokeDashoffset: active ? '0' : '28', transition: 'stroke-dashoffset 0.45s 0.05s ease' }} />
      <rect x="3" y="14" width="7" height="7" rx="1.5"
        style={{ strokeDasharray: active ? '0' : '28', strokeDashoffset: active ? '0' : '28', transition: 'stroke-dashoffset 0.45s 0.1s ease' }} />
      <rect x="14" y="14" width="7" height="7" rx="1.5"
        style={{ strokeDasharray: active ? '0' : '28', strokeDashoffset: active ? '0' : '28', transition: 'stroke-dashoffset 0.45s 0.15s ease' }} />
    </svg>
  )
}
function SvgCalendar({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'stroke 0.2s' }}>
      <rect x="3" y="4" width="18" height="18" rx="2"
        style={{ strokeDasharray: '64', strokeDashoffset: active ? '0' : '64', transition: 'stroke-dashoffset 0.5s ease' }} />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="15" r="0.8" fill="currentColor" style={{ opacity: active ? 1 : 0.5, transition: 'opacity 0.2s' }} />
      <circle cx="12" cy="15" r="0.8" fill="currentColor" style={{ opacity: active ? 1 : 0.5, transition: 'opacity 0.2s 0.05s' }} />
      <circle cx="16" cy="15" r="0.8" fill="currentColor" style={{ opacity: active ? 1 : 0.5, transition: 'opacity 0.2s 0.1s' }} />
    </svg>
  )
}
function SvgSparkles({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'stroke 0.2s, transform 0.35s', transform: active ? 'rotate(10deg) scale(1.08)' : 'rotate(0) scale(1)' }}>
      <path d="M12 3l1.8 5.4L19.2 10l-5.4 1.8L12 17.4l-1.8-5.4L4.8 10l5.4-1.8z" />
      <path d="M19 16l.9 2.7L22.6 19.6l-2.7.9L19 23l-.9-2.7L15.4 19.6l2.7-.9z"
        style={{ opacity: active ? 1 : 0.3, transition: 'opacity 0.25s' }} />
    </svg>
  )
}
function SvgImages({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'stroke 0.2s' }}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5"
        style={{ fill: active ? 'rgba(255,255,255,0.9)' : 'none', stroke: active ? 'none' : 'rgba(255,255,255,0.4)', transition: 'fill 0.2s' }} />
      <polyline points="21,15 16,10 5,21"
        style={{ strokeDasharray: '30', strokeDashoffset: active ? '0' : '30', transition: 'stroke-dashoffset 0.4s ease' }} />
    </svg>
  )
}
function SvgFolder({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'stroke 0.2s' }}>
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        style={{ strokeDasharray: '60', strokeDashoffset: active ? '0' : '60', transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  )
}
function SvgGlobe({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.22)', transition: 'stroke 0.2s' }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-3 4-3 14 0 18M12 3c3 4 3 14 0 18" />
      <line x1="3.5" y1="9" x2="20.5" y2="9" />
      <line x1="3.5" y1="15" x2="20.5" y2="15" />
    </svg>
  )
}
function SvgLayers({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.22)', transition: 'stroke 0.2s' }}>
      <polygon points="12,2 2,7 12,12 22,7" />
      <polyline points="2,17 12,22 22,17" style={{ opacity: active ? 1 : 0.5, transition: 'opacity 0.2s' }} />
      <polyline points="2,12 12,17 22,12" style={{ opacity: active ? 1 : 0.5, transition: 'opacity 0.2s' }} />
    </svg>
  )
}
function SvgPresentation({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.22)', transition: 'stroke 0.2s' }}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
function SvgSettings({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ stroke: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'stroke 0.2s, transform 0.5s', transform: active ? 'rotate(45deg)' : 'rotate(0)' }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

type SvgIconComponent = React.ComponentType<{ active: boolean }>

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_WORKSPACE: { href: string; label: string; icon: SvgIconComponent }[] = [
  { href: '/dashboard',        label: 'Home',         icon: SvgDashboard },
  { href: '/calendar',         label: 'Calendar',     icon: SvgCalendar  },
  { href: '/calendar/review',  label: 'Content Plan', icon: SvgSparkles  },
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
        'relative flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-all duration-150 group',
        active
          ? 'nav-active text-white'
          : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-white/[0.04]',
      )}
    >
      <Icon active={active} />
      <span className={cn('flex-1 leading-none', locked && 'opacity-60')}>{label}</span>
      {locked && (
        <span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--text-4)] bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full">
          <Lock size={8} />PRO
        </span>
      )}
    </Link>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--text-4)] select-none">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px mx-3 my-2" style={{ background: 'rgba(255,255,255,0.04)' }} />
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentBrand } = useBrandStore()
  const { signOut } = useAuth()
  const { isUnlocked } = useAgentsStore()

  const { data: creditsData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number }>(url), { revalidateOnFocus: false })
  const credits = creditsData?.balance ?? 0
  const maxCredits = 500
  const pct = Math.min((credits / maxCredits) * 100, 100)
  const initials = currentBrand?.name?.slice(0, 2).toUpperCase() ?? 'BV'
  const brandName = currentBrand?.name ?? 'My Brand'

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #060606 0%, #050505 100%)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.045)' }}
      >
        <Image
          src="/Brandvertise-Light-Logo.webp"
          alt="Brandvertise"
          width={140}
          height={32}
          style={{ objectFit: 'contain', height: 26, width: 'auto' }}
          priority
        />
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">

        <SectionLabel>Workspace</SectionLabel>
        <nav className="space-y-0.5">
          {NAV_WORKSPACE.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon}
              active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))} />
          ))}
        </nav>

        <Divider />

        <SectionLabel>Content</SectionLabel>
        <nav className="space-y-0.5">
          {NAV_CONTENT.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname.startsWith(href)} />
          ))}
        </nav>

        <Divider />

        <SectionLabel>Agents</SectionLabel>
        <nav className="space-y-0.5">
          {NAV_AGENTS.map(({ href, label, icon, locked: defaultLocked }) => {
            const agentId = href.split('/').pop() as import('@/stores/agents').AgentId
            const locked = defaultLocked && !isUnlocked(agentId)
            return (
              <NavItem key={href} href={href} label={label} icon={icon} locked={locked} active={pathname.startsWith(href)} />
            )
          })}
        </nav>

        <Divider />

        <nav>
          <NavItem href="/settings" label="Settings" icon={SvgSettings} active={pathname.startsWith('/settings')} />
        </nav>
      </div>

      {/* Bottom: brand pill + credits + upgrade */}
      <div
        className="px-3 pb-3 pt-2 flex-shrink-0 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.045)' }}
      >
        {/* Brand pill */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/[0.04] group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-black text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #b8b8b8 100%)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--text-1)] truncate leading-tight">{brandName}</p>
            <p className="text-[10.5px] text-[var(--text-4)] leading-tight">Free plan</p>
          </div>
          <ChevronRight size={12} className="text-[var(--text-4)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Credits bar */}
        <div className="px-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[var(--text-3)]">{credits} <span className="text-[var(--text-4)]">/ {maxCredits} credits</span></span>
            <span className="text-[10px] font-medium text-[var(--text-4)]">{Math.round(pct)}%</span>
          </div>
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.80) 100%)',
              }}
            />
          </div>
        </div>

        {/* Upgrade + Sign out row */}
        <div className="flex items-center gap-1.5 px-1">
          <button
            onClick={() => router.push('/pricing')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-black transition-all duration-150 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #c0c0c0 100%)' }}
          >
            <Zap size={10} />
            Upgrade
          </button>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--text-4)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
