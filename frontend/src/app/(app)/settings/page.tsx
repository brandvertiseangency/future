'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreditCard, User } from 'lucide-react'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { logUxEvent } from '@/lib/ux-events'

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

export default function SettingsPage() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const { data: meData, mutate: mutateMe } = useSWR('/api/users/me', (url: string) => apiCall<{ user?: { display_name?: string; email?: string } }>(url), { revalidateOnFocus: false })
  const { data: billingData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number; plan: string }>(url), { revalidateOnFocus: false })
  const credits = billingData?.balance ?? 0
  const plan = billingData?.plan ?? 'trial'
  const baselineName = meData?.user?.display_name ?? user?.displayName ?? ''
  const nameTooShort = name.trim().length > 0 && name.trim().length < 2
  const canSave = name.trim().length >= 2 && name.trim() !== baselineName.trim() && !savingProfile

  useEffect(() => {
    const syncTabFromHash = () => {
      if (typeof window === 'undefined') return
      if (window.location.hash === '#billing') setActiveTab('billing')
    }
    syncTabFromHash()
    window.addEventListener('hashchange', syncTabFromHash)
    return () => window.removeEventListener('hashchange', syncTabFromHash)
  }, [pathname])

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

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="settings"
        title="Configure your workspace settings"
        description="Manage profile, billing, and integrations from one organized hub."
      />
      <PageHeader title="Settings" description="Manage profile, brand, billing, and integrations." />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 max-w-[520px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
        <SectionCard title="Profile" subtitle="Update your account information.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <input value={name} onChange={(e) => setName(e.target.value)} className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none ${nameTooShort ? 'border-red-300 focus:border-red-500' : 'border-[#E5E7EB] focus:border-[#111111]'}`} />
              </div>
              {nameTooShort ? <p className="mt-1 text-xs text-red-600">Name must be at least 2 characters.</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Email</label>
              <input value={email} readOnly className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] px-3 text-sm text-[#6B7280]" />
            </div>
          </div>
          <Button className="mt-4" onClick={saveProfile} disabled={!canSave}>
            {savingProfile ? 'Saving...' : canSave ? 'Save Profile' : 'Saved'}
          </Button>
          <p className="mt-2 text-xs text-[#6B7280]">
            {saveState === 'saving' ? 'Saving changes...' : saveState === 'saved' ? `Saved at ${lastSavedAt}` : saveState === 'error' ? 'Save failed. Please retry.' : 'No unsaved changes.'}
          </p>
        </SectionCard>
        </TabsContent>

        <TabsContent value="brand">
        <SectionCard title="Brand Settings" subtitle="Update brand profile and design preferences.">
          <Link href="/brand">
            <Button variant="secondary">Edit Brand</Button>
          </Link>
        </SectionCard>
        </TabsContent>

        <TabsContent value="billing">
        <div id="billing" className="scroll-mt-20">
        <SectionCard title="Billing" subtitle="Manage your plan and credits.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] p-3">
              <p className="text-xs text-[#6B7280]">Current Plan</p>
              <p className="mt-1 text-lg font-semibold text-[#111111] capitalize">{plan}</p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] p-3">
              <p className="text-xs text-[#6B7280]">Credits</p>
              <p className="mt-1 text-lg font-semibold text-[#111111]">{credits}</p>
            </div>
          </div>
          <Button className="mt-4" onClick={() => window.location.assign('/pricing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </SectionCard>
        </div>
        </TabsContent>

        <TabsContent value="api">
        <SectionCard title="API / Integrations" subtitle="Reserved for future integrations and developer setup.">
          <p className="text-sm text-[#6B7280]">Coming soon: API keys, webhooks, and third-party integrations.</p>
        </SectionCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
