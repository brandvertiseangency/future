'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { CreditCard, User } from 'lucide-react'
import useSWR from 'swr'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { logUxEvent } from '@/lib/ux-events'
import { BrandIdentityEditor } from '@/components/brand/brand-identity-editor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type SettingsTab = 'profile' | 'brand' | 'billing' | 'notifications' | 'security'

function tabFromHash(hash: string): SettingsTab {
  const h = hash.replace(/^#/, '').toLowerCase()
  if (h === 'brand') return 'brand'
  if (h === 'billing') return 'billing'
  if (h === 'notifications') return 'notifications'
  if (h === 'security') return 'security'
  if (h === 'profile') return 'profile'
  return 'profile'
}

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Failed to update profile'
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.details === 'string' && parsed.details.trim()) return parsed.details
    if (typeof parsed?.message === 'string' && parsed.message.trim()) return parsed.message
    if (typeof parsed?.error === 'string' && parsed.error.trim()) return parsed.error
  } catch {
    // ignore parse errors
  }
  return raw
}

type UserPreferences = {
  email_post_reminder?: boolean | null
  email_credit_warning?: boolean | null
  email_weekly_digest?: boolean | null
  email_product_updates?: boolean | null
  inapp_post_reminder?: boolean | null
  inapp_credit_warning?: boolean | null
}

