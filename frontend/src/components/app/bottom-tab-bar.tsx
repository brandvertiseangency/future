'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Sparkles, ImageIcon, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
	{ href: '/dashboard', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
	{
		href: '/calendar',
		label: 'Calendar',
		icon: CalendarDays,
		match: (p: string) => p === '/calendar' || p.startsWith('/calendar/'),
	},
	{ href: '/outputs', label: 'Outputs', icon: ImageIcon, match: (p: string) => p === '/outputs' || p.startsWith('/outputs/') },
	{ href: '/scheduler', label: 'Schedule', icon: Clock3, match: (p: string) => p === '/scheduler' || p.startsWith('/scheduler/') },
	{ href: '/generate', label: 'Generate', icon: Sparkles, match: (p: string) => p === '/generate' },
]

export function BottomTabBar() {
	const pathname = usePathname()

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 px-1 backdrop-blur-md"
			style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)', paddingTop: 8 }}
		>
			{TABS.map(({ href, label, icon: Icon, match }) => {
				const active = match(pathname)
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 transition-all',
							active ? 'text-primary' : 'text-muted-foreground',
						)}
					>
						<Icon size={20} strokeWidth={active ? 2 : 1.6} />
						<span
							className={cn(
								'max-w-full truncate text-[10px] font-medium transition-colors',
								active ? 'text-primary' : 'text-muted-foreground',
							)}
						>
							{label}
						</span>
					</Link>
				)
			})}
		</nav>
	)
}
