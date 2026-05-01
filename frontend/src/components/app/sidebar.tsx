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
} from 'lucide-react'
import { useBrandStore } from '@/stores/brand'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { Button } from '@/components/ui/button'

type NavIcon = React.ComponentType<{ size?: number; className?: string }>

const NAV_ITEMS: { href: string; label: string; icon: NavIcon }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Content Calendar', icon: CalendarDays },
  { href: '/generate', label: 'Generation', icon: Sparkles },
  { href: '/outputs', label: 'Outputs', icon: ImageIcon },
  { href: '/scheduler', label: 'Scheduler', icon: Clock3 },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({
  href, label, icon: Icon, active,
}: { href: string; label: string; icon: NavIcon; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
        active ? 'bg-[#F3F4F6] text-[#111111] border border-[#E5E7EB]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]',
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentBrand } = useBrandStore()
  const { signOut } = useAuth()

  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ balance: number; plan?: string; trial_days_left?: number }>(url),
    { revalidateOnFocus: false }
  )
  const credits = creditsData?.balance ?? 0
  const plan = creditsData?.plan ?? 'trial'
  const planLabel = plan === 'trial' ? 'Trial' : plan
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const pct = Math.min((credits / maxCredits) * 100, 100)
  const initials = currentBrand?.name?.slice(0, 2).toUpperCase() ?? 'BV'
  const brandName = currentBrand?.name ?? 'My Brand'

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[#E5E7EB] bg-white">
      <div className="flex h-14 items-center px-4">
        <Image
          src="/Brandvertise-Dark-Logo.webp"
          alt="Brandvertise"
          width={130}
          height={28}
          style={{ objectFit: 'contain', height: 22, width: 'auto' }}
          priority
        />
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))}
            />
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-[#E5E7EB] px-3 py-3">
        <div
          className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E5E7EB] px-2.5 py-2.5 transition-colors hover:bg-[#F7F7F8]"
          onClick={() => router.push('/settings')}
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#111111] text-[10px] font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[12px] font-medium leading-tight text-[#111111]">{brandName}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-[#6B7280]">{planLabel} plan</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/brand')}
          className="flex w-full items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-2 text-left text-[12px] text-[#111111] hover:bg-[#F7F7F8]"
        >
          <BriefcaseBusiness size={14} />
          Edit brand
        </button>

        <button className="px-1 text-left" onClick={() => router.push('/settings#billing')}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10.5px] text-[#6B7280]">
              {credits}
              <span className="text-[#9CA3AF]"> / {maxCredits} credits</span>
            </span>
            <span className="text-[10px] font-medium text-[#6B7280]">{Math.round(pct)}%</span>
          </div>
          <div className="h-[4px] overflow-hidden rounded-full bg-[#EFEFF1]">
            <div
              className="h-full rounded-full bg-[#111111] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/pricing')} className="w-full flex-1 text-[11px]">Upgrade</Button>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
