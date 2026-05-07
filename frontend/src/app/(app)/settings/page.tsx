'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  User,
  BriefcaseBusiness,
  CreditCard,
  Bell,
  ShieldCheck,
  Check,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  ExternalLink,
} from 'lucide-react'
import useSWR from 'swr'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { BrandIdentityEditor } from '@/components/brand/brand-identity-editor'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

type SettingsTab = 'profile' | 'brand' | 'billing' | 'notifications' | 'security'

function tabFromHash(hash: string): SettingsTab {
  const h = hash.replace(/^#/, '').toLowerCase()
  if (['brand', 'billing', 'notifications', 'security', 'profile'].includes(h)) return h as SettingsTab
  return 'profile'
}

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Failed'
  try {
    const p = JSON.parse(raw)
    return p?.details ?? p?.message ?? p?.error ?? raw
  } catch { return raw }
}

type UserPreferences = {
  email_post_reminder?: boolean | null
  email_credit_warning?: boolean | null
  email_weekly_digest?: boolean | null
  email_product_updates?: boolean | null
  inapp_post_reminder?: boolean | null
  inapp_credit_warning?: boolean | null
}

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'brand', label: 'Brand', icon: <BriefcaseBusiness size={16} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
]

const PLAN_FEATURES: Record<string, string[]> = {
  trial: ['500 credits', '12 posts/month', 'Basic generation', 'Calendar planning'],
  pro: ['5,000 credits/mo', '30 posts/month', 'High-res generation', 'Priority AI', 'Advanced analytics', 'All Marketing Studio'],
  agency: ['15,000 credits/mo', '60 posts/month', 'Team seats', 'White-label', 'API access', 'Dedicated support'],
}

