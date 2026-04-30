'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Sparkles, ImageIcon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
	{ href: '/dashboard', label: 'Home', icon: LayoutDashboard },
	{ href: '/calendar', label: 'Calendar', icon: CalendarDays },
	{ href: '/generate', label: 'Generate', icon: Sparkles },
	{ href: '/outputs', label: 'Outputs', icon: ImageIcon },
	{ href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomTabBar() {
	const pathname = usePathname()

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#E5E7EB] bg-white px-2"
			style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)', paddingTop: 8 }}
		>
			{TABS.map(({ href, label, icon: Icon }) => {
				const active = pathname.startsWith(href)
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all',
							active ? 'text-[#111111]' : 'text-[#6B7280]'
						)}
					>
						<Icon size={20} strokeWidth={active ? 2 : 1.6} />
						<span className={cn('text-[10px] font-medium transition-colors', active ? 'text-[#111111]' : 'text-[#6B7280]')}>
							{label}
						</span>
					</Link>
				)
			})}
		</nav>
	)
}
