'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { Rocket, DollarSign, MessageSquare, Megaphone } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const GOALS = [
	{ id: 'growth', Icon: Rocket, label: 'Growth', desc: 'Grow your follower count and reach new audiences' },
	{ id: 'revenue', Icon: DollarSign, label: 'Revenue', desc: 'Drive sales, leads, and direct conversions' },
	{ id: 'engagement', Icon: MessageSquare, label: 'Engagement', desc: 'Build community and deepen relationships' },
	{ id: 'awareness', Icon: Megaphone, label: 'Awareness', desc: 'Get your brand seen by as many people as possible' },
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
									? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.08]'
									: 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
							)}
						>
							{selected && (
								<span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--ai-color)] flex items-center justify-center">
									<IconCheck size={11} className="text-white" />
								</span>
							)}
							<div className="mb-3"><g.Icon size={32} className="text-[var(--text-2)]" /></div>
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
					<AIButton
						onClick={() => setStep(7)}
						className="px-6 py-2.5 rounded-xl text-sm font-semibold"
					>
						Continue →
					</AIButton>
				</div>
			</div>
		</div>
	)
}
