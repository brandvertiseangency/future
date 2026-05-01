'use client'

import { Lock } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'

const AGENTS = [
  { id: 'website', title: 'Website Agent', description: 'Build and optimize your website pages.' },
  { id: 'branding', title: 'Branding Agent', description: 'Generate kits, guidelines, and visual assets.' },
  { id: 'presentation', title: 'Presentation Agent', description: 'Create polished deck structures and slides.' },
  { id: 'analytics', title: 'Analytics Agent', description: 'Summarize growth and campaign performance.' },
]

export default function AgentsPage() {
  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="agents"
        title="Meet your AI agent workspace"
        description="Each agent is built for a focused workflow, from websites to analytics."
      />
      <PageHeader title={<>AI <span className="text-highlight">Agents</span></>} description="Explore AI assistants for brand workflows." />
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
        <p className="text-sm font-medium text-[#111111]">Unlock all AI agents</p>
        <p className="mt-1 text-xs text-[#6B7280]">Get access to website, branding, presentations, and analytics workflows.</p>
        <Button className="mt-3">Upgrade to Pro</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="mb-4 h-36 rounded-lg border border-[#E5E7EB] bg-[#F7F7F8]" />
            <h3 className="text-base font-semibold text-[#111111]">{agent.title}</h3>
            <p className="mt-1 text-sm text-[#6B7280]">{agent.description}</p>
            <ul className="mt-3 space-y-1 text-xs text-[#6B7280]">
              <li>- Guided workflow templates</li>
              <li>- Brand-aware outputs</li>
              <li>- Export-ready assets</li>
              <li>- Use case: launch a campaign in minutes</li>
            </ul>
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Button variant="secondary"><Lock className="mr-2 h-4 w-4" />Unlock</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-4 text-sm text-[#6B7280]">
        Pro includes all premium agents, faster generation, and higher output limits.
      </div>
    </PageContainer>
  )
}
