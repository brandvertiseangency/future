'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, CreditCard, Shield, Palette,
  Check, Loader2, LogOut, Sparkles, ChevronRight,
  Globe, Lock, ArrowUpRight, Zap,
} from 'lucide-react'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'billing',       label: 'Billing',        icon: CreditCard },
  { id: 'brand',         label: 'Brand Identity', icon: Palette },
  { id: 'security',      label: 'Security',       icon: Shield },
]

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

/* ── Shared primitives ── */
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="pb-1">
      <h3 className="text-[18px] font-semibold tracking-tight text-white/90 leading-none mb-1.5">{title}</h3>
      <p className="text-[12.5px] text-white/30">{desc}</p>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10.5px] font-semibold uppercase tracking-[0.09em] text-white/28">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/20">{hint}</p>}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3',
        'text-[13.5px] text-white/80 placeholder:text-white/18',
        'focus:outline-none focus:border-white/[0.22] focus:bg-white/[0.06]',
        'transition-all duration-150',
        props.readOnly && 'opacity-40 cursor-not-allowed',
        className,
      )}
    />
  )
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150',
        saved
          ? 'bg-white/[0.06] text-white/50 border border-white/[0.08]'
          : 'btn-silver',
      )}
    >
      {saving && <Loader2 size={13} className="animate-spin" />}
      {saved && <Check size={13} />}
      {saved ? 'Saved' : saving ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════ */
function ProfileSection() {
  const { user } = useAuth()
  const { data } = useSWR(
    '/api/users/me',
    fetcher<{ user: { display_name?: string; email?: string; website?: string; avatar_url?: string } }>,
  )
  const me = data?.user
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
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
      const { updateProfile } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('@/lib/firebase')
      const auth = getFirebaseAuth()
      if (auth?.currentUser) await updateProfile(auth.currentUser, { displayName: name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* noop */ } finally { setSaving(false) }
  }

  const initials = (name || user?.displayName || 'U').charAt(0).toUpperCase()
  const email = user?.email ?? me?.email ?? ''

  return (
    <div className="space-y-5">
      <SectionHeader title="Profile" desc="Manage your account details" />
      {/* Avatar row */}
      <div className="bento-card p-4 flex items-center gap-4">
        {me?.avatar_url
          ? <img src={me.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
          : (
            <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white/80 ring-1 ring-white/08"
              style={{ background: 'linear-gradient(135deg,#222 0%,#111 100%)', fontSize: 15 }}>
              {initials}
            </div>
          )}
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-white/85 truncate">{name || 'Creator'}</p>
          <p className="text-[11.5px] text-white/28 mt-0.5 truncate">{email}</p>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 flex-shrink-0" />
      </div>
      {/* Fields */}
      <div className="bento-card p-5 space-y-4">
        <Field label="Full Name">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </Field>
        <Field label="Email" hint="Email address cannot be changed here">
          <Input value={email} readOnly />
        </Field>
        <Field label="Website">
          <div className="relative">
            <Globe size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/22 pointer-events-none" />
            <Input value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="https://mybrand.com" className="pl-9" />
          </div>
        </Field>
      </div>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   BILLING
═══════════════════════════════════════════════════════ */
function BillingSection() {
  const { data } = useSWR(
    '/api/credits/balance',
    fetcher<{ balance: number; plan: string; trial_days_left?: number }>,
  )
  const balance = data?.balance ?? 0
  const plan = data?.plan ?? 'trial'
  const trialDays = data?.trial_days_left ?? 14
  const maxCredits = plan === 'pro' ? 5000 : plan === 'starter' ? 1000 : 500
  const planLabel = plan === 'trial' ? 'Free Trial' : plan.charAt(0).toUpperCase() + plan.slice(1)
  const pct = Math.min(100, (balance / maxCredits) * 100)

  return (
    <div className="space-y-5">
      <SectionHeader title="Billing" desc="Manage your plan and credits" />

      {/* Current plan — hero */}
      <div className="bento-hero" style={{ padding: 1 }}>
        <div className="bento-hero-inner" style={{ background: '#0d0d0d', padding: '20px' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5">Current Plan</p>
              <p className="text-[26px] font-bold tracking-tight text-white leading-none">{planLabel}</p>
              <p className="text-[12px] text-white/30 mt-1.5">
                {plan === 'trial' ? `${trialDays} days remaining · ` : ''}{balance.toLocaleString()} credits left
              </p>
            </div>
            <span className={cn(
              'px-2.5 py-1 rounded-full text-[10.5px] font-semibold border mt-0.5',
              plan === 'pro'
                ? 'bg-white/[0.07] border-white/[0.18] text-white/80'
                : plan === 'trial'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            )}>{planLabel}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.8) 100%)' }} />
          </div>
          <p className="text-[11px] text-white/22 mt-1.5">{balance.toLocaleString()} / {maxCredits.toLocaleString()} credits</p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Starter', price: '₹999',   features: ['1,000 credits/mo', '3 brands', 'Basic analytics'], highlight: false },
          { name: 'Pro',     price: '₹2,499', features: ['5,000 credits/mo', 'Unlimited brands', 'Advanced analytics'], highlight: true },
        ].map(p => (
          <div key={p.name} className={cn('bento-card p-5', p.highlight && 'border-white/[0.14]')}>
            {p.highlight && (
              <div className="flex items-center gap-1.5 mb-3">
                <Zap size={10} className="text-white/35" />
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/28">Most Popular</span>
              </div>
            )}
            <p className="text-[15px] font-bold text-white/85">{p.name}</p>
            <p className="text-[26px] font-bold tracking-tight text-white leading-none my-1.5">
              {p.price}<span className="text-[12px] font-normal text-white/28">/mo</span>
            </p>
            <ul className="space-y-2 mb-4 mt-3">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-[12px] text-white/40">
                  <Check size={10} className="text-white/45 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button className={cn(
              'w-full py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-150',
              p.highlight
                ? 'btn-silver'
                : 'border border-white/[0.09] text-white/40 hover:text-white/65 hover:border-white/[0.16] hover:bg-white/[0.04]',
            )}>
              Upgrade to {p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════════════ */
function NotificationsSection() {
  const PREFS = [
    { id: 'post_scheduled', label: 'Post scheduled', desc: 'When a post is queued for publishing' },
    { id: 'post_published', label: 'Post published',  desc: 'When a post goes live' },
    { id: 'credits_low',    label: 'Low credits',     desc: 'When credits drop below 50' },
    { id: 'weekly_digest',  label: 'Weekly digest',   desc: 'Weekly performance summary' },
  ]
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    post_scheduled: true, post_published: true, credits_low: true, weekly_digest: false,
  })

  return (
    <div className="space-y-5">
      <SectionHeader title="Notifications" desc="Control when and how you get notified" />
      <div className="space-y-2">
        {PREFS.map(pref => (
          <div key={pref.id} className="bento-card flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-[13px] font-medium text-white/80">{pref.label}</p>
              <p className="text-[11.5px] text-white/28 mt-0.5">{pref.desc}</p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setEnabled(e => ({ ...e, [pref.id]: !e[pref.id] }))}
              className={cn(
                'relative flex-shrink-0 rounded-full border transition-all duration-200',
                enabled[pref.id] ? 'bg-white border-white/80' : 'bg-white/[0.06] border-white/[0.10]',
              )}
              style={{ width: 38, height: 22 }}
            >
              <span className={cn(
                'absolute top-[3px] w-4 h-4 rounded-full shadow-sm transition-all duration-200',
                enabled[pref.id] ? 'bg-black left-[19px]' : 'bg-white/40 left-[3px]',
              )} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   BRAND IDENTITY
═══════════════════════════════════════════════════════ */
function BrandSection() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Brand Identity" desc="Configure your brand visual settings" />
      <div className="bento-card p-10 text-center">
        <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
          <Palette size={16} className="text-white/28" />
        </div>
        <p className="text-[13px] text-white/40 mb-1">Manage from the brand wizard</p>
        <p className="text-[11.5px] text-white/20">Configure logos, colours, tone of voice and more</p>
        <a href="/onboarding"
          className="inline-flex items-center gap-1.5 mt-5 text-[12px] text-white/35 hover:text-white/65 transition-colors">
          Open Brand Setup <ArrowUpRight size={11} />
        </a>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SECURITY
═══════════════════════════════════════════════════════ */
function SecuritySection() {
  const { user, signOut } = useAuth()
  const [pw, setPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const changePassword = async () => {
    if (newPw.length < 8) { setMsg({ text: 'Password must be at least 8 characters', ok: false }); return }
    setSaving(true)
    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('@/lib/firebase')
      const auth = getFirebaseAuth()
      if (!user || !auth?.currentUser) { setMsg({ text: 'Not signed in.', ok: false }); return }
      const cred = EmailAuthProvider.credential(user.email!, pw)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, newPw)
      setMsg({ text: 'Password updated successfully.', ok: true })
      setPw(''); setNewPw('')
    } catch {
      setMsg({ text: 'Incorrect current password.', ok: false })
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <SectionHeader title="Security" desc="Manage your password and account access" />

      <div className="bento-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
          <Lock size={12} className="text-white/28" />
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/28">Change Password</p>
        </div>
        <Field label="Current Password">
          <Input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="New Password" hint="Minimum 8 characters">
          <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
        </Field>
        {msg && (
          <p className={cn('text-[12px]', msg.ok ? 'text-emerald-400' : 'text-red-400/80')}>{msg.text}</p>
        )}
        <SaveButton saving={saving} saved={false} onClick={changePassword} />
      </div>

      {/* Danger zone */}
      <div className="bento-card p-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/28 mb-3 pb-3 border-b border-white/[0.05]">
          Account
        </p>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12.5px] text-red-400/70
                     hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent
                     hover:border-red-500/[0.10] transition-all duration-150"
        >
          <LogOut size={13} />
          Sign out of all devices
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   PAGE SHELL
═══════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [active, setActive] = useState('profile')

  const renderSection = () => {
    switch (active) {
      case 'profile':       return <ProfileSection />
      case 'billing':       return <BillingSection />
      case 'notifications': return <NotificationsSection />
      case 'brand':         return <BrandSection />
      case 'security':      return <SecuritySection />
      default:              return null
    }
  }

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8 pb-24 space-y-7">

      {/* Page hero header */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-white/20 uppercase tracking-[0.12em] mb-3">
          <Sparkles size={9} strokeWidth={1.5} />
          Account
        </div>
        <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-white leading-[1.1]">Settings</h1>
        <p className="text-[13px] text-white/30 mt-1.5">Manage your account and preferences</p>
      </div>

      <div className="flex gap-5 items-start">

        {/* Sidebar */}
        <nav className="w-44 flex-shrink-0 space-y-0.5 sticky top-6">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                'w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl',
                'text-[12.5px] font-medium transition-all duration-150',
                active === id
                  ? 'bg-white/[0.07] text-white/90 border border-white/[0.10]'
                  : 'text-white/32 hover:text-white/60 hover:bg-white/[0.03]',
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={13} className="flex-shrink-0" />
                {label}
              </span>
              {active === id && <ChevronRight size={11} className="text-white/22 flex-shrink-0" />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
