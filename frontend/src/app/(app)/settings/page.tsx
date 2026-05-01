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
      <PageHeader title="Settings" description="Manage profile, brand, billing, and integrations." />

      <div className="grid grid-cols-1 gap-4">
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

        <SectionCard title="Brand Settings" subtitle="Update brand profile and design preferences.">
          <a href="/brand">
            <Button variant="secondary">Edit Brand</Button>
          </a>
        </SectionCard>

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

        <SectionCard title="API / Integrations" subtitle="Reserved for future integrations and developer setup.">
          <p className="text-sm text-[#6B7280]">Coming soon: API keys, webhooks, and third-party integrations.</p>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
