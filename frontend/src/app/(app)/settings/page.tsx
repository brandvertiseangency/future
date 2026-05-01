'use client'

import { useState } from 'react'
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

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.displayName ?? '')
  const [email] = useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const { data: billingData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number; plan: string }>(url), { revalidateOnFocus: false })
  const credits = billingData?.balance ?? 0
  const plan = billingData?.plan ?? 'trial'

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await apiCall('/api/users/me', { method: 'PATCH', body: JSON.stringify({ display_name: name }) })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
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

      <Tabs defaultValue="profile" className="space-y-4">
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
                <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-lg border border-[#E5E7EB] pl-9 pr-3 text-sm outline-none focus:border-[#111111]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Email</label>
              <input value={email} readOnly className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] px-3 text-sm text-[#6B7280]" />
            </div>
          </div>
          <Button className="mt-4" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </SectionCard>
        </TabsContent>

        <TabsContent value="brand">
        <SectionCard title="Brand Settings" subtitle="Update brand profile and design preferences.">
          <a href="/brand">
            <Button variant="secondary">Edit Brand</Button>
          </a>
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
