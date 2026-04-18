'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const GOALS = [
	{ id: 'growth', emoji: '🚀', label: 'Growth', desc: 'Grow your follower count and reach new audiences' },
	{ id: 'revenue', emoji: '💰', label: 'Revenue', desc: 'Drive sales, leads, and direct conversions' },
	{ id: 'engagement', emoji: '💬', label: 'Engagement', desc: 'Build community and deepen relationships' },
	{ id: 'awareness', emoji: '📣', label: 'Awareness', desc: 'Get your brand seen by as many people as possible' },
]

export function StepGoals() {
	const { data, updateData, setStep } = useOnboardingStore()

	const toggle = (id: string) => {
		const current = data.goals || []
		if (current.includes(id)) {
			updateData({ goals: current.filter((g) => g !== id) })
		} else if (current.length < 2) {
			updateData({ goals: [...current, id] })
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-white font-bold text-3xl tracking-tight">What are your main goals?</h2>
				<p className="text-white/40 text-sm mt-2">Pick up to 2 that matter most right now.</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				{GOALS.map((g) => {
					const selected = (data.goals || []).includes(g.id)
					return (
						<motion.button
							key={g.id}
							whileTap={{ scale: 0.97 }}
							onClick={() => toggle(g.id)}
							className={cn(
								'relative text-left p-5 rounded-2xl border transition-all',
								selected
									? 'border-violet-500/60 bg-violet-500/[0.08]'
									: 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
							)}
						>
							{selected && (
								<span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
									<IconCheck size={11} className="text-white" />
								</span>
							)}
							<div className="text-4xl mb-3">{g.emoji}</div>
							<p className="text-white font-semibold text-sm mb-1">{g.label}</p>
							<p className="text-white/40 text-xs leading-relaxed">{g.desc}</p>
						</motion.button>
					)
				})}
			</div>

			<div className="flex items-center justify-between pt-2">
				<button
					onClick={() => setStep(5)}
					className="text-white/30 hover:text-white/60 text-sm transition-colors"
				>
					← Back
				</button>
				<div className="flex items-center gap-4">
					<button
						onClick={() => setStep(7)}
						className="text-white/30 hover:text-white/60 text-sm transition-colors"
					>
						Skip for now →
					</button>
					<button
						onClick={() => setStep(7)}
						className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
					>
						Continue →
					</button>
				</div>
			</div>
		</div>
	)
}
