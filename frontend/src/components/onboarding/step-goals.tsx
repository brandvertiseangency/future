'use client'

import { Rocket, DollarSign, MessageSquare, Megaphone } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { AIButton } from '@/components/ui/ai-button'
import { GoalPriorityPicker } from '@/components/onboarding/controls/goal-priority-picker'

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
				<h2 className="text-[#111111] font-semibold text-2xl tracking-tight">Business goals</h2>
				<p className="text-[#6B7280] text-sm mt-1">Prioritize outcomes so AI can optimize content strategy decisions.</p>
			</div>

			<GoalPriorityPicker
				options={GOALS.map((g) => ({ id: g.id, label: g.label, description: g.desc }))}
				selected={data.goals || []}
				onToggle={toggle}
			/>
			<div className="grid grid-cols-4 gap-3">
				{GOALS.map((g) => (
					<div key={g.id} className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-3">
						<g.Icon size={16} className="text-[#111111]" />
						<p className="mt-1 text-xs font-medium text-[#111111]">{g.label}</p>
					</div>
				))}
			</div>

			<div className="flex items-center justify-between pt-2">
				<button
					onClick={() => setStep(6)}
					className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors"
				>
					← Back
				</button>
				<div className="flex items-center gap-4">
					<button
						onClick={() => setStep(8)}
						className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors"
					>
						Skip for now →
					</button>
					<AIButton
						onClick={() => setStep(8)}
						className="px-6 py-2.5 rounded-xl text-sm font-semibold"
					>
						Continue →
					</AIButton>
				</div>
			</div>
		</div>
	)
}
