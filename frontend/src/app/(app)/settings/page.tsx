'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, Palette, ChevronRight, Check, Loader2, LogOut } from 'lucide-react'
import useSWR from 'swr'
import { AIButton } from '@/components/ui/ai-button'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'

const SECTIONS = [
	{ id: 'profile', label: 'Profile', icon: User },
	{ id: 'notifications', label: 'Notifications', icon: Bell },
	{ id: 'billing', label: 'Billing', icon: CreditCard },
	{ id: 'brand', label: 'Brand Identity', icon: Palette },
	{ id: 'security', label: 'Security', icon: Shield },
]

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

function ProfileSection() {
	const { user } = useAuth()
	const { data } = useSWR('/api/users/me', fetcher<{ user: { display_name?: string; email?: string; website?: string; avatar_url?: string } }>)
	const me = data?.user
	const [name, setName] = useState('')
	const [website, setWebsite] = useState('')
	const [saved, setSaved] = useState(false)
	const [saving, setSaving] = useState(false)

	// Initialise fields once data arrives
	const initialised = useRef(false)
	if (me && !initialised.current) {
		setName(me.display_name ?? user?.displayName ?? '')
		setWebsite(me.website ?? '')
		initialised.current = true
	}

	const save = async () => {
		setSaving(true)
		try {
			await apiCall('/api/users/me', { method: 'PATCH', body: JSON.stringify({ display_name: name, website }) })
			// Also update Firebase displayName
			const { updateProfile } = await import('firebase/auth')
			const { getFirebaseAuth } = await import('@/lib/firebase')
			const auth = getFirebaseAuth()
			if (auth?.currentUser) await updateProfile(auth.currentUser, { displayName: name })
			setSaved(true)
			setTimeout(() => setSaved(false), 2500)
		} catch {
			setSaved(false)
		} finally { setSaving(false) }
	}

	const initials = (name || user?.displayName || 'U').charAt(0).toUpperCase()
	const email = user?.email ?? me?.email ?? ''

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Profile</h3>
				<p className="text-[var(--text-3)] text-sm">Manage your account details</p>
			</div>
			<div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-base)]">
				{me?.avatar_url
					? <img src={me.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
					: <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">{initials}</div>
				}
				<div className="flex-1">
					<p className="text-[var(--text-1)] font-medium text-sm">{name || 'Creator'}</p>
					<p className="text-[var(--text-3)] text-xs mt-0.5">{email}</p>
				</div>
			</div>
			<div className="space-y-4">
				<div>
					<label className="block text-[var(--text-2)] text-sm font-medium mb-1.5">Full Name</label>
					<input type="text" value={name} onChange={(e) => setName(e.target.value)}
						className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                       text-[var(--text-1)] text-sm placeholder:text-[var(--text-4)]
                       focus:outline-none focus:border-[var(--ai-border)]/50 transition-all" />
				</div>
				<div>
					<label className="block text-[var(--text-2)] text-sm font-medium mb-1.5">Email</label>
					<input type="email" value={email} readOnly
						className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                       text-[var(--text-3)] text-sm opacity-60 cursor-not-allowed" />
				</div>
				<div>
					<label className="block text-[var(--text-2)] text-sm font-medium mb-1.5">Website</label>
					<input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
						placeholder="https://mybrand.com"
						className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                       text-[var(--text-1)] text-sm placeholder:text-[var(--text-4)]
                       focus:outline-none focus:border-[var(--ai-border)]/50 transition-all" />
				</div>
			</div>
			<AIButton onClick={save} disabled={saving}
				className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold">
				{saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
				{saved ? 'Saved!' : 'Save Changes'}
			</AIButton>
		</div>
	)
}

