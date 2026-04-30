'use client'

import { Lock } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'

const AGENTS = [
  { id: 'website', title: 'Website Agent', description: 'Build and optimize your website pages.' },
  { id: 'branding', title: 'Branding Agent', description: 'Generate kits, guidelines, and visual assets.' },
  { id: 'presentation', title: 'Presentation Agent', description: 'Create polished deck structures and slides.' },
  { id: 'analytics', title: 'Analytics Agent', description: 'Summarize growth and campaign performance.' },
]

export default function AgentsPage() {
  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Agents" description="Explore AI assistants for brand workflows." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-4 h-32 rounded-lg border border-[#E5E7EB] bg-[#F7F7F8]" />
            <h3 className="text-base font-semibold text-[#111111]">{agent.title}</h3>
            <p className="mt-1 text-sm text-[#6B7280]">{agent.description}</p>
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Button variant="secondary"><Lock className="mr-2 h-4 w-4" />Unlock</Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
