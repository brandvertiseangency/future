import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AgentId = 'website-builder' | 'branding-kit' | 'presentations'

interface AgentsStore {
  unlockedAgents: AgentId[]
  unlockAgent: (id: AgentId) => void
  isUnlocked: (id: AgentId) => boolean
  reset: () => void
}

export const useAgentsStore = create<AgentsStore>()(
  persist(
    (set, get) => ({
      unlockedAgents: [],
      unlockAgent: (id) =>
        set((state) => ({
          unlockedAgents: state.unlockedAgents.includes(id)
            ? state.unlockedAgents
            : [...state.unlockedAgents, id],
        })),
      isUnlocked: (id) => get().unlockedAgents.includes(id),
      reset: () => set({ unlockedAgents: [] }),
    }),
    { name: 'brandvertise-agents' }
  )
)