function BillingSection() {
	const { data } = useSWR('/api/credits/balance', fetcher<{ balance: number; plan: string; trial_days_left?: number }>)
	const balance = data?.balance ?? 0
	const plan = data?.plan ?? 'trial'
	const trialDays = data?.trial_days_left ?? 14
	const maxCredits = plan === 'pro' ? 5000 : plan === 'starter' ? 1000 : 500
	const planLabel = plan === 'trial' ? 'Free Trial' : plan.charAt(0).toUpperCase() + plan.slice(1)

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Billing</h3>
				<p className="text-[var(--text-3)] text-sm">Manage your plan and credits</p>
			</div>
			<div className="rounded-xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden">
				<div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-blue-600" />
				<div className="p-5">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)] mb-1">Current Plan</p>
							<p className="text-[var(--text-1)] font-bold text-xl capitalize">{planLabel}</p>
							{plan === 'trial' && <p className="text-[var(--text-3)] text-sm mt-1">{trialDays} days remaining · {balance} credits left</p>}
							{plan !== 'trial' && <p className="text-[var(--text-3)] text-sm mt-1">{balance} credits remaining</p>}
						</div>
						<span className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border',
							plan === 'pro' ? 'bg-[var(--ai-glow)] border-[var(--ai-border)] text-[var(--ai-color)]'
								: plan === 'trial' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
									: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')}>
							{planLabel}
						</span>
					</div>
					<div className="mt-4 h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
						<div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
							style={{ width: `${Math.min(100, (balance / maxCredits) * 100)}%` }} />
					</div>
					<p className="text-[11px] text-[var(--text-3)] mt-1.5">{balance} / {maxCredits} credits remaining</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				{[
					{ name: 'Starter', price: '₹999', features: ['1,000 credits/mo', '3 brands', 'Basic analytics'] },
					{ name: 'Pro', price: '₹2,499', features: ['5,000 credits/mo', 'Unlimited brands', 'Advanced analytics'], highlight: true },
				].map((p) => (
					<div key={p.name} className={cn('rounded-xl p-5 border transition-all',
						p.highlight ? 'border-[var(--ai-border)] bg-[var(--ai-color)]/[0.06]' : 'border-[var(--border-base)] bg-[var(--card-bg)]')}>
						<div className="flex items-center justify-between mb-3">
							<p className="text-[var(--text-1)] font-semibold">{p.name}</p>
							{p.highlight && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--ai-glow)] text-[var(--ai-color)] font-medium border border-[var(--ai-border)]">Popular</span>}
						</div>
						<p className="text-2xl font-bold text-[var(--text-1)] mb-3">{p.price}<span className="text-sm font-normal text-[var(--text-3)]">/mo</span></p>
						<ul className="space-y-1.5 mb-4">
							{p.features.map((f) => (
								<li key={f} className="flex items-center gap-2 text-[12px] text-[var(--text-2)]">
									<Check size={12} className="text-emerald-500 flex-shrink-0" />{f}
								</li>
							))}
						</ul>
						<button className={cn('w-full py-2 rounded-lg text-sm font-medium transition-all',
							p.highlight
								? 'bg-[var(--ai-glow)] border border-[var(--ai-border)] text-[var(--ai-color)] hover:bg-[var(--ai-color)]/30'
								: 'border border-[var(--border-base)] text-[var(--text-2)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)]')}>
							Upgrade to {p.name}
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

function NotificationsSection() {
	const prefs = [
		{ id: 'post_scheduled', label: 'Post scheduled', desc: 'When a post is queued for publishing' },
		{ id: 'post_published', label: 'Post published', desc: 'When a post goes live' },
		{ id: 'credits_low', label: 'Low credits', desc: 'When credits drop below 50' },
		{ id: 'weekly_digest', label: 'Weekly digest', desc: 'Weekly performance summary' },
	]
	const [enabled, setEnabled] = useState<Record<string, boolean>>({
		post_scheduled: true, post_published: true, credits_low: true, weekly_digest: false,
	})

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Notifications</h3>
				<p className="text-[var(--text-3)] text-sm">Control when and how you get notified</p>
			</div>
			<div className="space-y-2">
				{prefs.map((pref) => (
					<div key={pref.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-base)]">
						<div>
							<p className="text-[var(--text-1)] text-sm font-medium">{pref.label}</p>
							<p className="text-[var(--text-3)] text-xs mt-0.5">{pref.desc}</p>
						</div>
						<button onClick={() => setEnabled((e) => ({ ...e, [pref.id]: !e[pref.id] }))}
							className={cn('w-11 h-6 rounded-full border transition-all relative flex-shrink-0',
								enabled[pref.id] ? 'bg-[var(--ai-color)] border-[var(--ai-border)]' : 'bg-[var(--bg-muted)] border-[var(--border-base)]')}>
							<span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
								enabled[pref.id] ? 'left-[22px]' : 'left-0.5')} />
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

function SecuritySection() {
	const { user, signOut } = useAuth()
	const [pw, setPw] = useState('')
	const [newPw, setNewPw] = useState('')
	const [saving, setSaving] = useState(false)
	const [msg, setMsg] = useState('')

	const changePassword = async () => {
		if (newPw.length < 8) { setMsg('Password must be at least 8 characters'); return }
		setSaving(true)
		try {
			const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth')
			const { getFirebaseAuth } = await import('@/lib/firebase')
			const auth = getFirebaseAuth()
			if (!user || !auth?.currentUser) { setMsg('Not signed in.'); return }
			const cred = EmailAuthProvider.credential(user.email!, pw)
			await reauthenticateWithCredential(auth.currentUser, cred)
			await updatePassword(auth.currentUser, newPw)
			setMsg('Password updated successfully!')
			setPw(''); setNewPw('')
		} catch {
			setMsg('Incorrect current password.')
		} finally { setSaving(false) }
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Security</h3>
				<p className="text-[var(--text-3)] text-sm">Manage your password and account security</p>
			</div>
			<div className="space-y-4">
				{[
					{ label: 'Current Password', val: pw, set: setPw },
					{ label: 'New Password', val: newPw, set: setNewPw },
				].map(({ label, val, set }) => (
					<div key={label}>
						<label className="block text-[var(--text-2)] text-sm font-medium mb-1.5">{label}</label>
						<input type="password" value={val} onChange={(e) => set(e.target.value)}
							className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                         text-[var(--text-1)] text-sm focus:outline-none focus:border-[var(--ai-border)]/50 transition-all" />
					</div>
				))}
				{msg && <p className="text-sm text-[var(--ai-color)]">{msg}</p>}
				<AIButton onClick={changePassword} disabled={saving}
					className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold">
					{saving && <Loader2 size={14} className="animate-spin" />}
					Update Password
				</AIButton>
			</div>

			{/* Sign Out */}
			<div className="pt-4 border-t border-[var(--border-dim)]">
				<h4 className="text-[var(--text-2)] text-sm font-medium mb-2">Account</h4>
				<button
					onClick={signOut}
					className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400
									   hover:bg-red-500/10 transition-all duration-150"
				>
					<LogOut size={15} />
					Sign out of all devices
				</button>
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
			case 'notifications': return <NotificationsSection />
			case 'security': return <SecuritySection />
			case 'brand': return (
				<div className="space-y-6">
					<div>
						<h3 className="text-[var(--text-1)] font-semibold text-lg mb-1">Brand Identity</h3>
						<p className="text-[var(--text-3)] text-sm">Configure your brand visual settings</p>
					</div>
					<div className="rounded-xl border border-[var(--border-base)] bg-[var(--card-bg)] p-8 text-center">
						<p className="text-[var(--text-3)] text-sm">Manage brands from the dashboard or onboarding wizard</p>
					</div>
				</div>
			)
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
					<div className="w-52 flex-shrink-0">
						<nav className="space-y-1">
							{SECTIONS.map(({ id, label, icon: Icon }) => (
								<button key={id} onClick={() => setActive(id)}
									className={cn('w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl',
										'text-[13px] font-medium transition-all duration-150',
										active === id
											? 'bg-[var(--accent-muted)] text-[var(--text-1)] border border-[var(--accent)]/20'
											: 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-subtle)]')}>
									<span className="flex items-center gap-3">
										<Icon size={15} className="flex-shrink-0" />
										{label}
									</span>
									{active === id && <ChevronRight size={14} className="text-[var(--text-3)]" />}
								</button>
							))}
						</nav>
					</div>
					<div className="flex-1 min-w-0">
						<motion.div key={active}
							initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
							{renderSection()}
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	)
}
