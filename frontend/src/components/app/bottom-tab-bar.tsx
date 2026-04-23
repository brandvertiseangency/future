'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Sparkles, Images, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const TABS = [
	{ href: '/dashboard', label: 'Home', icon: LayoutDashboard },
	{ href: '/calendar', label: 'Calendar', icon: CalendarDays },
	{ href: '/generate', label: 'Generate', icon: Sparkles, primary: true },
	{ href: '/assets', label: 'Assets', icon: Images },
	{ href: '/settings', label: 'Settings', icon: Settings2 },
]

export function BottomTabBar() {
	const pathname = usePathname()

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 z-50
                 bg-black/90 backdrop-blur-2xl
                 border-t border-white/[0.06]
                 flex items-center justify-around px-2"
			style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)', paddingTop: 8 }}
		>
			{TABS.map(({ href, label, icon: Icon, primary }) => {
				const active = pathname.startsWith(href)
				if (primary) {
					return (
						<Link key={href} href={href} className="flex flex-col items-center gap-1 relative -top-4">
							<motion.div
								whileTap={{ scale: 0.92 }}
								className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
								style={{
									background: 'linear-gradient(135deg, #ffffff 0%, #d0d0d0 100%)',
									boxShadow: '0 4px 24px rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
								}}
							>
								<Icon size={20} className="text-black" />
							</motion.div>
							<span className="text-[10px] font-medium text-white/40">{label}</span>
						</Link>
					)
				}
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative',
							active ? 'text-white' : 'text-white/30'
						)}
					>
						<Icon size={20} strokeWidth={active ? 2 : 1.6} />
						<span className={cn('text-[10px] font-medium transition-colors', active ? 'text-white/80' : 'text-white/30')}>
							{label}
						</span>
						{active && (
							<motion.span
								layoutId="tab-indicator"
								className="absolute -top-0.5 w-6 h-[2px] rounded-full"
								style={{ background: 'rgba(255,255,255,0.7)' }}
							/>
						)}
					</Link>
				)
			})}
		</nav>
	)
}
