import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Industry =
  | 'real_estate' | 'restaurant_cafe' | 'fashion_clothing' | 'salon_beauty'
  | 'interior_design' | 'gym_fitness' | 'education_coaching' | 'ecommerce'
  | 'jewellery' | 'consultant' | 'other'

export type FontMood =
  | 'serif_elegant' | 'sans_modern' | 'display_bold' | 'script_personal' | 'mono_technical'

export type VibeStyle =
  | 'luxury' | 'energetic' | 'minimal' | 'playful' | 'bold'
  | 'trustworthy' | 'warm' | 'edgy' | 'inspirational' | 'professional'

export interface ContentMix {
  promotional: number
  educational: number
  testimonial: number
  bts: number
  festive: number
}

export interface ReferenceImage {
  url: string
  fileName: string
  analysed: boolean
}

export interface ProductItem {
  id: string                  // local uuid
  name: string                // e.g. "Signature Kurta Set"
  description: string         // AI context description
  price: string               // e.g. "₹2,499 · 20% off"
  category: string            // e.g. "ethnic wear"
  tags: string[]
  images: string[]            // base64 or upload URL (up to 4)
  visualDescription: string   // filled by Vision AI after analysis
  useIn: ('calendar' | 'image_generation' | 'social_ads')[]
  isPrimary: boolean
}

export interface ExtractedStyleProfile {
  extractedColors: string[]
  fontMoodDetected: string
  layoutStyle: string
  photographyStyle: string
  moodKeywords: string[]
  compositionStyle: string
  textDensity: string
  dominantAesthetic: string
}

// Legacy fields kept for backward compatibility
export interface OnboardingData {
  // Legacy v1 fields
  brandName: string
  description: string
  industry: Industry | ''
  tone: number
  voice: string
  styles: string[]
  ageRange: [number, number]
  gender: string
  location: string
  interests: string[]
  platforms: string[]
  goals: string[]
  visualStyle: string
  colors: string[]
  logoUrl: string
  productImageUrls: string[]
  referenceUrls: string[]

  // v2 extended fields — Step 1 Identity
  tagline: string
  city: string
  website: string
  industryLabel: string

  // v2 Step 3 Personality
  vibeStyles: VibeStyle[]
  personalityKeywords: string[]

  // v2 Step 4 Visual Identity
  colorPrimary: string
  colorSecondary: string
  colorAccent: string
  fontMood: FontMood | null

  // v2 Step 5 Audience
  audienceAgeMin: number
  audienceAgeMax: number
  audienceGender: 'mixed' | 'mostly_male' | 'mostly_female'
  audienceCity: string
  audienceRegion: 'metro' | 'tier2' | 'pan_india'
  audienceLifestyle: string[]

  // v2 Step 6 Industry Config
  industryAnswers: Record<string, string | string[] | boolean | number>
  uspKeywords: string[]
  priceSegment: 'budget' | 'mid' | 'premium' | 'luxury' | ''
  industrySubtype: string

  // v2 Step 7 References
  referenceImages: ReferenceImage[]
  referenceAnalysisComplete: boolean
  extractedStyleProfile: ExtractedStyleProfile | null

  // v2 Step 7.5 Product Library
  products: ProductItem[]

  // v2 Step 8 Calendar Prefs
  weeklyPostCount: number
  contentMix: ContentMix
  activePlatforms: string[]
  preferredPostingTimes: string[]
  autoSchedule: boolean
}

interface OnboardingStore {
  step: number
  data: OnboardingData
  setStep: (n: number) => void
  updateData: (partial: Partial<OnboardingData>) => void
  setIndustryAnswer: (key: string, value: string | string[] | boolean | number) => void
  addReferenceImage: (img: ReferenceImage) => void
  removeReferenceImage: (index: number) => void
  setExtractedStyleProfile: (profile: ExtractedStyleProfile) => void
  // Product Library
  addProduct: (product: ProductItem) => void
  updateProduct: (id: string, partial: Partial<ProductItem>) => void
  removeProduct: (id: string) => void
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
  tagline: '',
  city: '',
  website: '',
  industryLabel: '',
  vibeStyles: [],
  personalityKeywords: [],
  colorPrimary: '#000000',
  colorSecondary: '#ffffff',
  colorAccent: '',
  fontMood: null,
  audienceAgeMin: 22,
  audienceAgeMax: 45,
  audienceGender: 'mixed',
  audienceCity: '',
  audienceRegion: 'metro',
  audienceLifestyle: [],
  industryAnswers: {},
  uspKeywords: [],
  priceSegment: '',
  industrySubtype: '',
  referenceImages: [],
  referenceAnalysisComplete: false,
  extractedStyleProfile: null,
  products: [],
  weeklyPostCount: 4,
  contentMix: { promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 },
  activePlatforms: ['instagram'],
  preferredPostingTimes: ['09:00', '18:00'],
  autoSchedule: false,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      data: defaultData,
      setStep: (n) => set({ step: n }),
      updateData: (partial) =>
        set((state) => ({ data: { ...state.data, ...partial } })),
      setIndustryAnswer: (key, value) =>
        set((state) => ({
          data: {
            ...state.data,
            industryAnswers: { ...state.data.industryAnswers, [key]: value },
          },
        })),
      addReferenceImage: (img) =>
        set((state) => ({
          data: {
            ...state.data,
            referenceImages: [...state.data.referenceImages, img],
          },
        })),
      removeReferenceImage: (index) =>
        set((state) => ({
          data: {
            ...state.data,
            referenceImages: state.data.referenceImages.filter((_, i) => i !== index),
          },
        })),
      setExtractedStyleProfile: (profile) =>
        set((state) => ({
          data: {
            ...state.data,
            extractedStyleProfile: profile,
            referenceAnalysisComplete: true,
          },
        })),
      addProduct: (product) =>
        set((state) => ({
          data: {
            ...state.data,
            products: [...(Array.isArray(state.data.products) ? state.data.products : []), product],
          },
        })),
      updateProduct: (id, partial) =>
        set((state) => ({
          data: {
            ...state.data,
            products: (Array.isArray(state.data.products) ? state.data.products : []).map((p) =>
              p.id === id ? { ...p, ...partial } : p
            ),
          },
        })),
      removeProduct: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            products: (Array.isArray(state.data.products) ? state.data.products : []).filter((p) => p.id !== id),
          },
        })),
      reset: () => set({ step: 1, data: defaultData }),
    }),
    {
      name: 'brandvertise_onboarding_v2',
      partialize: (state) => ({ step: state.step, data: state.data }),
    }
  )
)
