'use client'

import { Rocket, DollarSign, MessageSquare, Megaphone } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { GoalPriorityPicker } from '@/components/onboarding/controls/goal-priority-picker'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

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
		<div className="flex h-full flex-col">
			<StepHeader
				eyebrow="Step 7"
				title="Business goals"
				description="Prioritize outcomes so AI can optimize content strategy decisions."
			/>

			<div className="mt-6 space-y-5">
				<GoalPriorityPicker
					options={GOALS.map((g) => ({ id: g.id, label: g.label, description: g.desc }))}
					selected={data.goals || []}
					onToggle={toggle}
				/>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{GOALS.map((g) => (
						<div key={g.id} className="rounded-lg border border-border bg-muted/30 p-3">
							<g.Icon size={16} className="text-foreground" />
							<p className="mt-1 text-xs font-medium text-foreground">{g.label}</p>
						</div>
					))}
				</div>
			</div>

			<StepFooter
				onBack={() => setStep(6)}
				onSkip={() => setStep(8)}
				onContinue={() => setStep(8)}
			/>
		</div>
	)
}
