'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Sparkles, Images,
  FolderOpen, Settings2, ChevronDown, Globe, Layers,
  Presentation, Lock, LogOut,
} from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { useAgentsStore } from '@/stores/agents'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'

// ── Nav structure ────────────────────────────────────────────────────────────
const NAV_WORKSPACE = [
  { href: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/calendar',  label: 'Calendar', icon: CalendarDays },
  { href: '/generate',  label: 'Generate', icon: Sparkles },
]

const NAV_CONTENT = [
  { href: '/outputs', label: 'Outputs', icon: Images },
  { href: '/assets',  label: 'Assets',  icon: FolderOpen },
]

const NAV_AGENTS = [
  { href: '/agents/website-builder', label: 'Website Builder', icon: Globe,         locked: true },
  { href: '/agents/branding-kit',    label: 'Branding Kit',    icon: Layers,        locked: true },
  { href: '/agents/presentations',   label: 'Presentations',   icon: Presentation,  locked: true },
]

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  href, label, icon: Icon, locked, active,
}: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; locked?: boolean; active: boolean }) {
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
      <Icon
        size={15}
        className={cn(
          'flex-shrink-0 transition-colors',
          active ? 'text-white' : 'text-[var(--text-4)] group-hover:text-[var(--text-3)]',
          locked && 'opacity-50',
        )}
      />
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
    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-4)] select-none">
      {children}
    </p>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()
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
        background: '#050505',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <Image
          src="/Brandvertise-Light-Logo.webp"
          alt="Brandvertise"
          width={140}
          height={32}
          style={{ objectFit: 'contain', height: 28, width: 'auto' }}
          priority
        />
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-2 px-2">

        {/* WORKSPACE */}
        <SectionLabel>Workspace</SectionLabel>
        <nav className="space-y-0.5">
          {NAV_WORKSPACE.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))} />
          ))}
        </nav>

        <div className="h-px mx-2 my-3" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* CONTENT */}
        <SectionLabel>Content</SectionLabel>
        <nav className="space-y-0.5">
          {NAV_CONTENT.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname.startsWith(href)} />
          ))}
        </nav>

        <div className="h-px mx-2 my-3" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* AGENTS */}
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

        <div className="h-px mx-2 my-3" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* SETTINGS */}
        <nav>
          <NavItem href="/settings" label="Settings" icon={Settings2} active={pathname.startsWith('/settings')} />
        </nav>
      </div>

      {/* Brand + Credits + Logout */}
      <div
        className="px-3 pb-3 pt-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Brand pill */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/[0.04]"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-black text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #c0c0c0 100%)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-[var(--text-1)] truncate leading-tight">{brandName}</p>
            <p className="text-[11px] text-[var(--text-4)] leading-tight">Free plan</p>
          </div>
          <ChevronDown size={13} className="text-[var(--text-4)] flex-shrink-0" />
        </div>

        {/* Credits bar */}
        <div className="mt-2 px-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[var(--text-3)]">{credits} credits</span>
            <span className="text-[11px] text-[var(--text-4)]">/ {maxCredits}</span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.85) 100%)',
              }}
            />
          </div>
          <button className="mt-1.5 text-[11px] text-[var(--text-3)] hover:text-white transition-colors">
            Buy credits →
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="mt-2 flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={14} className="flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
