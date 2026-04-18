import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingData {
  // Step 2 — Brand Identity
  brandName: string
  description: string
  industry: string
  // Step 3 — Brand Voice
  tone: number          // 0–100
  voice: string
  styles: string[]      // multi-select chips
  // Step 4 — Audience
  ageRange: [number, number]
  gender: string        // 'mostly-men' | 'mixed' | 'mostly-women'
  location: string
  interests: string[]
  // Step 5 — Platforms
  platforms: string[]
  // Step 6 — Goals
  goals: string[]
  // Design prefs (optional step)
  visualStyle: string
  colors: string[]
  // Uploads
  logoUrl: string
  productImageUrls: string[]
  referenceUrls: string[]
}

interface OnboardingStore {
  step: number
  data: OnboardingData
  setStep: (n: number) => void
  updateData: (partial: Partial<OnboardingData>) => void
  reset: () => void
}

const defaultData: OnboardingData = {
  brandName: '',
  description: '',
  industry: '',
  tone: 50,
  voice: '',
  styles: [],
  ageRange: [25, 44],
  gender: 'mixed',
  location: '',
  interests: [],
  platforms: [],
  goals: [],
  visualStyle: '',
  colors: [],
  logoUrl: '',
  productImageUrls: [],
  referenceUrls: [],
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      data: defaultData,
      setStep: (n) => set({ step: n }),
      updateData: (partial) =>
        set((state) => ({ data: { ...state.data, ...partial } })),
      reset: () => set({ step: 1, data: defaultData }),
    }),
    {
      name: 'brandvertise-onboarding',
      partialize: (state) => ({ step: state.step, data: state.data }),
    }
  )
)