export default function SettingsPage() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  // Profile state
  const [name, setName] = useState(user?.displayName ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Security state
  const [currentPw, setCurrentPw] = useState('')
  const [nextPw, setNextPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  const { data: meData, mutate: mutateMe } = useSWR('/api/users/me', (url: string) => apiCall<{ user?: { display_name?: string; email?: string } }>(url), { revalidateOnFocus: false })
  const { data: billingData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number; plan: string; trial_days_left?: number | null }>(url), { revalidateOnFocus: false })
  const { data: prefData, mutate: mutatePrefs } = useSWR('/api/users/me/preferences', (url: string) => apiCall<{ preferences: UserPreferences | null }>(url), { revalidateOnFocus: false })

  const credits = billingData?.balance ?? 0
  const plan = billingData?.plan ?? 'trial'
  const trialDays = billingData?.trial_days_left
  const maxCredits = plan === 'pro' ? 5000 : plan === 'agency' ? 15000 : 500
  const creditPct = Math.min((credits / maxCredits) * 100, 100)
  const prefs = prefData?.preferences ?? {}

  const baselineName = meData?.user?.display_name ?? user?.displayName ?? ''
  const canSave = name.trim().length >= 2 && name.trim() !== baselineName.trim() && !savingProfile

  const syncTabFromHash = useCallback(() => {
    if (typeof window === 'undefined') return
    setActiveTab(tabFromHash(window.location.hash || '#profile'))
  }, [])

  useEffect(() => {
    syncTabFromHash()
    window.addEventListener('hashchange', syncTabFromHash)
    return () => window.removeEventListener('hashchange', syncTabFromHash)
  }, [pathname, syncTabFromHash])

  useEffect(() => {
    if (meData?.user?.display_name) setName(meData.user.display_name)
    else if (user?.displayName) setName(user.displayName)
  }, [meData?.user?.display_name, user?.displayName])

  const onTabChange = (tab: SettingsTab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `${pathname}#${tab}`)
  }

  const saveProfile = async () => {
    if (!canSave) return
    setSavingProfile(true)
    try {
      await apiCall('/api/users/me', { method: 'PATCH', body: JSON.stringify({ display_name: name.trim() }) })
      await mutateMe()
      toast.success('Profile updated')
    } catch (e) { toast.error(parseApiError(e)) } finally { setSavingProfile(false) }
  }

  const patchPreferences = async (patch: Partial<UserPreferences>) => {
    const merged = { ...prefs, ...patch }
    try {
      await apiCall('/api/users/me/preferences', { method: 'PUT', body: JSON.stringify({ emailPostReminder: Boolean(merged.email_post_reminder), emailCreditWarning: Boolean(merged.email_credit_warning), emailWeeklyDigest: Boolean(merged.email_weekly_digest), emailProductUpdates: Boolean(merged.email_product_updates), inappPostReminder: Boolean(merged.inapp_post_reminder), inappCreditWarning: Boolean(merged.inapp_credit_warning) }) })
      await mutatePrefs()
    } catch (e) { toast.error(parseApiError(e)) }
  }

  const isPasswordProvider = Boolean(user?.providerData?.some((p) => p.providerId === 'password'))

  const changePassword = async () => {
    if (!user?.email || !isPasswordProvider) { toast.error('Password change is only available for email/password accounts.'); return }
    if (nextPw.length < 8) { toast.error('New password must be at least 8 characters.'); return }
    if (nextPw !== confirmPw) { toast.error('Passwords do not match.'); return }
    const auth = getFirebaseAuth()
    if (!auth?.currentUser) { toast.error('You are not signed in.'); return }
    setPwBusy(true)
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, nextPw)
      setCurrentPw(''); setNextPw(''); setConfirmPw('')
      toast.success('Password updated')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not update password') } finally { setPwBusy(false) }
  }

  const initials = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()
  const userEmail = user?.email ?? meData?.user?.email ?? ''

  return (
    <PageContainer className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, brand, billing, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:items-start">
        {/* ── Sidebar tabs ── */}
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:w-full',
                activeTab === id
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* ── Content ── */}
        <div className="min-w-0 space-y-5">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <>
              {/* Avatar + info */}
              <div className="app-card-elevated p-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Profile</h2>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{name || 'Your Name'}</p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">{plan} plan</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Display Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn('h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none', name.trim().length > 0 && name.trim().length < 2 ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary')}
                    />
                    {name.trim().length > 0 && name.trim().length < 2 && (
                      <p className="mt-1 text-xs text-destructive">Name must be at least 2 characters.</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input value={userEmail} readOnly className="h-10 w-full rounded-lg border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground" />
                  </div>
                </div>
                <Button onClick={saveProfile} disabled={!canSave} className="gap-2">
                  {savingProfile ? 'Saving…' : canSave ? <><Check size={15} /> Save Changes</> : 'Saved'}
                </Button>
              </div>

              {/* Appearance */}
              <div className="app-card-elevated p-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Appearance</h2>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
                    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
                    { value: 'system', label: 'System', icon: <Laptop size={16} /> },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border py-4 text-sm font-medium transition-colors',
                        theme === t.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="app-card-elevated p-5 space-y-3">
                <h2 className="text-base font-semibold text-foreground">Compliance</h2>
                <div className="flex flex-col gap-2">
                  <Link href="/legal/acceptable-use" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    Acceptable Use Policy <ExternalLink size={12} />
                  </Link>
                  <Link href="/legal/report-content" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    Report content <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* BRAND */}
          {activeTab === 'brand' && (
            <div className="space-y-4">
              <div className="app-card-elevated p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Brand Identity</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">This is the same editor as Brand Setup — changes apply everywhere.</p>
                  </div>
                  <Link href="/brand" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    View overview <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
              <BrandIdentityEditor embedded />
            </div>
          )}

          {/* BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              {/* Current plan */}
              <div className="app-card-elevated p-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Current Plan</h2>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Sparkles size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold capitalize text-foreground">{plan} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {plan === 'trial' && trialDays != null ? `${trialDays} trial days remaining` : `${plan} features active`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold tabular-nums text-foreground">{credits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">credits remaining</p>
                  </div>
                </div>

                {/* Credit bar */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{credits.toLocaleString()} / {maxCredits.toLocaleString()} credits used</span>
                    <span className="font-semibold text-foreground">{Math.round(creditPct)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full rounded-full transition-all', creditPct < 15 ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${creditPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Plan comparison */}
              <div className="app-card-elevated p-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Choose a Plan</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(['trial', 'pro', 'agency'] as const).map((p) => {
                    const isCurrent = plan === p
                    const prices: Record<string, string> = { trial: 'Free', pro: '₹2,499/mo', agency: '₹7,499/mo' }
                    return (
                      <div
                        key={p}
                        className={cn(
                          'relative rounded-xl border p-4 transition-colors',
                          isCurrent ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card',
                        )}
                      >
                        {isCurrent && (
                          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <CheckCircle2 size={10} /> Current
                          </span>
                        )}
                        <p className="text-sm font-bold capitalize text-foreground">{p}</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{prices[p]}</p>
                        <ul className="mt-3 space-y-1.5">
                          {(PLAN_FEATURES[p] ?? []).map((f) => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Check size={11} className="shrink-0 text-primary" /> {f}
                            </li>
                          ))}
                        </ul>
                        {!isCurrent && (
                          <Button size="sm" className="mt-4 w-full" onClick={() => window.location.assign('/pricing')}>
                            Upgrade
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment */}
              <div className="app-card-elevated p-5 space-y-3">
                <h2 className="text-base font-semibold text-foreground">Payment</h2>
                <p className="text-sm text-muted-foreground">Secure payments via Razorpay. Integration launching soon.</p>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                  <CreditCard size={20} className="shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Razorpay checkout</p>
                    <p className="text-xs text-muted-foreground">Direct UPI, card, and net banking payments — coming soon.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="app-card-elevated p-5 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Changes save immediately.</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                {[
                  { key: 'email_post_reminder' as const, label: 'Post reminders', description: 'Remind me when scheduled posts are due' },
                  { key: 'email_credit_warning' as const, label: 'Credit warnings', description: 'Alert when credits are running low' },
                  { key: 'email_weekly_digest' as const, label: 'Weekly digest', description: 'Summary of your weekly content activity' },
                  { key: 'email_product_updates' as const, label: 'Product updates', description: 'New features and improvements' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Switch id={key} checked={Boolean(prefs[key])} onCheckedChange={(checked) => void patchPreferences({ [key]: checked })} />
                  </div>
                ))}
              </div>

              {/* In-app */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">In-App</p>
                {[
                  { key: 'inapp_post_reminder' as const, label: 'Post reminders', description: 'In-app alerts for scheduled posts' },
                  { key: 'inapp_credit_warning' as const, label: 'Credit warnings', description: 'In-app alerts when credits are low' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Switch id={key} checked={Boolean(prefs[key])} onCheckedChange={(checked) => void patchPreferences({ [key]: checked })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              {/* Password */}
              <div className="app-card-elevated p-5 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Password</h2>
                {!isPasswordProvider ? (
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">You signed in with a social provider. Manage your password from that provider&apos;s security settings.</p>
                  </div>
                ) : (
                  <div className="grid max-w-sm grid-cols-1 gap-3">
                    {[
                      { label: 'Current password', value: currentPw, onChange: setCurrentPw, auto: 'current-password' },
                      { label: 'New password', value: nextPw, onChange: setNextPw, auto: 'new-password' },
                      { label: 'Confirm new password', value: confirmPw, onChange: setConfirmPw, auto: 'new-password' },
                    ].map(({ label, value, onChange, auto }) => (
                      <div key={label}>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
                        <input type="password" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={auto} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                      </div>
                    ))}
                    <Button disabled={pwBusy} onClick={() => void changePassword()}>
                      {pwBusy ? 'Updating…' : 'Update Password'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Active sessions */}
              <div className="app-card-elevated p-5 space-y-3">
                <h2 className="text-base font-semibold text-foreground">Active Sessions</h2>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Current session</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Signed in as {userEmail}</p>
                </div>
                <p className="text-xs text-muted-foreground">Multi-session management coming soon.</p>
              </div>

              {/* Danger zone */}
              <div className="app-card-elevated border-destructive/30 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-destructive" />
                  <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
                </div>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <Button variant="destructive" size="sm" onClick={() => toast.error('Contact support@brandvertise.ai to delete your account.')}>
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
