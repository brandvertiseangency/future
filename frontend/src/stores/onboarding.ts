import { create } from 'zustand'

export interface OnboardingData {
  // Step 1
  brandName: string
  website: string
  industry: string
  voice: string
  // Step 2
  ageRange: [number, number]
  gender: string
  locations: string[]
  interests: string[]
  // Step 3
  goals: string[]
  postFrequency: string
  // Step 4
  visualStyle: string
  colors: string[]
  // Step 5
  logoUrl?: string
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
  website: '',
  industry: '',
  voice: '',
  ageRange: [18, 45],
  gender: 'all',
  locations: [],
  interests: [],
  goals: [],
  postFrequency: 'daily',
  visualStyle: '',
  colors: [],
  productImageUrls: [],
  referenceUrls: [],
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  data: defaultData,
  setStep: (n) => set({ step: n }),
  updateData: (partial) =>
    set((state) => ({ data: { ...state.data, ...partial } })),
  reset: () => set({ step: 1, data: defaultData }),
}))
