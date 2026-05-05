import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import type { AgentId } from '@/stores/agents'
import { useAgentsStore } from '@/stores/agents'

/** Pro-tier plans that unlock all agent tools (matches billing copy on agent overlay). */
export function planUnlocksAgents(plan?: string | null): boolean {
  const p = (plan || '').toLowerCase()
  return p === 'pro' || p === 'agency' || p === 'business'
}

export function useAgentUnlocked(agentId: AgentId): boolean {
  const { data } = useSWR('/api/credits/balance', (url: string) => apiCall<{ plan?: string }>(url), {
    revalidateOnFocus: false,
  })
  const storeUnlocked = useAgentsStore((s) => s.unlockedAgents.includes(agentId))
  return planUnlocksAgents(data?.plan) || storeUnlocked
}