export default function SettingsPage() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [name, setName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [currentPw, setCurrentPw] = useState('')
  const [nextPw, setNextPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  const { data: meData, mutate: mutateMe } = useSWR('/api/users/me', (url: string) => apiCall<{ user?: { display_name?: string; email?: string } }>(url), { revalidateOnFocus: false })
  const { data: billingData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number; plan: string; trial_days_left?: number | null }>(url), { revalidateOnFocus: false })
  const { data: prefData, mutate: mutatePrefs } = useSWR(
    '/api/users/me/preferences',
    (url: string) => apiCall<{ preferences: UserPreferences | null }>(url),
    { revalidateOnFocus: false }
  )

  const credits = billingData?.balance ?? 0
  const plan = billingData?.plan ?? 'trial'
  const trialDays = billingData?.trial_days_left
  const baselineName = meData?.user?.display_name ?? user?.displayName ?? ''
  const nameTooShort = name.trim().length > 0 && name.trim().length < 2
  const canSave = name.trim().length >= 2 && name.trim() !== baselineName.trim() && !savingProfile

  const prefs = prefData?.preferences ?? {}

  const syncTabFromHash = useCallback(() => {
    if (typeof window === 'undefined') return
    setActiveTab(tabFromHash(window.location.hash || '#profile'))
  }, [])

  useEffect(() => {
    syncTabFromHash()
    window.addEventListener('hashchange', syncTabFromHash)
    return () => window.removeEventListener('hashchange', syncTabFromHash)
  }, [pathname, syncTabFromHash])

  const onTabChange = (value: string) => {
    const v = value as SettingsTab
    setActiveTab(v)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${pathname}#${v}`)
    }
  }

  useEffect(() => {
    const dbName = meData?.user?.display_name
    const dbEmail = meData?.user?.email
    if (dbName) {
      setName(dbName)
    } else if (user?.displayName) {
      setName(user.displayName)
    }
    if (dbEmail) {
      setEmail(dbEmail)
    } else if (user?.email) {
      setEmail(user.email)
    }
  }, [meData?.user?.display_name, meData?.user?.email, user?.displayName, user?.email])

  const saveProfile = async () => {
    if (!canSave) {
      logUxEvent('settings_profile_validation_blocked', {
        nameLength: name.trim().length,
        unchanged: name.trim() === baselineName.trim(),
      })
      return
    }
    setSavingProfile(true)
    setSaveState('saving')
    try {
      await apiCall('/api/users/me', { method: 'PATCH', body: JSON.stringify({ display_name: name.trim() }) })
      await mutateMe()
      setLastSavedAt(new Date().toLocaleTimeString())
      setSaveState('saved')
      toast.success('Profile updated')
    } catch (error) {
      setSaveState('error')
      toast.error(parseApiError(error))
    } finally {
      setSavingProfile(false)
    }
  }

  const patchPreferences = async (patch: Partial<UserPreferences>) => {
    const merged = { ...prefs, ...patch }
    try {
      await apiCall('/api/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          emailPostReminder: Boolean(merged.email_post_reminder),
          emailCreditWarning: Boolean(merged.email_credit_warning),
          emailWeeklyDigest: Boolean(merged.email_weekly_digest),
          emailProductUpdates: Boolean(merged.email_product_updates),
          inappPostReminder: Boolean(merged.inapp_post_reminder),
          inappCreditWarning: Boolean(merged.inapp_credit_warning),
        }),
      })
      await mutatePrefs()
    } catch (e) {
      toast.error(parseApiError(e))
    }
  }

  const isPasswordProvider = Boolean(user?.providerData?.some((p) => p.providerId === 'password'))

  const changePassword = async () => {
    if (!user?.email || !isPasswordProvider) {
      toast.error('Password change is only available for email & password accounts.')
      return
    }
    if (nextPw.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }
    if (nextPw !== confirmPw) {
      toast.error('New password and confirmation do not match.')
      return
    }
    const auth = getFirebaseAuth()
    if (!auth?.currentUser) {
      toast.error('You are not signed in.')
      return
    }
    setPwBusy(true)
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, nextPw)
      setCurrentPw('')
      setNextPw('')
      setConfirmPw('')
      toast.success('Password updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update password')
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="settings"
        title="Configure your workspace settings"
        description="Profile, brand identity, billing, notifications, and security live in one place."
      />
      <PageHeader
        variant="compact"
        title={<>Workspace <span className="text-pull text-primary">settings</span></>}
        description="Manage profile, brand identity, billing, notifications, and security."
      />

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
        <TabsList className="grid h-auto w-full max-w-3xl grid-cols-2 gap-1 rounded-xl border border-border/65 bg-card/70 p-1 backdrop-blur-sm sm:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div id="profile" className="scroll-mt-20">
            <SectionCard title="Compliance" subtitle="Policies and reporting.">
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/legal/acceptable-use" className="font-medium text-foreground underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  Acceptable Use Policy
                </Link>
                <Link href="/legal/report-content" className="font-medium text-foreground underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  Report content
                </Link>
              </div>
            </SectionCard>

            <SectionCard title="Profile" subtitle="Update your account information.">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={name} onChange={(e) => setName(e.target.value)} className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none ${nameTooShort ? 'border-red-300 focus:border-red-500' : 'border-border focus:border-primary'}`} />
                  </div>
                  {nameTooShort ? <p className="mt-1 text-xs text-red-600">Name must be at least 2 characters.</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                  <input value={email} readOnly className="h-10 w-full rounded-lg border border-border/65 bg-card/70 px-3 text-sm text-muted-foreground" />
                </div>
              </div>
              <Button className="mt-4" onClick={saveProfile} disabled={!canSave}>
                {savingProfile ? 'Saving...' : canSave ? 'Save Profile' : 'Saved'}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {saveState === 'saving' ? 'Saving changes...' : saveState === 'saved' ? `Saved at ${lastSavedAt}` : saveState === 'error' ? 'Save failed. Please retry.' : 'No unsaved changes.'}
              </p>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <div id="brand" className="scroll-mt-20 space-y-3">
            <SectionCard title="Brand identity" subtitle="Same editor as before — lives here so your overview page stays read-only.">
              <p className="mb-3 text-sm text-muted-foreground">
                Public summary: <Link href="/brand" className="font-medium text-foreground underline underline-offset-2">Brand overview</Link>
              </p>
            </SectionCard>
            <BrandIdentityEditor embedded />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div id="billing" className="scroll-mt-20 space-y-4">
            <SectionCard title="Current plan" subtitle="Your active subscription and remaining credits.">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-border/65 bg-card/72 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Plan</p>
                  <p className="mt-2 text-xl font-bold capitalize text-foreground">{plan}</p>
                  {plan === 'trial' && trialDays != null ? (
                    <p className="mt-1 text-xs text-muted-foreground">{trialDays} trial days remaining</p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground capitalize">{plan} features active</p>
                  )}
                </div>
                <div className="rounded-xl border border-border/65 bg-card/72 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Credits</p>
                  <p className="mt-2 text-xl font-bold tabular-nums text-foreground">{credits.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Available to generate content</p>
                </div>
                <div className="rounded-xl border border-border/65 bg-card/72 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Value</p>
                  <p className="mt-2 text-xl font-bold text-foreground">₹{Math.round(credits * 12).toLocaleString('en-IN')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Indicative equivalent</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Upgrade" subtitle="Unlock higher credit limits, more agents, and priority generation.">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-foreground">Move to a paid plan for full access to the Brandvertise platform.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pro: 5,000 credits/mo &nbsp;·&nbsp; Agency: 15,000 credits/mo + team seats</p>
                </div>
                <Button onClick={() => window.location.assign('/pricing')} className="shrink-0">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View pricing
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Payment" subtitle="Secure checkout via Razorpay (India). Payments coming soon.">
              <div className="flex flex-wrap items-start gap-4">
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center flex-1 min-w-[200px]">
                  <p className="text-sm font-medium text-foreground">Razorpay checkout</p>
                  <p className="mt-1 text-xs text-muted-foreground">Direct payment integration launching soon. Use the pricing page to express interest.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div id="notifications" className="scroll-mt-20">
            <SectionCard title="Notifications" subtitle="Email and in-app preferences. Changes save immediately.">
              <div className="space-y-4">
                {[
                  { key: 'email_post_reminder' as const, label: 'Email: post reminders' },
                  { key: 'email_credit_warning' as const, label: 'Email: credit warnings' },
                  { key: 'email_weekly_digest' as const, label: 'Email: weekly digest' },
                  { key: 'email_product_updates' as const, label: 'Email: product updates' },
                  { key: 'inapp_post_reminder' as const, label: 'In-app: post reminders' },
                  { key: 'inapp_credit_warning' as const, label: 'In-app: credit warnings' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                    <Label htmlFor={key} className="text-sm text-foreground">
                      {label}
                    </Label>
                    <Switch
                      id={key}
                      checked={Boolean(prefs[key])}
                      onCheckedChange={(checked) => void patchPreferences({ [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div id="security" className="scroll-mt-20 space-y-4">
            <SectionCard title="Password" subtitle="For accounts that use email and password with Firebase.">
              {!isPasswordProvider ? (
                <p className="text-sm text-muted-foreground">You signed in with a social provider. Manage the password from that provider&apos;s security settings.</p>
              ) : (
                <div className="grid max-w-md grid-cols-1 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Current password</label>
                    <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" autoComplete="current-password" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">New password</label>
                    <input type="password" value={nextPw} onChange={(e) => setNextPw(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Confirm new password</label>
                    <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" autoComplete="new-password" />
                  </div>
                  <Button type="button" disabled={pwBusy} onClick={() => void changePassword()}>
                    {pwBusy ? 'Updating…' : 'Update password'}
                  </Button>
                </div>
              )}
            </SectionCard>
            <SectionCard title="Active sessions" subtitle="Server-side session listing.">
              <p className="text-sm text-muted-foreground">Coming soon: revoke other devices when user_sessions is available.</p>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
