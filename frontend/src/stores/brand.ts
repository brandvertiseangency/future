import { create } from 'zustand'

export interface Brand {
  id: string
  name: string
  website?: string
  industry?: string
  voice?: string
  goals?: string[]
  audience?: Record<string, unknown>
  designPrefs?: Record<string, unknown>
  assets?: Record<string, unknown>
  credits?: number
}

interface BrandStore {
  currentBrand: Brand | null
  brands: Brand[]
  setBrand: (brand: Brand) => void
  addBrand: (brand: Brand) => void
}

export const useBrandStore = create<BrandStore>((set) => ({
  currentBrand: null,
  brands: [],
  setBrand: (brand) => set({ currentBrand: brand }),
  addBrand: (brand) =>
    set((state) => ({ brands: [...state.brands, brand] })),
}))
