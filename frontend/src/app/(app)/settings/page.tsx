'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, Palette, ChevronRight, Check } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'

const SECTIONS = [
	{ id: 'profile', label: 'Profile', icon: User },
	{ id: 'notifications', label: 'Notifications', icon: Bell },
	{ id: 'billing', label: 'Billing', icon: CreditCard },
	{ id: 'brand', label: 'Brand Identity', icon: Palette },
	{ id: 'security', label: 'Security', icon: Shield },
]

function ProfileSection() {
	const [saved, setSaved] = useState(false)
	const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Profile</h3>
				<p className="text-[var(--text-3)] text-sm">Manage your account details</p>
			</div>

			{/* Avatar */}
			<div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-base)]">
				<div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-blue-600
                        flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
					C
				</div>
				<div className="flex-1">
					<p className="text-[var(--text-1)] font-medium text-sm">Creator</p>
					<p className="text-[var(--text-3)] text-xs mt-0.5">hello@mybrand.com</p>
				</div>
				<button className="px-3 py-1.5 rounded-lg border border-[var(--border-base)] text-[var(--text-2)] text-xs
                           hover:bg-[var(--bg-muted)] hover:border-[var(--border-loud)] transition-all">
					Change photo
				</button>
			</div>

			{/* Fields */}
			<div className="space-y-4">
				{[
					{ label: 'Full Name', value: 'Creator', type: 'text' },
					{ label: 'Email', value: 'hello@mybrand.com', type: 'email' },
					{ label: 'Website', value: 'https://mybrand.com', type: 'url' },
				].map(({ label, value, type }) => (
					<div key={label}>
						<label className="block text-[var(--text-2)] text-sm font-medium mb-1.5">{label}</label>
						<input
							type={type}
							defaultValue={value}
							className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                         text-[var(--text-1)] text-sm placeholder:text-[var(--text-4)]
                         focus:outline-none focus:border-violet-500/50 focus:bg-[var(--bg-subtle)] transition-all"
						/>
					</div>
				))}
			</div>

			<ShimmerButton onClick={save} className="px-6 py-2.5 rounded-xl text-sm font-semibold">
				{saved ? <><Check size={14} className="mr-1.5" /> Saved!</> : 'Save Changes'}
			</ShimmerButton>
		</div>
	)
}

function BillingSection() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Billing</h3>
				<p className="text-[var(--text-3)] text-sm">Manage your plan and credits</p>
			</div>

			{/* Current plan */}
			<div className="rounded-xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden">
				<div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600" />
				<div className="p-5">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)] mb-1">Current Plan</p>
							<p className="text-[var(--text-1)] font-bold text-xl">Free Trial</p>
							<p className="text-[var(--text-3)] text-sm mt-1">14 days remaining · 247 credits left</p>
						</div>
						<span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-orange-500/10 border border-orange-500/20 text-orange-400">
							Trial
						</span>
					</div>

					<div className="mt-4 h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
						<div className="h-full w-[49%] rounded-full bg-gradient-to-r from-violet-600 to-violet-400" />
					</div>
					<p className="text-[11px] text-[var(--text-3)] mt-1.5">247 / 500 credits used</p>
				</div>
			</div>

			{/* Plans */}
			<div className="grid grid-cols-2 gap-3">
				{[
					{ name: 'Starter', price: '$19', features: ['1,000 credits/mo', '3 brands', 'Basic analytics'] },
					{ name: 'Pro', price: '$49', features: ['5,000 credits/mo', 'Unlimited brands', 'Advanced analytics'], highlight: true },
				].map((plan) => (
					<div key={plan.name}
						className={cn(
							'rounded-xl p-5 border transition-all',
							plan.highlight
								? 'border-violet-500/40 bg-violet-500/[0.06]'
								: 'border-[var(--border-base)] bg-[var(--card-bg)]'
						)}>
						<div className="flex items-center justify-between mb-3">
							<p className="text-[var(--text-1)] font-semibold">{plan.name}</p>
							{plan.highlight && (
								<span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium border border-violet-500/25">
									Popular
								</span>
							)}
						</div>
						<p className="text-2xl font-bold text-[var(--text-1)] mb-3">
							{plan.price}<span className="text-sm font-normal text-[var(--text-3)]">/mo</span>
						</p>
						<ul className="space-y-1.5 mb-4">
							{plan.features.map((f) => (
								<li key={f} className="flex items-center gap-2 text-[12px] text-[var(--text-2)]">
									<Check size={12} className="text-emerald-500 flex-shrink-0" />
									{f}
								</li>
							))}
						</ul>
						<button className={cn(
							'w-full py-2 rounded-lg text-sm font-medium transition-all',
							plan.highlight
								? 'bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30'
								: 'border border-[var(--border-base)] text-[var(--text-2)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)]'
						)}>
							Upgrade to {plan.name}
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

function PlaceholderSection({ title, desc }: { title: string; desc: string }) {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">{title}</h3>
				<p className="text-[var(--text-3)] text-sm">{desc}</p>
			</div>
			<div className="rounded-xl border border-[var(--border-base)] bg-[var(--card-bg)] p-8 text-center">
				<p className="text-[var(--text-3)] text-sm">Coming soon</p>
			</div>
		</div>
	)
}

export default function SettingsPage() {
	const [active, setActive] = useState('profile')

	const renderSection = () => {
		switch (active) {
			case 'profile': return <ProfileSection />
			case 'billing': return <BillingSection />
			case 'notifications': return <PlaceholderSection title="Notifications" desc="Control when and how you get notified" />
			case 'brand': return <PlaceholderSection title="Brand Identity" desc="Configure your brand's visual identity settings" />
			case 'security': return <PlaceholderSection title="Security" desc="Manage your password and security settings" />
			default: return null
		}
	}

	return (
		<div className="p-8 min-h-[calc(100vh-64px)]">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<h2 className="text-[var(--text-1)] font-semibold text-2xl">Settings</h2>
					<p className="text-[var(--text-3)] text-sm mt-1">Manage your account and preferences</p>
				</div>

				<div className="flex gap-8">
					{/* Nav sidebar */}
					<div className="w-52 flex-shrink-0">
						<nav className="space-y-1">
							{SECTIONS.map(({ id, label, icon: Icon }) => (
								<button
									key={id}
									onClick={() => setActive(id)}
									className={cn(
										'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl',
										'text-[13px] font-medium transition-all duration-150',
										active === id
											? 'bg-[var(--accent-muted)] text-[var(--text-1)] border border-[var(--accent)]/20'
											: 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-subtle)]'
									)}
								>
									<span className="flex items-center gap-3">
										<Icon size={15} className="flex-shrink-0" />
										{label}
									</span>
									{active === id && <ChevronRight size={14} className="text-[var(--text-3)]" />}
								</button>
							))}
						</nav>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<motion.div
							key={active}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
						>
							{renderSection()}
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	)
}
